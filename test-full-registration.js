// Test script to verify the full registration flow with email verification
const axios = require('axios');

// Generate random user data
const randomNum = Math.floor(Math.random() * 10000);
const userData = {
  username: `testuser${randomNum}`,
  email: `test${randomNum}@example.com`,
  password: 'Test@123',
  firstName: 'Test',
  lastName: 'User',
  bio: 'This is a test user',
  location: 'Test Location'
};

console.log(`Testing registration with username: ${userData.username} and email: ${userData.email}`);

// Step 1: Register a new user
async function testRegistration() {
  try {
    console.log('Step 1: Registering a new user...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', userData);
    console.log('✅ Registration response:', registerResponse.data);
    
    // Extract userId from response
    const userId = registerResponse.data.userId;
    if (!userId) {
      throw new Error('User ID not found in registration response');
    }
    
    // Step 2: Verify OTP (should be bypassed in production mode)
    console.log('\nStep 2: Verifying OTP (should be bypassed in production)...');
    const verifyResponse = await axios.post('http://localhost:5000/api/auth/verify-otp', {
      userId,
      otp: '123456' // This should be bypassed in production mode
    });
    console.log('✅ OTP verification response:', verifyResponse.data);
    
    // Step 3: Login with the new user
    console.log('\nStep 3: Logging in with the new user...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: userData.email,
      password: userData.password
    });
    console.log('✅ Login response:', loginResponse.data);
    
    console.log('\n🎉 Full registration flow completed successfully!');
  } catch (error) {
    console.error('❌ Error during test:', error.response ? error.response.data : error.message);
  }
}

testRegistration();