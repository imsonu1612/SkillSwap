const axios = require('axios');
require('dotenv').config();

// Set NODE_ENV to production to trigger the bypass mechanism
process.env.NODE_ENV = 'production';
console.log('Setting NODE_ENV to:', process.env.NODE_ENV);

console.log('Testing OTP verification process...');

const testVerifyOTP = async () => {
  try {
    // First, register a new user
    const username = 'testuser' + Math.floor(Math.random() * 10000);
    const email = 'test' + Math.floor(Math.random() * 10000) + '@example.com';
    
    console.log(`Registering user ${username} with email ${email}...`);
    
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
      username,
      email,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      bio: 'This is a test user',
      location: 'Test Location'
    });

    console.log('✅ Registration successful!');
    console.log('Register Response:', registerResponse.data);
    
    const userId = registerResponse.data.userId;
    
    // Now verify the OTP
    console.log(`Verifying OTP for user ${userId}...`);
    
    const verifyResponse = await axios.post('http://localhost:5000/api/auth/verify-otp', {
      userId,
      otp: '123456' // This should work with our bypass mechanism
    });

    console.log('✅ OTP verification successful!');
    console.log('Verify Response:', verifyResponse.data);
    
    // Try to login with the new user
    console.log(`Logging in with ${email}...`);
    
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password: 'password123'
    });

    console.log('✅ Login successful!');
    console.log('Login Response:', loginResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error details:', error);
    }
  }
};

testVerifyOTP();