import "server-only";

import { buildResetPasswordEmail } from "@/lib/email/templates/reset-password-email";
import { buildVerificationEmail } from "@/lib/email/templates/verification-email";
import { sendTransactionalEmail } from "@/lib/email/send-transactional-email";

/**
 * @param {{ to: string; subject: string; html: string; text: string }} message
 */
export async function sendAuthEmail(message) {
  await sendTransactionalEmail(message);
}

/**
 * @param {{ user: { email: string; name?: string | null; emailVerified?: boolean }; url: string }} options
 */
export async function sendVerificationAuthEmail({ user, url }) {
  if (user.emailVerified) {
    return;
  }
  const { subject, html, text } = buildVerificationEmail({
    actionUrl: url,
    userName: user.name,
  });
  await sendAuthEmail({
    to: user.email,
    subject,
    html,
    text,
  });
}

/**
 * @param {{ user: { email: string; name?: string | null }; url: string }} options
 */
export async function sendPasswordResetAuthEmail({ user, url }) {
  const { subject, html, text } = buildResetPasswordEmail({
    actionUrl: url,
    userName: user.name,
  });
  await sendAuthEmail({
    to: user.email,
    subject,
    html,
    text,
  });
}

/**
 * Fire-and-forget wrapper recommended by Better Auth to reduce timing leaks.
 * @param {{ to: string; subject: string; html: string; text: string }} message
 */
export function queueAuthEmail(message) {
  void sendAuthEmail(message).catch((error) => {
    console.error("[email] delivery failed", {
      category: "auth_email",
      provider: "resend",
      error: error instanceof Error ? error.message : "unknown",
      errorCategory:
        error && typeof error === "object" && "category" in error
          ? error.category
          : "unknown",
    });
  });
}

/**
 * @param {{ user: { email: string; name?: string | null; emailVerified?: boolean }; url: string }} options
 */
export function queueVerificationAuthEmail(options) {
  void sendVerificationAuthEmail(options).catch((error) => {
    console.error("[email] verification delivery failed", {
      category: "email_delivery",
      provider: "resend",
      error: error instanceof Error ? error.message : "unknown",
      errorCategory:
        error && typeof error === "object" && "category" in error
          ? error.category
          : "unknown",
    });
  });
}

/**
 * @param {{ user: { email: string; name?: string | null }; url: string }} options
 */
export function queuePasswordResetAuthEmail(options) {
  void sendPasswordResetAuthEmail(options).catch((error) => {
    console.error("[email] password reset delivery failed", {
      category: "email_delivery",
      provider: "resend",
      error: error instanceof Error ? error.message : "unknown",
      errorCategory:
        error && typeof error === "object" && "category" in error
          ? error.category
          : "unknown",
    });
  });
}
