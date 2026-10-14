import "server-only";

import { getOptionalEnv, isResendConfigured } from "@/lib/db/env";
import { EmailDeliveryError } from "@/lib/email/email-delivery-error";
import { sendViaResend } from "@/lib/email/resend-client";

/** @type {((message: { to: string; subject: string; html: string; text: string }) => Promise<void>) | null} */
let testSender = null;

/**
 * @internal Test-only injection for transactional email.
 * @param {((message: { to: string; subject: string; html: string; text: string }) => Promise<void>) | null} sender
 */
export function setEmailSenderForTests(sender) {
  testSender = sender;
}

/**
 * @param {{ to: string; subject: string; html: string; text: string }} message
 */
export async function sendTransactionalEmail(message) {
  if (testSender) {
    await testSender(message);
    return;
  }

  if (process.env.NODE_ENV === "test") {
    return;
  }

  if (!isResendConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      return;
    }
    throw new EmailDeliveryError(
      "not_configured",
      "Email delivery is not configured. Set RESEND_API_KEY and EMAIL_FROM."
    );
  }

  const from = getOptionalEnv("EMAIL_FROM");
  if (!from) {
    throw new EmailDeliveryError(
      "not_configured",
      "EMAIL_FROM is required to send email."
    );
  }

  await sendViaResend({
    from,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
}
