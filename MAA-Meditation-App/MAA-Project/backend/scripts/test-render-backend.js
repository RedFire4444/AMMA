/**
 * Test Render Backend Connection
 * Verifies that the deployed backend on Render is up and responding.
 * 
 * Usage:
 * node scripts/test-render-backend.js <YOUR_RENDER_URL>
 * 
 * Example:
 * node scripts/test-render-backend.js https://maa-meditation-backend.onrender.com
 */

const https = require('https');
const http = require('http');

const urlArg = process.argv[2];

if (!urlArg) {
  console.error('❌ Error: Missing Render URL');
  console.error('Usage: node scripts/test-render-backend.js <YOUR_RENDER_URL>');
  console.error('Example: node scripts/test-render-backend.js https://your-backend-app.onrender.com');
  process.exit(1);
}

// Clean up URL and ensure it has /health endpoint
let testUrl = urlArg.trim();
if (testUrl.endsWith('/')) {
  testUrl = testUrl.slice(0, -1);
}
if (!testUrl.endsWith('/health') && !testUrl.endsWith('/api/health')) {
  testUrl = `${testUrl}/health`;
}

console.log(`🔍 Testing connection to Render backend at: ${testUrl} ...\n`);

const client = testUrl.startsWith('https') ? https : http;

const req = client.get(testUrl, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ Success! Backend is ALIVE on Render.`);
      console.log(`📊 Status Code: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log(`📄 Response:`);
        console.log(JSON.stringify(json, null, 2));
      } catch (e) {
        console.log(`📄 Response: ${data}`);
      }
    } else {
      console.log(`❌ Backend responded, but with an error.`);
      console.log(`📊 Status Code: ${res.statusCode}`);
      console.log(`📄 Response: ${data}`);
    }
  });
});

req.on('error', (err) => {
  console.log(`❌ Failed to connect to backend.`);
  console.log(`Error message: ${err.message}`);
  console.log(`\nTroubleshooting tips:`);
  console.log(`1. Double check that the Render URL is correct.`);
  console.log(`2. Go to your Render dashboard and make sure the Web Service has finished deploying and its status is 'Live'.`);
  console.log(`3. Sometimes Render spins down free tier instances. It might take 50 seconds to wake up. Try running this command again in a minute.`);
});

// Timeout after 15 seconds
req.setTimeout(15000, () => {
  console.log(`⏳ Request timed out after 15 seconds.`);
  console.log(`The server might be starting up from a "sleep" state (common on Render free tier). Please try again in a few moments.`);
  req.destroy();
});
