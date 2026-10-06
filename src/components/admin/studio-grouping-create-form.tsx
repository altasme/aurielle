"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FIELD_CLASSES } from "@/components/form-field";

export function StudioGroupingCreateForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    if (!name.trim() || !intro.trim()) {
      setError("Name and intro are required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/studio/groupings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), intro: intro.trim(), spotlight: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create grouping");
      router.push(`/admin/website/studio-groupings/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create grouping");
      setCreating(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border border-dashed border-taupe/30 bg-beige/20 p-6 text-left text-sm text-ink/60 transition-colors hover:border-burgundy hover:text-burgundy"
      >
        + Add a Grouping
      </button>
    );
  }

  return (
    <div className="border border-taupe/20 bg-white p-6">
      <p className="text-xs uppercase tracking-wide text-ink/50">New Grouping</p>
      <div className="mt-3 space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD_CLASSES} placeholder="Name" />
        <textarea
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          rows={3}
          className={FIELD_CLASSES}
          placeholder="Intro"
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="border border-burgundy px-4 py-2 text-xs uppercase tracking-wide text-burgundy transition-colors hover:bg-burgundy hover:text-ivory disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-xs uppercase tracking-wide text-ink/50 underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
