import { prisma } from '../core/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { addHours } from 'date-fns';
import { sendEmail } from '../utils/email';

// SIGN UP
export async function signUp(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already registered');

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hash
    }
  });

  return user;
}

// LOGIN
export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid email or password');

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new Error('Invalid email or password');

  const accessToken = jwt.sign(
    { id: user.id },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken, user };
}

// REFRESH TOKEN
export async function refresh(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;

    const accessToken = jwt.sign(
      { id: payload.id },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: '15m' }
    );

    return { accessToken };
  } catch (err) {
    throw new Error('Invalid refresh token');
  }
}

// LOGOUT
export async function logout(_refresh: string) {
  return true;
}

// FORGOT PASSWORD
export async function forgotPassword(email: string) {
  console.log('🔍 FORGOT PASSWORD CALLED FOR:', email);
  
  const user = await prisma.user.findUnique({ where: { email } });
  
  console.log('👤 User found:', !!user);
  
  if (!user) {
    console.log('⚠️ User not found');
    return { 
      success: true,
      message: 'If an account exists with this email, a reset link will be sent.' 
    };
  }

  const resetToken = crypto.randomUUID();
  console.log('🔑 Generated reset token:', resetToken);
  
  await prisma.verificationToken.create({
    data: {
      token: resetToken,
      type: 'password_reset',
      expiresAt: addHours(new Date(), 1),
      userId: user.id
    }
  });
  
  console.log('💾 Token saved to database');

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  console.log('🔗 Reset link:', resetLink);
  console.log('📧 Calling sendEmail...');

  await sendEmail({
    to: email,
    subject: 'Password Reset Request - AES Suite',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password for your AES Suite account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all;">
              ${resetLink}
            </p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} AES Suite. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  });
  
  console.log('✅ Email sent successfully');

  return { 
    success: true,
    message: 'If an account exists with this email, a reset link will be sent.' 
  };
}

// RESET PASSWORD
export async function resetPassword(token: string, newPassword: string) {
  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      token,
      type: 'password_reset',
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  });

  if (!tokenRecord) {
    throw new Error('Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: tokenRecord.userId },
    data: { password: hashedPassword }
  });

  await prisma.verificationToken.delete({
    where: { id: tokenRecord.id }
  });

  await prisma.verificationToken.deleteMany({
    where: {
      userId: tokenRecord.userId,
      type: 'password_reset'
    }
  });

  return { 
    success: true,
    message: 'Password reset successfully' 
  };
}