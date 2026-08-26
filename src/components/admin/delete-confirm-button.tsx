"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Generic delete-with-confirm button (DELETE to `endpoint`, then
// router.refresh()) -- same interaction as DeleteProductButton, just
// parameterized instead of duplicated for promotions/discount codes.
export function DeleteConfirmButton({
  endpoint,
  title,
  description,
}: {
  endpoint: string;
  title: string;
  description: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6" onClick={() => setConfirming(false)}>
      <div className="w-full max-w-sm border border-taupe/20 bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-serif text-lg text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink/70">{description}</p>
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
            className="bg-red-700 px-4 py-2 text-sm text-ivory disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
