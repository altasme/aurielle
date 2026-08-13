"use client";

import { useState, type FormEvent } from "react";

type LookupResult = {
  order: {
    order_number: string;
    business_line: string;
    currency: string;
    total: number;
    payment_method: string;
    payment_status: string;
    order_status: string;
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
  received: "Received",
  processing: "Processing",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export function OrderLookupForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const params = new URLSearchParams({ orderNumber, email });
      const res = await fetch(`/api/orders/lookup?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Order not found");
        return;
      }
      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-10 space-y-5 text-left">
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">
            Order Number
          </label>
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
            className="mt-2 w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm outline-none focus:border-burgundy"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-2 w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm outline-none focus:border-burgundy"
          />
        </div>
        {error && <p className="text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark disabled:opacity-50"
        >
          {loading ? "Searching..." : "Find Order"}
        </button>
      </form>

      {result && (
        <div className="mt-10 border border-taupe/30 p-6 text-left text-sm">
          <p className="font-serif text-lg text-ink">
            Order {result.order.order_number}
          </p>
          <p className="mt-1 text-burgundy">
            {ORDER_STATUS_LABELS[result.order.order_status] ?? result.order.order_status}
          </p>
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
                <span>
                  {item.currency} {item.line_subtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-taupe/20 pt-4 font-medium text-ink">
            <span>Total</span>
            <span>
              {result.order.currency} {result.order.total.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
