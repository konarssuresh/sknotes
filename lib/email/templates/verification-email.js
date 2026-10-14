import { wrapEmailHtml } from "@/lib/email/templates/shared-email-layout";

const SUBJECT = "Verify your SKNotes email";

/**
 * @param {{ actionUrl: string; userName?: string | null }} options
 */
export function buildVerificationEmail({ actionUrl, userName }) {
  const greeting = userName?.trim() ? `Hi ${userName.trim()},` : "Hi there,";

  const text = `${greeting}

Thanks for signing up for SKNotes. Verify your email address to start using the app:

${actionUrl}

If you did not create a SKNotes account, you can ignore this message.

— SKNotes`;

  const bodyHtml = `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#44403c;">${greeting}</p>
<p style="margin:0;font-size:15px;line-height:1.6;color:#44403c;">Thanks for signing up for SKNotes. Confirm your email address to finish setting up your account.</p>`;

  const html = wrapEmailHtml({
    title: "Verify your email",
    bodyHtml,
    actionUrl,
    actionLabel: "Verify email",
  });

  return { subject: SUBJECT, html, text };
}
