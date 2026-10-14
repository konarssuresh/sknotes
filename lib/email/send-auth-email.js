import "server-only";

import nodemailer from "nodemailer";

import { getOptionalEnv, isSmtpConfigured } from "@/lib/db/env";

let transporter;

function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }
  if (!transporter) {
    const port = Number.parseInt(getOptionalEnv("SMTP_PORT") || "587", 10);
    transporter = nodemailer.createTransport({
      host: getOptionalEnv("SMTP_HOST"),
      port,
      secure: port === 465,
      auth: {
        user: getOptionalEnv("SMTP_USER"),
        pass: getOptionalEnv("SMTP_PASSWORD"),
      },
    });
  }
  return transporter;
}

/**
 * Sends transactional auth email. Does not log bodies, URLs, or tokens.
 * @param {{ to: string; subject: string; text: string }} message
 */
export async function sendAuthEmail(message) {
  const transport = getTransporter();
  if (!transport) {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    throw new Error(
      "Email delivery is not configured. Set SMTP_* environment variables."
    );
  }

  const from = getOptionalEnv("EMAIL_FROM") || getOptionalEnv("SMTP_USER");
  if (!from) {
    throw new Error("EMAIL_FROM or SMTP_USER is required to send email");
  }

  await transport.sendMail({
    from,
    to: message.to,
    subject: message.subject,
    text: message.text,
  });
}

/**
 * Fire-and-forget wrapper recommended by Better Auth to reduce timing leaks.
 */
export function queueAuthEmail(message) {
  void sendAuthEmail(message).catch((error) => {
    console.error("[email] delivery failed", {
      category: "auth_email",
      error: error instanceof Error ? error.message : "unknown",
    });
  });
}
