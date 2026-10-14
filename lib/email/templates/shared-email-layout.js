/**
 * @param {{ title: string; bodyHtml: string; actionUrl: string; actionLabel: string }} options
 */
export function wrapEmailHtml({ title, bodyHtml, actionUrl, actionLabel }) {
  const escapedUrl = actionUrl.replace(/&/g, "&amp;");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f1ea;font-family:Georgia,'Times New Roman',serif;color:#1c1917;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f1ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#ffffff;border:1px solid #e7e0d4;border-radius:8px;padding:32px 28px;">
          <tr>
            <td>
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;color:#78716c;">SKNotes</p>
              <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;line-height:1.3;color:#1c1917;">${title}</h1>
              ${bodyHtml}
              <p style="margin:28px 0 0;">
                <a href="${escapedUrl}" style="display:inline-block;background-color:#44403c;color:#fafaf9;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px;">${actionLabel}</a>
              </p>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#57534e;">
                If the button does not work, copy and paste this link into your browser:<br />
                <a href="${escapedUrl}" style="color:#44403c;word-break:break-all;">${escapedUrl}</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#78716c;">You received this message because of activity on your SKNotes account.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
