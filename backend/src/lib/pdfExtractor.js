import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import axios from "axios";

export const extractTextFromPDF = async (pdfUrl) => {
  try {
    const response = await axios.get(pdfUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    const result = await pdf(buffer);
    return result.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    return null;
  }
};
