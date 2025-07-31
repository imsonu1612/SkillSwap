const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateOTP, sendOTPEmail, sendWelcomeEmail } = require('../services/emailService');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register User (Step 1: Send OTP)
router.post('/register', [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .notEmpty()
    .trim()
    .withMessage('First name is required'),
  body('lastName')
    .notEmpty()
    .trim()
    .withMessage('Last name is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, email, password, firstName, lastName, bio, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create temporary user with OTP
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      bio: bio || '',
      location: location || '',
      isVerified: false,
      otp: {
        code: otp,
        expiresAt: otpExpiresAt
      }
    });

    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp, firstName);

    res.status(200).json({
      message: 'OTP sent successfully',
      email: email,
      userId: user._id
    });

  } catch (error) {
    console.error('🔴 Registration error:', error.message);
    console.error('🔍 Error stack:', error.stack);
    console.error('🔍 MongoDB connection state:', mongoose.connection.readyState);
    
    res.status(500).json({
      error: 'Registration failed',
      message: 'Something went wrong during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Database connection issue'
    });
  }
});

// Verify OTP and Complete Registration
router.post('/verify-otp', [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId, otp } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Invalid user ID'
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'User is already verified'
      });
    }

    // Check if OTP exists and is not expired
    if (!user.otp.code || !user.otp.expiresAt) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'No OTP found for this user'
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        error: 'OTP expired',
        message: 'OTP has expired. Please request a new one'
      });
    }

    // Verify OTP
    if (user.otp.code !== otp) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'Incorrect OTP. Please try again'
      });
    }

    // Mark user as verified and clear OTP
    user.isVerified = true;
    user.otp.code = null;
    user.otp.expiresAt = null;
    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Email verified successfully',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: 'Something went wrong during verification'
    });
  }
});

// Resend OTP
router.post('/resend-otp', [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.body;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'Invalid user ID'
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'User is already verified'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    user.otp.code = otp;
    user.otp.expiresAt = otpExpiresAt;
    await user.save();

    // Send new OTP email
    await sendOTPEmail(user.email, otp, user.firstName);

    res.json({
      message: 'OTP resent successfully',
      email: user.email
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      error: 'Failed to resend OTP',
      message: 'Something went wrong while resending OTP'
    });
  }
});

// Login User
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({
        error: 'Email not verified',
        message: 'Please verify your email before logging in',
        userId: user._id,
        email: user.email
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Something went wrong during login'
    });
  }
});

// Get current user (protected route)
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }

    res.json({
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    message: 'Logged out successfully'
  });
});

module.exports = router; 