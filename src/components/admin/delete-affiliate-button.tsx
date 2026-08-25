"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteAffiliateButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/affiliates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete affiliate");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete affiliate");
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs uppercase tracking-wide text-red-700 underline"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6">
      <div className="w-full max-w-sm border border-taupe/20 bg-white p-6">
        <h2 className="font-serif text-lg text-ink">Delete Affiliate?</h2>
        <p className="mt-2 text-sm text-ink/70">
          Are you sure you want to delete <span className="font-medium">{name}</span>&rsquo;s
          affiliate application? This action cannot be undone.
        </p>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="px-4 py-2 text-sm text-ink/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-700 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Affiliate"}
          </button>
        </div>
      </div>
    </div>
  );
}
