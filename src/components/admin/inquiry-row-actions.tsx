"use client";

import { useRouter } from "next/navigation";
import { useSubmit } from "@/lib/use-submit";

// Shared actions column for the three Quotes and Inquiries tables
// (Contact, Business, Customisation Studio) -- same "mark as read"
// pattern as the affiliate status actions, plus a disabled "Reply via
// Aurielle Email" placeholder (spec: real send-from-admin is a later
// feature, not built yet -- see README for what's still needed there).
export function InquiryRowActions({
  endpoint,
  id,
  viewed,
}: {
  endpoint: "contact-inquiries" | "wholesale-inquiries" | "customisation-quotes";
  id: string;
  viewed: boolean;
}) {
  const router = useRouter();
  const { submitting, error, submit } = useSubmit();

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
      <button
        type="button"
        disabled
        title="Reply directly from the admin panel is under development. For now, reply using the email address above."
        className="cursor-not-allowed text-xs uppercase tracking-wide text-taupe underline decoration-dotted"
      >
        Reply via Aurielle Email
      </button>
      <span className="text-[10px] uppercase tracking-wide text-taupe/70">Under development</span>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
