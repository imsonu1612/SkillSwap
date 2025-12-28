// Test script to verify OTP verification in development mode
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

console.log(`Testing OTP verification with username: ${userData.username} and email: ${userData.email}`);

// Step 1: Register a new user
async function testOtpVerification() {
  try {
    console.log('Step 1: Registering a new user...');
    const registerResponse = await axios.post('http://localhost:5000/api/auth/register', userData);
    console.log('✅ Registration response:', registerResponse.data);
    
    // Extract userId from response
    const userId = registerResponse.data.userId;
    if (!userId) {
      throw new Error('User ID not found in registration response');
    }
    
    // Step 2: Check if OTP was sent by checking server logs
    console.log('\nStep 2: OTP should have been sent to the email (check server logs)');
    console.log('Please check the server logs to see if the OTP email was sent successfully.');
    console.log('The OTP code should be logged in the server console for testing purposes.');
    
    // Prompt for OTP input (for manual testing)
    console.log('\nFor manual testing, you would enter the OTP from the email or server logs.');
    console.log('In this automated test, we will attempt to use a dummy OTP.');
    
    // Step 3: Try to verify with a dummy OTP (this should fail in development mode)
    console.log('\nStep 3: Attempting to verify with a dummy OTP (should fail in development mode)...');
    try {
      const verifyResponse = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        userId,
        otp: '123456' // Dummy OTP
      });
      console.log('✅ OTP verification response:', verifyResponse.data);
      console.log('Note: If this succeeded, the server is likely in production mode with bypass enabled.');
    } catch (error) {
      console.log('❌ OTP verification failed as expected in development mode:', 
                error.response ? error.response.data : error.message);
      console.log('This is the expected behavior in development mode without bypass.');
    }
    
    console.log('\n🎉 OTP verification test completed!');
  } catch (error) {
    console.error('❌ Error during test:', error.response ? error.response.data : error.message);
  }
}

testOtpVerification();