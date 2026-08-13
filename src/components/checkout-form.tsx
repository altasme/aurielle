"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { PAYMENT_METHODS, GCASH_INSTRUCTIONS, BANK_TRANSFER_INSTRUCTIONS } from "@/config/payment";
import type { PaymentMethod } from "@/config/payment";
import { FormField } from "./form-field";

type BusinessLine = "collection" | "atelier_supply";

type ConfirmedOrder = {
  orderNumber: string;
  items: { name: string; quantity: number; lineSubtotal: number; currency: string; pricingUnit: string | null }[];
  currency: string;
  total: number;
  paymentMethod: string;
  customerEmail: string;
};

export function CheckoutForm({ businessLine }: { businessLine: BusinessLine }) {
  const cart = useCart();
  const items =
    businessLine === "collection" ? cart.state.collection : cart.state.supply;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customerCountry, setCustomerCountry] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedOrder | null>(null);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const currency = items[0]?.currency ?? "";

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
                </span>
                <span>
                  {item.currency} {item.lineSubtotal.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-taupe/20 pt-4 font-medium text-ink">
            <span>Total</span>
            <span>
              {confirmed.currency} {confirmed.total.toFixed(2)}
            </span>
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
    setError(null);

    if (!paymentMethod || paymentMethod === "stripe") {
      setError("Please choose a payment method.");
      return;
    }
    if (!proofFile) {
      setError("Please upload proof of payment.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        businessLine,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        customerCountry,
        billing: { address, city, stateProvince, postalCode, country: billingCountry },
        shippingSameAsBilling,
        shipping: null,
        paymentMethod,
        items: items.map((item) => ({ slug: item.slug, quantity: item.quantity })),
        currency,
        subtotal,
        shippingCost: 0,
        total: subtotal,
      };

      const formData = new FormData();
      formData.set("payload", JSON.stringify(payload));
      formData.set("proof", proofFile);

      const res = await fetch("/api/orders", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setConfirmed(data);
      if (businessLine === "collection") cart.clearCollectionCart();
      else cart.clearSupplyCart();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 lg:px-10">
      <h1 className="text-center font-serif text-4xl text-ink">Checkout</h1>

      <div className="mt-8 border border-taupe/30 p-6 text-sm">
        {items.map((item) => (
          <div
            key={item.slug}
            className="flex justify-between border-b border-taupe/15 py-2 last:border-0"
          >
            <span>
              {"name" in item ? item.name : item.displayName} × {item.quantity}
              {"pricingUnit" in item ? ` ${item.pricingUnit}` : ""}
            </span>
            <span>
              {item.currency} {(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="mt-2 flex justify-between font-medium text-ink">
          <span>Subtotal</span>
          <span>
            {currency} {subtotal.toFixed(2)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <fieldset className="space-y-4">
          <legend className="font-serif text-xl text-ink">Your Details</legend>
          <FormField label="Full Name" value={name} onChange={setName} required />
          <FormField label="Email" type="email" value={email} onChange={setEmail} required />
          <FormField label="Phone" value={phone} onChange={setPhone} />
          <FormField
            label="Country"
            value={customerCountry}
            onChange={setCustomerCountry}
            required
          />
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-serif text-xl text-ink">Billing Address</legend>
          <FormField label="Address" value={address} onChange={setAddress} required />
          <FormField label="City" value={city} onChange={setCity} required />
          <FormField
            label="State / Province"
            value={stateProvince}
            onChange={setStateProvince}
          />
          <FormField
            label="Postal Code"
            value={postalCode}
            onChange={setPostalCode}
            required
          />
          <FormField
            label="Country"
            value={billingCountry}
            onChange={setBillingCountry}
            required
          />
          <label className="flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={shippingSameAsBilling}
              onChange={(e) => setShippingSameAsBilling(e.target.checked)}
            />
            Shipping address same as billing
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-serif text-xl text-ink">Payment Method</legend>
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.id}
              className={`flex items-center gap-3 border px-4 py-3 text-sm ${
                method.available
                  ? "cursor-pointer border-taupe/40"
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
                className="mt-2 w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm"
                required
              />
            </div>
          )}
        </fieldset>

        {error && <p className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Order"}
        </button>
      </form>
    </div>
  );
}
