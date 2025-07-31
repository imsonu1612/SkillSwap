const nodemailer = require('nodemailer');

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'SkillSwap - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; margin: 0;">SkillSwap</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Connect & Learn Skills</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Email Verification</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hi ${username},<br><br>
              Thank you for creating an account with SkillSwap! To complete your registration, 
              please enter the following verification code:
            </p>
            
            <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; font-weight: bold;">${otp}</h1>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              This code will expire in 10 minutes. If you didn't create an account with SkillSwap, 
              please ignore this email.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © 2024 SkillSwap. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully to:', email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, username) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to SkillSwap! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; margin: 0;">SkillSwap</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Connect & Learn Skills</p>
            </div>
            
            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to SkillSwap! 🎉</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hi ${username},<br><br>
              Congratulations! Your email has been successfully verified and your SkillSwap account is now active.
            </p>
            
            <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <h3 style="margin: 0;">Your account is ready!</h3>
              <p style="margin: 10px 0 0 0;">Start connecting with other learners and sharing your skills.</p>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              You can now:
            </p>
            
            <ul style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              <li>Complete your profile and add your skills</li>
              <li>Search for other users to connect with</li>
              <li>Share your knowledge and learn from others</li>
              <li>Join the SkillSwap community</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © 2024 SkillSwap. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent successfully to:', email);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    // Don't throw error for welcome email as it's not critical
    return { success: false, error: error.message };
  }
};

// Send connection request notification email
const sendConnectionRequestEmail = async (toEmail, toName, fromName, message = '') => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `SkillSwap - Connection Request from ${fromName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; margin: 0;">SkillSwap</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Connect & Learn Skills</p>
            </div>

            <h2 style="color: #1f2937; margin-bottom: 20px;">New Connection Request</h2>

            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hi ${toName},<br><br>
              <strong>${fromName}</strong> wants to connect with you on SkillSwap!
            </p>

            ${message ? `
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #374151; margin: 0; font-style: italic;">"${message}"</p>
            </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/notifications" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Request
              </a>
            </div>

            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              You can accept or reject this request from your SkillSwap dashboard.
            </p>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © 2024 SkillSwap. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Connection request email sent successfully to:', toEmail);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending connection request email:', error);
    throw new Error('Failed to send connection request email');
  }
};

// Send connection accepted notification email
const sendConnectionAcceptedEmail = async (toEmail, toName, fromName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: `SkillSwap - ${fromName} accepted your connection request!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3b82f6; margin: 0;">SkillSwap</h1>
              <p style="color: #6b7280; margin: 10px 0 0 0;">Connect & Learn Skills</p>
            </div>

            <h2 style="color: #1f2937; margin-bottom: 20px;">Connection Accepted! 🎉</h2>

            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hi ${toName},<br><br>
              Great news! <strong>${fromName}</strong> has accepted your connection request.
            </p>

            <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <h3 style="margin: 0;">You're now connected!</h3>
              <p style="margin: 10px 0 0 0;">Start chatting and sharing skills.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/connections" style="background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Connections
              </a>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                © 2024 SkillSwap. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Connection accepted email sent successfully to:', toEmail);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending connection accepted email:', error);
    throw new Error('Failed to send connection accepted email');
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendWelcomeEmail,
  sendConnectionRequestEmail,
  sendConnectionAcceptedEmail
}; 