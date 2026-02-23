const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("Error: GEMINI_API_KEY not found in .env");
    process.exit(1);
}
console.log("API Key found:", apiKey.substring(0, 5) + "...");

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`SUCCESS: ${modelName} responded: ${response.text()}`);
        return true;
    } catch (error) {
        console.error(`FAILED: ${modelName} - ${error.message}`);
        return false;
    }
}

async function runTests() {
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    for (const model of models) {
        if (await testModel(model)) break;
    }
}

runTests();
