import { ENV } from "./src/lib/env.js";

async function checkModels() {
    const key = ENV.GEMINI_API_KEY;
    if (!key) {
        console.log("CRITICAL: GEMINI_API_KEY is missing!");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.log(`HTTP Error ${response.status}:`, JSON.stringify(data));
            return;
        }

        if (data.error) {
            console.log("API Error:", JSON.stringify(data.error));
        } else {
            const models = data.models || [];
            console.log(`Found ${models.length} models.`);

            const flash = models.find(m => m.name.includes("gemini-1.5-flash"));
            if (flash) console.log("FOUND FLASH: " + flash.name);
            else console.log("FLASH NOT FOUND");

            const pro = models.find(m => m.name.includes("gemini-pro"));
            if (pro) console.log("FOUND PRO: " + pro.name);
            else console.log("PRO NOT FOUND");

            console.log("--- ALL MODELS ---");
            models.forEach(m => console.log(m.name));
        }
    } catch (e) {
        console.log("Network Error:", e.message);
    }
}

checkModels();
