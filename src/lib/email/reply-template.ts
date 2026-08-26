// Branded HTML for admin replies sent via "Reply via Aurielle Email"
// (Quotes and Inquiries and Aurielle Mail both use this). Table-based
// layout with inline styles throughout -- most email clients (Outlook
// especially) don't reliably support CSS classes, flexbox/grid, or
// external stylesheets, so this intentionally does not follow the
// site's normal Tailwind conventions. Web-safe serif stack stands in
// for the site's Playfair Display/Parisienne fonts, which can't be
// @font-face-loaded in most inboxes. Exact brand hex values, matching
// tailwind.config's ivory/beige/burgundy/taupe/ink tokens.

const COLORS = {
  ivory: "#faf6ef",
  beige: "#f0e6d6",
  burgundy: "#6d1b2b",
  taupe: "#a9998a",
  ink: "#2a2320",
};

// The site domain, for the logo's absolute URL -- email clients fetch
// images over the network, they can't reach a local build asset, so
// this needs the same public site URL used for metadataBase in
// src/app/layout.tsx.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

// A short, invisible preview snippet is what most inboxes show next to
// the subject line -- without one, they fall back to showing raw
// markup/whitespace from the top of the HTML, which looks broken.
function buildPreheader(bodyText: string): string {
  const flattened = bodyText.replace(/\s+/g, " ").trim();
  const snippet = flattened.length > 120 ? `${flattened.slice(0, 120)}...` : flattened;
  // Padding of zero-width non-joiners stops Gmail/Outlook from
  // appending the email's own visible text after this snippet in the
  // inbox preview.
  const padding = "&zwnj;&nbsp;".repeat(80);
  return `${escapeHtml(snippet)}${padding}`;
}

export function renderReplyEmailHtml({
  recipientName,
  bodyText,
}: {
  recipientName: string;
  bodyText: string;
}): string {
  const greeting = recipientName.trim() ? `Dear ${escapeHtml(recipientName.trim())},` : "Hello,";
  const logoUrl = `${SITE_URL}/images/logo.png`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Aurielle Paris Atelier</title>
  </head>
  <body style="margin:0; padding:0; background-color:${COLORS.beige}; font-family:Georgia, 'Times New Roman', serif; color:${COLORS.ink};">
    <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:${COLORS.beige};">
      ${buildPreheader(bodyText)}
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.beige}; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:${COLORS.ivory}; border:1px solid ${COLORS.taupe}33; border-radius:10px; overflow:hidden;">
            <!-- Brand accent bar -->
            <tr>
              <td style="height:5px; line-height:5px; font-size:0; background-color:${COLORS.burgundy};">&nbsp;</td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="padding:40px 40px 28px; text-align:center; border-bottom:1px solid ${COLORS.taupe}40;">
                <img
                  src="${logoUrl}"
                  width="56"
                  height="56"
                  alt="Aurielle Paris Atelier"
                  style="display:block; margin:0 auto 16px; border-radius:50%; border:1px solid ${COLORS.taupe}40;"
                />
                <div style="font-size:24px; letter-spacing:5px; color:${COLORS.burgundy}; font-weight:bold;">AURIELLE</div>
                <div style="margin-top:6px; font-size:11px; letter-spacing:4px; color:${COLORS.taupe}; text-transform:uppercase;">
                  Paris Atelier
                </div>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px; font-size:15px; line-height:1.75; color:${COLORS.ink};">
                <p style="margin:0 0 18px;">${greeting}</p>
                ${textToHtmlParagraphs(bodyText)}
                <p style="margin:28px 0 0;">Warm regards,</p>
                <p style="margin:4px 0 0; font-style:italic; color:${COLORS.burgundy};">The Aurielle Paris Atelier Team</p>
              </td>
            </tr>

            <!-- Signature / contact card -->
            <tr>
              <td style="padding:0 40px 36px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${COLORS.taupe}40; padding-top:20px;">
                  <tr>
                    <td style="font-size:12px; line-height:1.8; color:${COLORS.taupe};">
                      <a href="mailto:hello@auriellefragrancestudio.com" style="color:${COLORS.burgundy}; text-decoration:none;">hello@auriellefragrancestudio.com</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${SITE_URL}" style="color:${COLORS.burgundy}; text-decoration:none;">${SITE_URL.replace(/^https?:\/\//, "")}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 40px; background-color:${COLORS.beige}; text-align:center; font-size:11px; letter-spacing:0.5px; color:${COLORS.taupe};">
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
