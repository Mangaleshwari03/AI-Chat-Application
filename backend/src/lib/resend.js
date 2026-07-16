import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();


// Directly use process.env
const API_KEY = process.env.RESEND_API_KEY;

if (!API_KEY) {
  console.warn("⚠️ RESEND_API_KEY not found. Email feature disabled.");
}

export const resendClient = API_KEY
  ? new Resend(API_KEY)
  : null;

export const sender = {
  email: process.env.EMAIL_FROM,
  name: process.env.EMAIL_FROM_NAME,
};
