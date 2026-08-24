"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "./form-field";
import { SubmitButton } from "./submit-button";
import { useSubmit } from "@/lib/use-submit";

export function AffiliateForm() {
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [shopeeId, setShopeeId] = useState("");
  const [fbPage, setFbPage] = useState("");
  const [tiktokAccount, setTiktokAccount] = useState("");
  const [sent, setSent] = useState(false);

  const { submitting, error, submit } = useSubmit();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await submit(async () => {
      const res = await fetch("/api/affiliate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, mobileNumber, email, shopeeId, fbPage, tiktokAccount }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not submit your application. Please try again.");
      }
      return data;
    });
    if (result) setSent(true);
  }

  if (sent) {
    return (
      <p className="mt-12 text-sm text-ink/70">
        Thank you. Your affiliate application has been received. We&rsquo;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-12 space-y-5 text-left">
      <FormField label="Name" value={name} onChange={setName} required />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Mobile Number" value={mobileNumber} onChange={setMobileNumber} required />
        <FormField label="Email Address" type="email" value={email} onChange={setEmail} required />
      </div>
      <FormField label="Shopee ID" value={shopeeId} onChange={setShopeeId} />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="FB Page" value={fbPage} onChange={setFbPage} />
        <FormField label="TikTok Account" value={tiktokAccount} onChange={setTiktokAccount} />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <SubmitButton pending={submitting} pendingLabel="Submitting...">
        Submit Application
      </SubmitButton>
    </form>
  );
}
