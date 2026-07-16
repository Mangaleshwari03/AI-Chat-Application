import { sequelize } from "./lib/db.js";

async function clearDatabase() {
  try {
    await sequelize.authenticate();
    console.log("Database connected for cleanup.");

    // Disable foreign key checks for truncate to avoid errors
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

    const tables = ["users", "messages", "contacts", "groups", "group_members", "documents"];
    
    for (const table of tables) {
      try {
        await sequelize.query(`TRUNCATE TABLE ${table}`);
        console.log(`Table ${table} cleared.`);
      } catch (e) {
        console.log(`Table ${table} might not exist or already cleared.`);
      }
    }

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("Database cleanup complete. You can now start fresh!");
    process.exit(0);
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

clearDatabase();
