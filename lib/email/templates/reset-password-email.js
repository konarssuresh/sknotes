import { wrapEmailHtml } from "@/lib/email/templates/shared-email-layout";

const SUBJECT = "Reset your SKNotes password";

/**
 * @param {{ actionUrl: string; userName?: string | null }} options
 */
export function buildResetPasswordEmail({ actionUrl, userName }) {
  const greeting = userName?.trim() ? `Hi ${userName.trim()},` : "Hi there,";

  const text = `${greeting}

We received a request to reset your SKNotes password. Use the link below to choose a new password:

${actionUrl}

This link expires after a short time and can only be used once. If you did not request a reset, you can ignore this message.

— SKNotes`;

  const bodyHtml = `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#44403c;">${greeting}</p>
<p style="margin:0;font-size:15px;line-height:1.6;color:#44403c;">We received a request to reset your SKNotes password. Choose a new password using the button below.</p>
<p style="margin:12px 0 0;font-size:14px;line-height:1.5;color:#57534e;">This link expires after a short time and works only once.</p>`;

  const html = wrapEmailHtml({
    title: "Reset your password",
    bodyHtml,
    actionUrl,
    actionLabel: "Reset password",
  });

  return { subject: SUBJECT, html, text };
}
