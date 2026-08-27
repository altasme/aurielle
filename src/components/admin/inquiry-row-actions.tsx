"use client";

import { useRouter } from "next/navigation";
import { useSubmit } from "@/lib/use-submit";
import { DeleteConfirmButton } from "./delete-confirm-button";

type Endpoint = "contact-inquiries" | "wholesale-inquiries" | "customisation-quotes";

// Actions column for the three Quotes and Inquiries tables (Contact,
// Business, Customisation Studio): an unread badge, "mark as read",
// and "move to junk" in the inbox view; "restore" and "delete
// permanently" in the junk view. The row itself opens the full
// conversation (InquiryThreadRow/InquiryThreadModal) on click, so this
// whole cell stops propagation -- otherwise clicking a button here
// would also pop the thread modal open.
export function InquiryRowActions({
  endpoint,
  id,
  viewed,
  view = "inbox",
}: {
  endpoint: Endpoint;
  id: string;
  viewed: boolean;
  view?: "inbox" | "junk";
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

  async function moveToJunk() {
    const result = await submit(async () => {
      const res = await fetch(`/api/admin/${endpoint}/${id}/junk`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to move to junk");
      return data;
    });
    if (result) router.refresh();
  }

  async function restore() {
    const result = await submit(async () => {
      const res = await fetch(`/api/admin/${endpoint}/${id}/restore`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to restore");
      return data;
    });
    if (result) router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-1.5" onClick={(e) => e.stopPropagation()}>
      {view === "inbox" && (
        <>
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
            disabled={submitting}
            onClick={moveToJunk}
            className="text-xs uppercase tracking-wide text-red-700 underline disabled:opacity-50"
          >
            Move to Junk
          </button>
          <span className="text-xs text-ink/40">View conversation &rarr;</span>
        </>
      )}
      {view === "junk" && (
        <>
          <button
            type="button"
            disabled={submitting}
            onClick={restore}
            className="text-xs uppercase tracking-wide text-burgundy underline disabled:opacity-50"
          >
            Restore
          </button>
          <DeleteConfirmButton
            endpoint={`/api/admin/${endpoint}/${id}`}
            title="Delete Permanently?"
            description="This cannot be undone."
          />
        </>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
