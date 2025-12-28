const axios = require('axios');
require('dotenv').config();

console.log('Testing registration process...');

const testRegistration = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      username: 'testuser' + Math.floor(Math.random() * 10000),
      email: 'test' + Math.floor(Math.random() * 10000) + '@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      bio: 'This is a test user',
      location: 'Test Location'
    });

    console.log('✅ Registration successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error details:', error);
    }
  }
};

testRegistration();