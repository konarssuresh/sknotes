import "server-only";

import { Resend } from "resend";

import { getOptionalEnv } from "@/lib/db/env";
import { EmailDeliveryError } from "@/lib/email/email-delivery-error";

let resendClient;

function getResendClient() {
  const apiKey = getOptionalEnv("RESEND_API_KEY");
  if (!apiKey) {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * @param {{ from: string; to: string; subject: string; html: string; text: string }} payload
 */
export async function sendViaResend(payload) {
  const client = getResendClient();
  if (!client) {
    throw new EmailDeliveryError(
      "not_configured",
      "Email delivery is not configured."
    );
  }

  const { data, error } = await client.emails.send({
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  if (error) {
    throw new EmailDeliveryError(
      "provider_error",
      "Unable to send email right now. Please try again later.",
      error
    );
  }

  return data;
}

/** @internal */
export function resetResendClientForTests() {
  resendClient = undefined;
}
