// Test script to verify the /api/leads endpoint
const axios = require('axios');

async function testLeadsEndpoint() {
  try {
    console.log('🧪 Testing /api/leads endpoint...\n');
    
    const testData = {
      fullName: 'Test User',
      email: `test${Date.now()}@example.com`,
      phone: '1234567890',
      studyCountry: 'USA',
      admissionStatus: 'not_applied',
      intake: 'Fall 2025',
      universityPreference: 'MIT',
      loanRange: '₹10L - ₹25L',
      city: 'Test City'
    };

    console.log('📤 Sending test data:', testData);
    
    const response = await axios.post('http://localhost:5000/api/leads', testData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Success! Response:', response.data);
    console.log('\n✅ Lead created successfully!');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    process.exit(1);
  }
}

testLeadsEndpoint();



