import { connectDB } from "./src/lib/db.js";
import Message from "./src/models/Message.js";
import setupAssociations from "./src/models/associations.js";

const checkMessage = async () => {
  await connectDB();
  setupAssociations();

  try {
    const messages = await Message.findAll({
      order: [["createdAt", "DESC"]],
      limit: 5
    });
    console.log(JSON.stringify(messages.map(m => ({
      id: m.id, text: m.text?.substring(0, 20), fileUrl: m.fileUrl, fileType: m.fileType
    })), null, 2));
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
};

checkMessage();
