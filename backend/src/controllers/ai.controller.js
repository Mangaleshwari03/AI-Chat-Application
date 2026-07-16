import { model } from "../lib/gemini.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const chatWithAI = async (req, res) => {
    try {
        const { message, fileData, fileName } = req.body;

        if (!message && !fileData) {
            return res.status(400).json({ message: "Message or file is required" });
        }

        const today = new Date().toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
        let promptPayload = `[Today's Date: ${today}]\n${message || "Please deeply analyze the provided content."}`;
        let generationConfig = [];

        if (fileData) {
            const isPDF = fileData.startsWith("data:application/pdf") || (fileName && fileName.toLowerCase().endsWith(".pdf"));
            const isTxt = fileData.startsWith("data:text/plain") || (fileName && fileName.toLowerCase().endsWith(".txt"));
            const isImage = fileData.startsWith("data:image/");

            try {
                if (isImage) {
                    const mimeType = fileData.substring(fileData.indexOf(":") + 1, fileData.indexOf(";"));
                    const base64Data = fileData.split(",")[1];
                    
                    generationConfig.push({
                        inlineData: {
                            data: base64Data,
                            mimeType
                        }
                    });
                    
                    promptPayload = `Please analyze this image. ${message ? 'User question: ' + message : 'Describe what is in this image.'}`;
                } 
                else if (isPDF) {
                    const base64Data = fileData.split(",")[1];
                    const buffer = Buffer.from(base64Data, "base64");
                    
                    const result = await pdf(buffer);
                    
                    promptPayload = `Context from uploaded PDF Document (${fileName}):\n\n${result.text.substring(0, 30000)}\n\n---\nUser Question: ${message}`;
                } 
                else if (isTxt) {
                    const base64Data = fileData.split(",")[1];
                    const textContent = Buffer.from(base64Data, "base64").toString("utf-8");
                    
                    promptPayload = `Context from uploaded Text Document (${fileName}):\n\n${textContent.substring(0, 30000)}\n\n---\nUser Question: ${message}`;
                }
            } catch (fileError) {
                console.error("Error processing file for AI:", fileError);
                return res.status(500).json({ message: "Failed to process the uploaded file." });
            }
        }

        // Prepare final request
        const requestPayload = [promptPayload, ...generationConfig];
        
        const result = await model.generateContent(requestPayload);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });
    } catch (error) {
        console.error("AI Chat Error Details:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};
