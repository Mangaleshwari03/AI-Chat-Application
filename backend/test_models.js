import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro"];

async function test() {
    console.log("Checking API Key:", process.env.GEMINI_API_KEY ? "Present" : "Missing");
    for (const m of models) {
        console.log(`Testing ${m}...`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hello");
            console.log(`SUCCESS: ${m}`);
            return;
        } catch (e) {
            console.log(`FAIL: ${m} - ${e.message.split('\n')[0]}`);
        }
    }
}

test();
