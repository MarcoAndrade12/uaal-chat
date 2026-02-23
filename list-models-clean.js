const fs = require('fs');
const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("No API Key"); process.exit(1); }

function check(version) {
    const url = `https://generativelanguage.googleapis.com/${version}/models?key=${apiKey}`;
    console.log(`Checking ${version}...`);
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.models) {
                    const names = json.models.map(m => m.name.replace('models/', '')).sort().join('\n');
                    fs.appendFileSync('models.txt', `\n--- ${version} ---\n${names}\n`);
                    console.log(`Saved ${json.models.length} models from ${version} to models.txt`);
                } else {
                    fs.appendFileSync('models.txt', `\n--- ${version} Error ---\n${JSON.stringify(json)}\n`);
                }
            } catch (e) { console.error("Parse Error:", e); }
        });
    });
}

fs.writeFileSync('models.txt', 'Model List:\n');
check('v1beta');
setTimeout(() => check('v1'), 2000);
