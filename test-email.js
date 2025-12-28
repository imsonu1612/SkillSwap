const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('Testing email service...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? process.env.EMAIL_USER : 'NOT SET');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'PASSWORD SET (hidden)' : 'NOT SET');

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Test email connection
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email service error:', error.message);
    console.error('🔍 Error details:', error);
  } else {
    console.log('✅ Email service is ready to send messages');
  }
  process.exit(0);
});