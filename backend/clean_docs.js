import { connectDB } from "./src/lib/db.js";
import Document from "./src/models/Document.js";
import setupAssociations from "./src/models/associations.js";

const cleanDocs = async () => {
  await connectDB();
  setupAssociations();

  try {
    const deletedCount = await Document.destroy({
      where: {
        fileName: "secret.txt"
      }
    });
    console.log(`Deleted ${deletedCount} test documents.`);
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
};

cleanDocs();
