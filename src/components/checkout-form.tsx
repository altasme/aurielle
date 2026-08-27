"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { PAYMENT_METHODS, GCASH_INSTRUCTIONS, BANK_TRANSFER_INSTRUCTIONS } from "@/config/payment";
import type { PaymentMethod } from "@/config/payment";
import { FormField, FIELD_CLASSES } from "./form-field";
import { CountrySelect } from "./country-select";
import { SubmitButton } from "./submit-button";
import { useSubmit } from "@/lib/use-submit";
import { formatMoney } from "@/lib/format-money";

type BusinessLine = "collection" | "atelier_supply";

type ConfirmedOrder = {
  orderNumber: string;
  items: {
    name: string;
    quantity: number;
    lineSubtotal: number;
    currency: string;
    pricingUnit: string | null;
    promotionName: string | null;
    promotionDiscountAmount: number;
  }[];
  currency: string;
  subtotal: number;
  promotionDiscountTotal: number;
  discountCode: { code: string; name: string; amount: number } | null;
  total: number;
  paymentMethod: string;
  customerEmail: string;
};

type QuoteLine = { slug: string; promotionName: string | null; promotionDiscountAmount: number; lineTotal: number };
type Quote = {
  lines: QuoteLine[];
  currency: string;
  subtotal: number;
  promotionDiscountTotal: number;
  discountCode: { id: string; code: string; name: string; discountAmount: number } | null;
  codeError: string | null;
  total: number;
};

export function CheckoutForm({ businessLine }: { businessLine: BusinessLine }) {
  const cart = useCart();
  const items =
    businessLine === "collection" ? cart.state.collection : cart.state.supply;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [confirmed, setConfirmed] = useState<ConfirmedOrder | null>(null);
  const { submitting, error, setError, submit } = useSubmit();

  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const currency = items[0]?.currency ?? "";
  const itemsSignature = items.map((item) => `${item.slug}:${item.quantity}`).join(",");

  useEffect(() => {
    // Nothing to price for an empty cart -- and once it's empty, the
    // component renders its own "cart is empty" early return below
    // instead of this summary, so there's no stale `quote` to clear.
    if (items.length === 0) return;
    let cancelled = false;
    fetch("/api/checkout/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessLine,
        items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        discountCode: appliedCode || undefined,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (res.ok) setQuote(data);
      })
      .catch(() => {
        // Live pricing preview only -- if it fails, the plain
        // pre-discount subtotal below still renders, and the real
        // price is re-derived server-side on submit regardless.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsSignature, appliedCode, businessLine]);

  const browseHref = businessLine === "collection" ? "/collection" : "/atelier-supply";

  if (confirmed) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center lg:px-10">
        <h1 className="font-serif text-3xl text-ink">Thank You for Your Order</h1>
        <p className="mt-3 text-sm text-ink/60">
          Your order has been received and is awaiting payment verification.
        </p>

        <div className="mt-10 border border-taupe/30 p-6 text-left text-sm">
          <p className="font-serif text-lg text-ink">
            Order {confirmed.orderNumber}
          </p>
          <div className="mt-4 space-y-2">
            {confirmed.items.map((item) => (
              <div key={item.name} className="flex justify-between text-ink/70">
                <span>
                  {item.name} × {item.quantity}
                  {item.pricingUnit ? ` ${item.pricingUnit}` : ""}
                  {item.promotionName && (
                    <span className="ml-1.5 text-xs text-burgundy">({item.promotionName})</span>
                  )}
                </span>
                <span>{formatMoney(item.currency, item.lineSubtotal - item.promotionDiscountAmount)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 border-t border-taupe/20 pt-4">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatMoney(confirmed.currency, confirmed.subtotal)}</span>
            </div>
            {confirmed.promotionDiscountTotal > 0 && (
              <div className="flex justify-between text-burgundy">
                <span>Promotion discount</span>
                <span>&minus;{formatMoney(confirmed.currency, confirmed.promotionDiscountTotal)}</span>
              </div>
            )}
            {confirmed.discountCode && (
              <div className="flex justify-between text-burgundy">
                <span>Code {confirmed.discountCode.code}</span>
                <span>&minus;{formatMoney(confirmed.currency, confirmed.discountCode.amount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1.5 font-medium text-ink">
              <span>Total</span>
              <span>{formatMoney(confirmed.currency, confirmed.total)}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-ink/50">
            Payment method: {PAYMENT_METHODS.find((m) => m.id === confirmed.paymentMethod)?.label}
            <br />
            Confirmation sent to: {confirmed.customerEmail}
          </p>
        </div>

        <p className="mt-8 text-sm text-ink/60">
          You can check your order status any time at{" "}
          <Link href="/order-lookup" className="text-burgundy underline">
            Order Lookup
          </Link>{" "}
          using your order number and email.
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center lg:px-10">
        <h1 className="font-serif text-3xl text-ink">Your cart is empty</h1>
        <p className="mt-4 text-sm text-ink/60">
          <Link href={browseHref} className="text-burgundy underline">
            Browse {businessLine === "collection" ? "perfumes" : "materials"}
          </Link>{" "}
          to add something to your cart first.
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!paymentMethod || paymentMethod === "stripe") {
      setError("Please choose a payment method.");
      return;
    }
    if (!proofFile) {
      setError("Please upload proof of payment.");
      return;
    }

    const data = await submit(async () => {
      const payload = {
        businessLine,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerCountry: country,
        billing: { address, city, stateProvince, postalCode, country },
        shippingSameAsBilling: true,
        shipping: null,
        paymentMethod,
        items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        currency,
        subtotal,
        shippingCost: 0,
        total: subtotal,
        discountCode: quote?.discountCode ? quote.discountCode.code : undefined,
      };

      const formData = new FormData();
      formData.set("payload", JSON.stringify(payload));
      formData.set("proof", proofFile);

      const res = await fetch("/api/orders", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      return data as ConfirmedOrder;
    });

    if (data) {
      setConfirmed(data);
      if (businessLine === "collection") cart.clearCollectionCart();
      else cart.clearSupplyCart();
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 lg:px-10">
      <h1 className="text-center font-serif text-4xl text-ink">Checkout</h1>

      <div className="mt-8 border border-taupe/30 p-6 text-sm">
        {items.map((item) => {
          const line = quote?.lines.find((l) => l.slug === item.slug);
          return (
            <div key={item.slug} className="flex justify-between border-b border-taupe/15 py-2 last:border-0">
              <span>
                {"name" in item ? item.name : item.displayName} × {item.quantity}
                {"pricingUnit" in item ? ` ${item.pricingUnit}` : ""}
                {line?.promotionName && <span className="ml-1.5 text-xs text-burgundy">({line.promotionName})</span>}
              </span>
              <span>{formatMoney(item.currency, line?.lineTotal ?? item.price * item.quantity)}</span>
            </div>
          );
        })}

        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-ink/70">
            <span>Subtotal</span>
            <span>{formatMoney(currency, quote?.subtotal ?? subtotal)}</span>
          </div>
          {quote && quote.promotionDiscountTotal > 0 && (
            <div className="flex justify-between text-burgundy">
              <span>Promotion discount</span>
              <span>&minus;{formatMoney(currency, quote.promotionDiscountTotal)}</span>
            </div>
          )}
          {quote?.discountCode && (
            <div className="flex justify-between text-burgundy">
              <span>Code {quote.discountCode.code}</span>
              <span>&minus;{formatMoney(currency, quote.discountCode.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1.5 font-medium text-ink">
            <span>Total</span>
            <span>{formatMoney(currency, quote?.total ?? subtotal)}</span>
          </div>
        </div>

        <div className="mt-4 border-t border-taupe/15 pt-4">
          {quote?.discountCode ? (
            <div className="flex items-center justify-between text-xs text-ink/60">
              <span>
                Discount code <span className="font-medium text-ink">{quote.discountCode.code}</span> applied.
              </span>
              <button
                type="button"
                onClick={() => {
                  setAppliedCode(null);
                  setDiscountCodeInput("");
                }}
                className="text-burgundy underline"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60">Discount Code</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={discountCodeInput}
                  onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className={`max-w-[160px] ${FIELD_CLASSES}`}
                />
                <button
                  type="button"
                  onClick={() => setAppliedCode(discountCodeInput.trim() || null)}
                  disabled={!discountCodeInput.trim()}
                  className="border border-burgundy px-4 py-2 text-xs uppercase tracking-wide text-burgundy transition-colors hover:bg-burgundy hover:text-ivory disabled:opacity-40"
                >
                  Apply
                </button>
              </div>
              {quote?.codeError && <p className="mt-1.5 text-xs text-red-700">{quote.codeError}</p>}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <fieldset className="space-y-4">
          <legend className="font-serif text-xl text-ink">Your Details</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full Name" value={name} onChange={setName} required />
            <FormField label="Email" type="email" value={email} onChange={setEmail} required />
          </div>
          <FormField label="Phone" value={phone} onChange={setPhone} />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-serif text-xl text-ink">Shipping Address</legend>
          <FormField label="Address" value={address} onChange={setAddress} required />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="City" value={city} onChange={setCity} required />
            <FormField
              label="State / Province"
              value={stateProvince}
              onChange={setStateProvince}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Postal Code"
              value={postalCode}
              onChange={setPostalCode}
              required
            />
            <CountrySelect value={country} onChange={setCountry} required />
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-serif text-xl text-ink">Payment Method</legend>
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.id}
              className={`flex items-center gap-3 rounded-sm border px-4 py-3 text-sm transition-colors ${
                method.available
                  ? "cursor-pointer border-taupe/40 has-[:checked]:border-burgundy has-[:checked]:bg-burgundy/5"
                  : "cursor-not-allowed border-taupe/20 text-ink/40"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                disabled={!method.available}
                checked={paymentMethod === method.id}
                onChange={() => setPaymentMethod(method.id)}
              />
              {method.label}
              {method.note && (
                <span className="ml-auto text-xs uppercase tracking-wide text-taupe">
                  {method.note}
                </span>
              )}
            </label>
          ))}

          {paymentMethod === "gcash" && (
            <div className="border border-taupe/30 bg-beige/40 p-4 text-sm text-ink/70">
              <p>Send payment via GCash to:</p>
              <p className="mt-2">Account Name: {GCASH_INSTRUCTIONS.accountName}</p>
              <p>Account Number: {GCASH_INSTRUCTIONS.accountNumber}</p>
            </div>
          )}
          {paymentMethod === "bank_transfer" && (
            <div className="border border-taupe/30 bg-beige/40 p-4 text-sm text-ink/70">
              <p>Send payment via bank transfer to:</p>
              <p className="mt-2">Bank: {BANK_TRANSFER_INSTRUCTIONS.bankName}</p>
              <p>Account Name: {BANK_TRANSFER_INSTRUCTIONS.accountName}</p>
              <p>Account Number: {BANK_TRANSFER_INSTRUCTIONS.accountNumber}</p>
              <p>IBAN: {BANK_TRANSFER_INSTRUCTIONS.iban}</p>
              <p>SWIFT: {BANK_TRANSFER_INSTRUCTIONS.swift}</p>
            </div>
          )}

          {(paymentMethod === "gcash" || paymentMethod === "bank_transfer") && (
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60">
                Upload Proof of Payment
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                className={`mt-2 ${FIELD_CLASSES}`}
                required
              />
            </div>
          )}
        </fieldset>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <SubmitButton pending={submitting} pendingLabel="Submitting...">
          Submit Order
        </SubmitButton>
      </form>
    </div>
  );
}
