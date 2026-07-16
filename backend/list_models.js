import axios from "axios";
import { ENV } from "./src/lib/env.js";

const listModels = async () => {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${ENV.GEMINI_API_KEY}`;
        const res = await axios.get(url);
        console.log("AVAILABLE MODELS:");
        res.data.models.forEach(m => {
            console.log(`- ${m.name} : ${m.supportedGenerationMethods.join(", ")}`);
        });
    } catch (err) {
        console.error("Error fetching models:", err.response?.data || err.message);
    }
};

listModels();
