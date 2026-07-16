import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./src/lib/env.js"; // Use the ENV we set up

async function listModels() {
    const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    console.log("Using Key:", ENV.GEMINI_API_KEY ? ENV.GEMINI_API_KEY.substring(0, 10) + "..." : "MISSING");

    try {
        // List models that support generateContent
        // Note: The method might be different in older versions, but let's try strict latest syntax
        // Actually, there is a model.listModels() usually on the main client or similar?
        // No, it's usually via API. The SDK has a generic request mechanism or specific input.
        // Wait, typical usage:
        // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // But to list?

        // Quickest way to check if "gemini-1.5-flash" works is to just try it.
        // But I want to list.
        // The node SDK doesn't expose listModels conveniently in all versions.

        // Let's try to just run a simple generation with "gemini-1.5-flash" AND catch the error to print it full.
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent("Hello");
        console.log("Success with gemini-flash-latest:", result.response.text());

    } catch (error) {
        console.error("Error with gemini-1.5-flash:", error.message);

        // Try gemini-pro as backup
        try {
            console.log("Trying gemini-pro...");
            const model2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result2 = await model2.generateContent("Hello");
            console.log("Success with gemini-pro:", result2.response.text());
        } catch (error2) {
            console.error("Error with gemini-pro:", error2.message);
        }
    }
}

listModels();
