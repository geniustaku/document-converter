const http = require('http');

// Simple test to check if the Next.js server is responding
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`✅ Server is responding!`);
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  process.exit(0);
});

req.on('error', (err) => {
  console.log(`❌ Server not responding: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log(`⏰ Request timed out`);
  req.destroy();
  process.exit(1);
});

console.log('🔍 Testing Next.js server at http://localhost:3000...');
req.end();