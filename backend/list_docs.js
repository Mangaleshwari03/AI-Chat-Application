import { connectDB } from "./src/lib/db.js";
import Document from "./src/models/Document.js";
import setupAssociations from "./src/models/associations.js";

const test = async () => {
  await connectDB();
  setupAssociations();

  try {
    const docs = await Document.findAll();
    console.log("Documents in DB:", docs.length);
    docs.forEach(d => console.log(`Group: ${d.groupId}, File: ${d.fileName}, Text Preview: ${d.extractedText?.substring(0, 50)}`));
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
};

test();
