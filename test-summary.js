const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) { console.error("No API Key"); process.exit(1); }

const genAI = new GoogleGenerativeAI(apiKey);

async function testSummary() {
    console.log("Testing Summary Generation...");
    const transcript = "Client: Olá, gostaria de saber o preço do Corolla.\nAI: Olá! Sou o Gion. O Corolla custa a partir de R$ 150.000.";
    
    // Models confirmed available in models.txt
    const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest", "gemini-2.0-flash-lite"];

    for (const modelName of modelsToTry) {
        console.log(`Trying model: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = `Summarize the following conversation between a client and an AI (or attendant). Highlight key points and any resolution.\n\n${transcript}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            console.log(`SUCCESS with ${modelName}:\n${text}`);
            return;
        } catch (error) {
            console.error(`FAILED with ${modelName}: ${error.message}`);
        }
    }
    console.error("All models failed.");
}

testSummary();
