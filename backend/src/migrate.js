import { sequelize } from "./lib/db.js";
import { ENV } from "./lib/env.js";

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log("Database connected for migration.");
    
    // Add 'action' column to 'messages'
    try {
      await sequelize.query("ALTER TABLE messages ADD COLUMN action VARCHAR(50) DEFAULT 'idle' AFTER fileType");
      console.log("Column 'action' added to messages table.");
    } catch (e) {
      console.log("'action' column might already exist.");
    }

    // Add 'emotion' column to 'messages'
    try {
      await sequelize.query("ALTER TABLE messages ADD COLUMN emotion VARCHAR(50) DEFAULT 'neutral' AFTER action");
      console.log("Column 'emotion' added to messages table.");
    } catch (e) {
      console.log("'emotion' column might already exist.");
    }

    // Add 'isSeen' column to 'messages'
    try {
      await sequelize.query("ALTER TABLE messages ADD COLUMN isSeen TINYINT(1) DEFAULT 0 AFTER emotion");
      console.log("Column 'isSeen' added to messages table.");
    } catch (e) {
      console.log("'isSeen' column might already exist.");
    }

    // Modify 'senderId' to be nullable (for AI/System messages)
    try {
      await sequelize.query("ALTER TABLE messages MODIFY senderId INTEGER NULL");
      console.log("Column 'senderId' updated to allow NULL values.");
    } catch (e) {
      console.log("Could not modify 'senderId' column.");
    }

    console.log("Migration complete.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
