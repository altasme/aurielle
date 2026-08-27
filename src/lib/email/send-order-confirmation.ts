import "server-only";
import { renderOrderConfirmationEmailHtml } from "./order-confirmation-template";
import type { Address, OrderLineItem } from "@/lib/orders/types";

// Sends the order confirmation via Resend's HTTP API (plain fetch, no
// SDK needed -- it's a single JSON POST) rather than the z.com SMTP
// mailbox used for admin replies (send-reply.ts): a transactional
// receipt needs to land reliably and immediately, independent of the
// mailbox's own deliverability issues. Requires RESEND_API_KEY as a
// real env var (see .github/workflows/deploy.yml and README "Order
// confirmation email"). Never throws -- a failed confirmation email
// must not fail order creation, which has already been committed to
// the database by the time this is called; the caller just logs on a
// thrown/returned error.
export async function sendOrderConfirmationEmail({
  toEmail,
  toName,
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
  toEmail: string;
  toName: string;
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
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "order@auriellefragrancestudio.com";
  const fromName = process.env.RESEND_FROM_NAME ?? "Aurielle Order Confirmation";

  if (!apiKey) {
    return { ok: false, error: "Email sending is not configured. Missing: RESEND_API_KEY." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: [toName ? `${toName} <${toEmail}>` : toEmail],
        subject: `Order Confirmation - ${orderNumber}`,
        html: renderOrderConfirmationEmailHtml({
          customerName: toName,
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
        }),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Resend API error (${res.status}): ${body}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed to send confirmation email" };
  }
}
