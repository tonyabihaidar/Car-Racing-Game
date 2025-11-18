import nodemailer from 'nodemailer';

console.log('📧 Email Module Loaded');
console.log('SMTP Configuration:', {
  host: 'smtp.gmail.com',
  port: 587,
  user: process.env.SMTP_USER,
  from: process.env.EMAIL_FROM
});

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  }
});

// Verify transporter configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  console.log('\n=================================');
  console.log('📧 SENDING EMAIL');
  console.log('=================================');
  console.log('From:', process.env.EMAIL_FROM);
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('=================================\n');
  
  try {
    const info = await transporter.sendMail({
      from: `"AES Suite" <${process.env.EMAIL_FROM || 'ritajaf43@gmail.com'}>`,
      to,
      subject,
      html,
    });
    
    console.log('\n=================================');
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('=================================');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('=================================\n');
    
    return info;
  } catch (error: any) {
    console.log('\n=================================');
    console.log('❌ EMAIL SENDING FAILED!');
    console.log('=================================');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Command failed:', error.command);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
    console.log('=================================\n');
    throw error;
  }
}