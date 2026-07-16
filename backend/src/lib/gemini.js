import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./env.js";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

export const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  systemInstruction: "You are Meta AI, a professional and helpful smart assistant. Your goal is to help users understand complex topics, analyze images, summarize documents, and chat naturally like Meta AI on WhatsApp. Always stay clear, friendly, and intelligent. If you use external knowledge beyond the provided documents, mention it if relevant.",
  generationConfig: {
    maxOutputTokens: 4096,
    temperature: 0.7,
  }
});
