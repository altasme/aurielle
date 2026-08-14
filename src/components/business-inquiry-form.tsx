"use client";

import { useState, type FormEvent } from "react";
import { FormField, FIELD_CLASSES } from "./form-field";
import { SubmitButton } from "./submit-button";
import { useSubmit } from "@/lib/use-submit";

export function BusinessInquiryForm() {
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [productInterest, setProductInterest] = useState("");
  const [estimatedQuantity, setEstimatedQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const { submitting, error, submit } = useSubmit();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await submit(async () => {
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
        throw new Error(data.error ?? "Could not send your inquiry. Please try again.");
      }
      return data;
    });
    if (result) setSent(true);
  }

  if (sent) {
    return (
      <p className="mt-12 text-sm text-ink/70">
        Thank you. Your inquiry has been received. We&rsquo;ll be in touch
        soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 space-y-5 text-left">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" value={name} onChange={setName} required />
        <FormField label="Business Name" value={businessName} onChange={setBusinessName} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Email" type="email" value={email} onChange={setEmail} required />
        <FormField label="Country" value={country} onChange={setCountry} required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label="Product / Material Interest"
          value={productInterest}
          onChange={setProductInterest}
        />
        <FormField
          label="Estimated Quantity"
          value={estimatedQuantity}
          onChange={setEstimatedQuantity}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">
          Message
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className={`mt-2 ${FIELD_CLASSES}`}
        />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <SubmitButton pending={submitting} pendingLabel="Sending...">
        Talk to the Atelier
      </SubmitButton>
    </form>
  );
}
