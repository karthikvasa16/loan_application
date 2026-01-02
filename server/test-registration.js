/**
 * Test script to verify registration endpoint works
 * Run with: node test-registration.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testRegistration() {
  console.log('🧪 Testing Registration Endpoint...\n');
  
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'test123456',
    phone: '+1234567890',
    country: 'USA'
  };

  try {
    console.log('Sending registration request:', {
      ...testUser,
      password: '***'
    });

    const response = await axios.post(`${API_URL}/api/auth/register`, testUser);
    
    console.log('\n✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('\n✅ Token received:', response.data.token ? 'Yes' : 'No');
    console.log('✅ User data:', response.data.user);
    
  } catch (error) {
    console.error('\n❌ Registration failed!');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the server running?');
      console.error('Make sure to run: npm run dev in the server folder');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run test
testRegistration();





