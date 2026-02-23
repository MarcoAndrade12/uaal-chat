require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    console.log("Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
        const result = await model.generateContent("Hi");
        console.log("Success:", result.response.text());
    } catch (e) {
        console.log("Error Name:", e.name);
        console.log("Error Message:", e.message);
        if (e.response) {
            console.log("Status:", e.response.status);
            console.log("StatusText:", e.response.statusText);
        }
    }
}
test();
