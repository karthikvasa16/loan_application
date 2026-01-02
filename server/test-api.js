const http = require('http');

function testLeadSubmission() {
  const testData = {
    fullName: 'Test User',
    email: `test${Date.now()}@example.com`,
    phone: '1234567890',
    studyCountry: 'United States (USA)',
    admissionStatus: 'not_applied',
    intake: 'Fall 2024',
    loanRange: '10-20 Lakhs',
    city: 'Test City'
  };
  
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/leads',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  console.log('🧪 Testing /api/leads endpoint...\n');
  console.log('📤 Sending request with data:', testData);
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📥 Response received:');
      console.log('Status:', res.statusCode);
      try {
        const parsed = JSON.parse(data);
        console.log('Response:', JSON.stringify(parsed, null, 2));
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('\n✅ Success!');
        } else {
          console.log('\n❌ Error response');
        }
      } catch (e) {
        console.log('Raw response:', data);
      }
      process.exit(0);
    });
  });
  
  req.on('error', (error) => {
    console.error('\n❌ Request error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Server is not running on port 5000');
    }
    process.exit(1);
  });
  
  req.write(postData);
  req.end();
}

// Wait a bit for server to start, then test
setTimeout(() => {
  testLeadSubmission();
}, 2000);

