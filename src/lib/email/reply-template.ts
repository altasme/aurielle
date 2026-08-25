// Branded HTML for admin replies sent via the Quotes and Inquiries
// "Reply via Aurielle Email" composer. Table-based layout with inline
// styles throughout -- most email clients (Outlook especially) don't
// reliably support CSS classes, flexbox/grid, or external stylesheets,
// so this intentionally does not follow the site's normal Tailwind
// conventions. Web-safe serif stack stands in for the site's Playfair
// Display/Parisienne fonts, which can't be @font-face-loaded in most
// inboxes.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textToHtmlParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => `<p style="margin:0 0 16px;">${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export function renderReplyEmailHtml({
  recipientName,
  bodyText,
}: {
  recipientName: string;
  bodyText: string;
}): string {
  const greeting = recipientName.trim() ? `Dear ${escapeHtml(recipientName.trim())},` : "Hello,";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Aurielle Paris Atelier</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f0e6d6; font-family:Georgia, 'Times New Roman', serif; color:#2a2320;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0e6d6; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#faf6ef; border:1px solid #a9998a;">
            <tr>
              <td style="padding:36px 40px 24px; text-align:center; border-bottom:1px solid #a9998a;">
                <div style="font-size:22px; letter-spacing:4px; color:#6d1b2b; font-weight:bold;">AURIELLE</div>
                <div style="margin-top:4px; font-size:11px; letter-spacing:3px; color:#a9998a; text-transform:uppercase;">Paris Atelier</div>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px; font-size:15px; line-height:1.7; color:#2a2320;">
                <p style="margin:0 0 16px;">${greeting}</p>
                ${textToHtmlParagraphs(bodyText)}
                <p style="margin:24px 0 0;">Warm regards,</p>
                <p style="margin:4px 0 0; font-style:italic;">The Aurielle Paris Atelier Team</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px; background-color:#f0e6d6; text-align:center; font-size:11px; color:#a9998a;">
                &copy; ${new Date().getFullYear()} Aurielle Paris Atelier. All rights reserved.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
