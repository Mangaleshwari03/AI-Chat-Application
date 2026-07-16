import axios from "axios";
import mammoth from "mammoth";

export const extractTextFromDOCX = async (docxUrl) => {
  try {
    const response = await axios.get(docxUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    const result = await mammoth.extractRawText({ buffer });
    return result.value || null;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    return null;
  }
};
