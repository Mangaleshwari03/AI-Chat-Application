import { Sequelize } from "sequelize";
import { ENV } from "./env.js";

export const sequelize = new Sequelize(
  ENV.DB_NAME,
  ENV.DB_USER,
  ENV.DB_PASSWORD,
  {
    host: ENV.DB_HOST,
    dialect: "mysql",
    logging: false
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MYSQL CONNECTED SUCCESSFULLY");

    await sequelize.sync();
    console.log("MYSQL TABLES SYNCED");
  } catch (error) {
    console.error("Error connecting to MYSQL:", error);
    process.exit(1); // 1 = fail
  }
};
