const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ritajaf43@gmail.com',
    pass: 'glmasbcvocxbrpwq',
  },
});

transporter.sendMail({
  from: 'ritajaf43@gmail.com',
  to: 'aboulhosnmajdgh@gmail.com',
  subject: 'Test Email',
  text: 'If you receive this, Gmail is working!',
}, (error, info) => {
  if (error) {
    console.log('❌ ERROR:', error);
  } else {
    console.log('✅ Email sent:', info.response);
  }
});