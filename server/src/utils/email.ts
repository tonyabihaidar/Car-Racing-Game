import nodemailer from 'nodemailer';

console.log('📧 Email Module Loaded');

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
    minVersion: 'TLSv1'
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
      from: process.env.EMAIL_FROM || 'ritajaf43@gmail.com',
      to,
      subject,
      html,
    });
    
    console.log('\n=================================');
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('=================================');
    console.log('Message ID:', info.messageId);
    console.log('=================================\n');
    
    return info;
  } catch (error: any) {
    console.log('\n=================================');
    console.log('❌ EMAIL SENDING FAILED!');
    console.log('=================================');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    console.log('=================================\n');
    throw new Error('Failed to send email');
  }
}