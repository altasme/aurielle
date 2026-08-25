"use client";

import { useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { FormField, FIELD_CLASSES } from "./form-field";
import { SubmitButton } from "./submit-button";
import { useSubmit } from "@/lib/use-submit";
import { STUDIO_GROUPINGS } from "@/lib/data/studio-groupings";

export function StudioQuoteForm() {
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [grouping, setGrouping] = useState(searchParams.get("grouping") ?? "");
  const [itemInterest, setItemInterest] = useState(searchParams.get("item") ?? "");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [sent, setSent] = useState(false);

  const { submitting, error, submit } = useSubmit();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = await submit(async () => {
      const payload = {
        name,
        email,
        phone,
        country,
        grouping,
        itemInterest,
        quantity,
        message,
      };

      const formData = new FormData();
      formData.set("payload", JSON.stringify(payload));
      if (artworkFile) formData.set("artwork", artworkFile);

      const res = await fetch("/api/studio-quote", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not submit your quote request. Please try again.");
      return data;
    });
    if (result) setSent(true);
  }

  if (sent) {
    return (
      <p className="text-sm text-ink/70">
        Thank you. Your quote request has been received. The atelier will review
        your details and be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} id="quote" className="scroll-mt-24 space-y-5 text-left">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Name" value={name} onChange={setName} required />
        <FormField label="Email" type="email" value={email} onChange={setEmail} required />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Phone" value={phone} onChange={setPhone} />
        <FormField label="Country" value={country} onChange={setCountry} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">Grouping of Interest</label>
          <select
            value={grouping}
            onChange={(e) => setGrouping(e.target.value)}
            className={`mt-2 ${FIELD_CLASSES}`}
          >
            <option value="">Not sure / other</option>
            {STUDIO_GROUPINGS.map((g) => (
              <option key={g.slug} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <FormField label="Specific Item" value={itemInterest} onChange={setItemInterest} />
      </div>

      <FormField label="Approximate Quantity" value={quantity} onChange={setQuantity} />

      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Tell Us About Your Request</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className={`mt-2 ${FIELD_CLASSES}`}
        />
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Artwork / Logo (optional)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf,application/postscript"
          onChange={(e) => setArtworkFile(e.target.files?.[0] ?? null)}
          className={`mt-2 ${FIELD_CLASSES}`}
        />
        <p className="mt-1 text-xs text-ink/40">
          Have a file ready? Attach it so the atelier can quote accurately. No file yet? Submit
          anyway and send it later.
        </p>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <SubmitButton pending={submitting} pendingLabel="Sending...">
        Request a Quote
      </SubmitButton>
    </form>
  );
}
