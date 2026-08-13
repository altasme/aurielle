"use client";

import { useState, type FormEvent } from "react";

export function BusinessInquiryForm() {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [productInterest, setProductInterest] = useState("");
  const [estimatedQuantity, setEstimatedQuantity] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "wholesale",
          name,
          businessName,
          email,
          country,
          productInterest,
          estimatedQuantity,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send your inquiry. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <p className="mt-12 text-sm text-ink/70">
        Thank you — your inquiry has been received. We&rsquo;ll be in touch
        soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 space-y-5 text-left">
      <Field label="Name" value={name} onChange={setName} required />
      <Field label="Business Name" value={businessName} onChange={setBusinessName} />
      <Field label="Email" type="email" value={email} onChange={setEmail} required />
      <Field label="Country" value={country} onChange={setCountry} required />
      <Field
        label="Product / Material Interest"
        value={productInterest}
        onChange={setProductInterest}
      />
      <Field
        label="Estimated Quantity"
        value={estimatedQuantity}
        onChange={setEstimatedQuantity}
      />
      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="mt-2 w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm outline-none focus:border-burgundy"
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Talk to the Atelier"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink/60">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm outline-none focus:border-burgundy"
      />
    </div>
  );
}
