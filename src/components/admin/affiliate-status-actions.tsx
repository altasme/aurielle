"use client";

import { useRouter } from "next/navigation";
import { useSubmit } from "@/lib/use-submit";
import type { AffiliateStatus } from "@/lib/admin/affiliate-constants";

export function AffiliateStatusActions({ id, status }: { id: string; status: AffiliateStatus }) {
  const router = useRouter();
  const { submitting, error, submit } = useSubmit();

  async function setStatus(next: AffiliateStatus) {
    const result = await submit(async () => {
      const res = await fetch(`/api/admin/affiliates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update application");
      return data;
    });
    if (result) router.refresh();
  }

  if (status === "pending") {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={() => setStatus("approved")}
            className="text-xs uppercase tracking-wide text-green-700 underline disabled:opacity-50"
          >
            Approve
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => setStatus("rejected")}
            className="text-xs uppercase tracking-wide text-red-700 underline disabled:opacity-50"
          >
            Reject
          </button>
        </div>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        disabled={submitting}
        onClick={() => setStatus("pending")}
        className="text-xs uppercase tracking-wide text-ink/50 underline disabled:opacity-50"
      >
        Reset to New
      </button>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
