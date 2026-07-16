import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix for ES Modules (__dirname not available)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 EXPLICITLY load backend/.env
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

export const ENV = {
  PORT: process.env.PORT,
  NODE_ENV: process.env.NODE_ENV,

  JWT_SECRET: process.env.JWT_SECRET,

  // MySQL
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_DIALECT: process.env.DB_DIALECT,

  // Email
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,

  CLIENT_URL: process.env.CLIENT_URL,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
};
