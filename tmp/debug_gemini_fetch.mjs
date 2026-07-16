import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

async function listModels() {
    const key = process.env.GEMINI_API_KEY;
    console.log("Using Key:", key ? key.substring(0, 10) + "..." : "MISSING");
    
    try {
        const genAI = new GoogleGenerativeAI(key);
        // List models is actually in v1/v1beta?
        // Let's use fetch, it's safer for pure debugging of models visible to key.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => console.log("- " + m.name));
        } else {
            console.error("No models found or error response:", JSON.stringify(data, null, 2));
        }
        
    } catch (error) {
        console.error("Fetch Error:", error.message);
    }
}

listModels();
