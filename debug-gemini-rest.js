const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const model = "gemini-1.5-flash";

const data = JSON.stringify({
  contents: [{
    parts: [{ text: "Hello" }]
  }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log(`Sending request to ${options.hostname}${options.path}`);

const req = https.request(options, (res) => {
  let responseBody = '';

  console.log(`Status Code: ${res.statusCode}`);
  
  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:', responseBody);
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();
