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
                </span>
                <span>{formatMoney(item.currency, item.line_subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-taupe/20 pt-4 font-medium text-ink">
            <span>Total</span>
            <span>{formatMoney(result.order.currency, result.order.total)}</span>
          </div>
        </div>
      )}
    </>
  );
}
