"use client";

import { useRouter } from "next/navigation";
import { useSubmit } from "@/lib/use-submit";
import { InquiryReplyComposer } from "./inquiry-reply-composer";

// Shared actions column for the three Quotes and Inquiries tables
// (Contact, Business, Customisation Studio): a "mark as read" action
// (same pattern as the affiliate status actions) plus the "Reply via
// Aurielle Email" composer, which sends over SMTP via
// src/lib/email/send-reply.ts and marks the row read as a side effect.
export function InquiryRowActions({
  endpoint,
  id,
  viewed,
  toEmail,
  toName,
}: {
  endpoint: "contact-inquiries" | "wholesale-inquiries" | "customisation-quotes";
  id: string;
  viewed: boolean;
  toEmail: string;
  toName: string;
}) {
  const router = useRouter();
  const { submitting, error, submit } = useSubmit();

  const source = endpoint === "contact-inquiries" ? "contact" : endpoint === "wholesale-inquiries" ? "business" : "studio";

  async function markAsRead() {
    const result = await submit(async () => {
      const res = await fetch(`/api/admin/${endpoint}/${id}`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      return data;
    });
    if (result) router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      {!viewed && (
        <span className="rounded-sm bg-burgundy px-2 py-0.5 text-[10px] uppercase tracking-wide text-ivory">
          New
        </span>
      )}
      {!viewed && (
        <button
          type="button"
          disabled={submitting}
          onClick={markAsRead}
          className="text-xs uppercase tracking-wide text-ink/60 underline disabled:opacity-50"
        >
          Mark as Read
        </button>
      )}
      <InquiryReplyComposer
        source={source}
        id={id}
        toEmail={toEmail}
        toName={toName}
        defaultSubject="Re: Your inquiry to Aurielle Paris Atelier"
      />
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
