"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";
import { useSubmit } from "@/lib/use-submit";
import { formatMoney } from "@/lib/format-money";

type LookupResult = {
  order: {
    order_number: string;
    business_line: string;
    currency: string;
    subtotal: number;
    promotion_discount_total: number;
    discount_code_amount: number;
    discount_code: { code: string; name: string } | null;
    total: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
    courier_name: string | null;
    tracking_number: string | null;
    created_at: string;
  };
  items: {
    name_snapshot: string;
    quantity: number;
    line_subtotal: number;
    currency: string;
    pricing_unit: string | null;
    promotion_discount_amount: number;
    promotion_name: string | null;
  }[];
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_verification: "Awaiting payment verification",
  to_pack: "Being Packed",
  to_ship: "Preparing to Ship",
  shipped_out: "Shipped Out",
  cancelled: "Cancelled",
};

export function OrderLookupForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<LookupResult | null>(null);

  const { submitting, error, submit } = useSubmit();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setResult(null);
    const data = await submit(async () => {
      const params = new URLSearchParams({ orderNumber, email });
      const res = await fetch(`/api/orders/lookup?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order not found");
      return data as LookupResult;
    });
    if (data) setResult(data);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-10 space-y-5 text-left">
        <FormField
          label="Order Number"
          value={orderNumber}
          onChange={setOrderNumber}
          required
        />
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <SubmitButton pending={submitting} pendingLabel="Searching...">
          Find Order
        </SubmitButton>
      </form>

      {result && (
        <div className="mt-10 border border-taupe/30 p-6 text-left text-sm">
          <p className="font-serif text-lg text-ink">
            Order {result.order.order_number}
          </p>
          <p className="mt-1 text-burgundy">
            {ORDER_STATUS_LABELS[result.order.order_status] ?? result.order.order_status}
          </p>
          {result.order.order_status === "shipped_out" && result.order.tracking_number && (
            <p className="mt-1 text-ink/70">
              {result.order.courier_name ? `${result.order.courier_name} — ` : ""}
              Tracking: {result.order.tracking_number}
            </p>
          )}
          <div className="mt-4 space-y-2">
            {result.items.map((item) => (
              <div
                key={item.name_snapshot}
                className="flex justify-between text-ink/70"
              >
                <span>
                  {item.name_snapshot} × {item.quantity}
                  {item.pricing_unit ? ` ${item.pricing_unit}` : ""}
                  {item.promotion_name && (
                    <span className="ml-1.5 text-xs text-burgundy">({item.promotion_name})</span>
                  )}
                </span>
                <span>{formatMoney(item.currency, item.line_subtotal - item.promotion_discount_amount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 border-t border-taupe/20 pt-4">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatMoney(result.order.currency, result.order.subtotal)}</span>
            </div>
            {result.order.promotion_discount_total > 0 && (
              <div className="flex justify-between text-burgundy">
                <span>Promotion discount</span>
                <span>&minus;{formatMoney(result.order.currency, result.order.promotion_discount_total)}</span>
              </div>
            )}
            {result.order.discount_code && (
              <div className="flex justify-between text-burgundy">
                <span>Code {result.order.discount_code.code}</span>
                <span>&minus;{formatMoney(result.order.currency, result.order.discount_code_amount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1.5 font-medium text-ink">
              <span>Total</span>
              <span>{formatMoney(result.order.currency, result.order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
