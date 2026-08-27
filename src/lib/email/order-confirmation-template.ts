import { formatMoney } from "@/lib/format-money";
import type { Address, OrderLineItem } from "@/lib/orders/types";

// Same branded shell as reply-template.ts (table-based layout, inline
// styles, exact brand hex values) -- kept as a near-duplicate rather
// than a shared abstraction since the two emails have different bodies
// (a free-text reply vs. a line-item order summary) and diverging them
// independently is simpler than parameterizing one template for both.

const COLORS = {
  ivory: "#faf6ef",
  beige: "#f0e6d6",
  burgundy: "#6d1b2b",
  taupe: "#a9998a",
  ink: "#2a2320",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatAddress(address: Address): string {
  return [address.address, address.city, address.stateProvince, address.postalCode, address.country]
    .filter((part) => part && part.trim())
    .map(escapeHtml)
    .join(", ");
}

export function renderOrderConfirmationEmailHtml({
  customerName,
  orderNumber,
  items,
  currency,
  subtotal,
  promotionDiscountTotal,
  discountCode,
  shippingCost,
  total,
  paymentMethod,
  shippingAddress,
}: {
  customerName: string;
  orderNumber: string;
  items: OrderLineItem[];
  currency: string;
  subtotal: number;
  promotionDiscountTotal: number;
  discountCode: { code: string; amount: number } | null;
  shippingCost: number;
  total: number;
  paymentMethod: "gcash" | "bank_transfer";
  shippingAddress: Address;
}): string {
  const greeting = customerName.trim() ? `Dear ${escapeHtml(customerName.trim())},` : "Hello,";
  const logoUrl = `${SITE_URL}/images/logo.png`;
  const paymentMethodLabel = paymentMethod === "gcash" ? "GCash" : "Bank Transfer";

  const itemRows = items
    .map(
      (item) => `
                  <tr>
                    <td style="padding:10px 0; border-bottom:1px solid ${COLORS.taupe}33; font-size:14px;">
                      ${escapeHtml(item.name)}
                      <div style="font-size:12px; color:${COLORS.taupe};">Qty ${item.quantity}</div>
                    </td>
                    <td style="padding:10px 0; border-bottom:1px solid ${COLORS.taupe}33; font-size:14px; text-align:right; white-space:nowrap;">
                      ${escapeHtml(formatMoney(currency, item.lineSubtotal - item.promotionDiscountAmount))}
                    </td>
                  </tr>`,
    )
    .join("");

  const discountRow =
    promotionDiscountTotal > 0
      ? `
                  <tr>
                    <td style="padding:6px 0; font-size:13px; color:${COLORS.burgundy};">Promotion discount</td>
                    <td style="padding:6px 0; font-size:13px; color:${COLORS.burgundy}; text-align:right;">&minus;${escapeHtml(formatMoney(currency, promotionDiscountTotal))}</td>
                  </tr>`
      : "";

  const codeRow = discountCode
    ? `
                  <tr>
                    <td style="padding:6px 0; font-size:13px; color:${COLORS.burgundy};">Code ${escapeHtml(discountCode.code)}</td>
                    <td style="padding:6px 0; font-size:13px; color:${COLORS.burgundy}; text-align:right;">&minus;${escapeHtml(formatMoney(currency, discountCode.amount))}</td>
                  </tr>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Aurielle Paris Atelier</title>
  </head>
  <body style="margin:0; padding:0; background-color:${COLORS.beige}; font-family:Georgia, 'Times New Roman', serif; color:${COLORS.ink};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.beige}; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:${COLORS.ivory}; border:1px solid ${COLORS.taupe}33; border-radius:10px; overflow:hidden;">
            <tr>
              <td style="height:5px; line-height:5px; font-size:0; background-color:${COLORS.burgundy};">&nbsp;</td>
            </tr>

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

            <tr>
              <td style="padding:40px 40px 20px; font-size:15px; line-height:1.75; color:${COLORS.ink};">
                <p style="margin:0 0 18px;">${greeting}</p>
                <p style="margin:0 0 8px;">Thank you for your order. We&rsquo;ve received it and will begin verifying your payment shortly.</p>
                <p style="margin:0; font-size:13px; color:${COLORS.taupe};">Order number</p>
                <p style="margin:2px 0 0; font-size:18px; letter-spacing:1px; color:${COLORS.burgundy};">${escapeHtml(orderNumber)}</p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${itemRows}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 40px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0; font-size:13px; color:${COLORS.ink};">Subtotal</td>
                    <td style="padding:6px 0; font-size:13px; color:${COLORS.ink}; text-align:right;">${escapeHtml(formatMoney(currency, subtotal))}</td>
                  </tr>
                  ${discountRow}
                  ${codeRow}
                  <tr>
                    <td style="padding:6px 0; font-size:13px; color:${COLORS.ink};">Shipping</td>
                    <td style="padding:6px 0; font-size:13px; color:${COLORS.ink}; text-align:right;">${shippingCost > 0 ? escapeHtml(formatMoney(currency, shippingCost)) : "To be confirmed"}</td>
                  </tr>
                  <tr>
                    <td style="padding:12px 0 0; font-size:16px; font-weight:bold; color:${COLORS.burgundy}; border-top:1px solid ${COLORS.taupe}40;">Total</td>
                    <td style="padding:12px 0 0; font-size:16px; font-weight:bold; color:${COLORS.burgundy}; text-align:right; border-top:1px solid ${COLORS.taupe}40;">${escapeHtml(formatMoney(currency, total))}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 40px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${COLORS.taupe}40; padding-top:20px;">
                  <tr>
                    <td style="font-size:12px; line-height:1.8; color:${COLORS.taupe};">
                      <div style="text-transform:uppercase; letter-spacing:1px; color:${COLORS.ink}; margin-bottom:4px;">Shipping to</div>
                      ${formatAddress(shippingAddress)}
                      <div style="margin-top:10px; text-transform:uppercase; letter-spacing:1px; color:${COLORS.ink};">Payment method</div>
                      ${escapeHtml(paymentMethodLabel)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:28px 40px 36px;">
                <p style="margin:0; font-size:14px; line-height:1.75;">Warm regards,</p>
                <p style="margin:4px 0 0; font-style:italic; color:${COLORS.burgundy};">The Aurielle Paris Atelier Team</p>
              </td>
            </tr>

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
