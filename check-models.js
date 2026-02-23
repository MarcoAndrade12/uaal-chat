const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API Key found in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API Error:", JSON.stringify(json.error, null, 2));
            } else if (json.models) {
                console.log("Available Models:");
                json.models.forEach(m => console.log(`"${m.name}"`));
            } else {
                console.log("No models found:", json);
            }
        } catch (e) {
            console.error("Error parsing JSON:", e.message);
        }
    });
}).on('error', (e) => {
    console.error("Request error:", e.message);
});
