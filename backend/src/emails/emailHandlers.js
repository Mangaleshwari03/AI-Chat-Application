import { resendClient, sender } from "../lib/resend.js";
import { createWelcomeEmailTemplate } from "../emails/emailTemplates.js";

export const sendWelcomeEmail = async (email, name, password, clientURL) => {
  if (!resendClient) {
    console.warn("Skipping email send: Resend client not initialized.");
    return;
  }

  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: `Welcome to Chatify, ${name}!`,
    html: createWelcomeEmailTemplate(name, email, password, clientURL),
  });

  if (error) {
    console.error("Error sending welcome email:", error);
    // Don't throw error to prevent signup failure if email fails
  } else {
    console.log("Welcome Email sent successfully", data);
  }
};

