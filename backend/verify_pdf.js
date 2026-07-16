import axios from "axios";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

const checkPDF = async () => {
  try {
    const url = "https://res.cloudinary.com/du8eiyyuq/raw/upload/v1774349439/chatify_files/bm88vaxkp6a2pxjahedj";
    console.log("Fetching URL:", url);
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);
    
    console.log("Got buffer, length:", buffer.length);
    console.log("Buffer preview (first 20 bytes):", buffer.slice(0, 20).toString("hex"));

    // Check if it's a PDF signature (25504446)
    if (buffer.toString('utf8', 0, 4) === '%PDF') {
      console.log("It's a valid PDF stream. Attempting parse...");
      const result = await pdf(buffer);
      console.log("PDF parsed text length:", result.text?.length);
    } else {
      console.log("Not a PDF file! Signature:", buffer.toString('utf8', 0, 4));
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
  process.exit(0);
};

checkPDF();
