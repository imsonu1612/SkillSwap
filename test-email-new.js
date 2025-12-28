// Test script to verify email functionality with new credentials
require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing email configuration with new credentials...');
console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
console.log(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD.substring(0, 2)}***`);

// Create a transporter with Gmail configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify the connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
    
    // Send a test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'SkillSwap Email Test',
      text: 'This is a test email to verify that the email configuration is working correctly.',
      html: '<h1>SkillSwap Email Test</h1><p>This is a test email to verify that the email configuration is working correctly.</p>'
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Failed to send test email:', error);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
      }
    });
  }
});