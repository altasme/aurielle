"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { AdminStudioGroupingItem } from "@/lib/admin/studio-content";
import { resizeImageToWebp } from "@/lib/image-resize-client";
import { FIELD_CLASSES } from "@/components/form-field";

export function StudioGroupingItemRow({
  groupingId,
  item,
  index,
  total,
  onSaved,
  onDeleted,
  onMove,
}: {
  groupingId: string;
  item: AdminStudioGroupingItem;
  index: number;
  total: number;
  onSaved: (item: AdminStudioGroupingItem) => void;
  onDeleted: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  const [label, setLabel] = useState(item.label);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/studio/groupings/${groupingId}/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      onSaved({ ...item, label });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const resized = await resizeImageToWebp(file, 700);
      const formData = new FormData();
      formData.append("file", resized, "item.webp");
      const res = await fetch(`/api/admin/studio/groupings/${groupingId}/items/${item.id}/image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to upload photo");
      onSaved({ ...item, label, imageUrl: data.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/studio/groupings/${groupingId}/items/${item.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to delete");
      onDeleted(item.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-3 border border-taupe/20 bg-white p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-beige/40">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[9px] text-ink/30">Falls back</div>
        )}
      </div>
      <div className="flex-1">
        <input value={label} onChange={(e) => setLabel(e.target.value)} className={FIELD_CLASSES} placeholder="Item label" />
        {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-wide">
          <button
            type="button"
            onClick={handleSave}
            disabled={label === item.label || saving}
            className="border border-burgundy px-2.5 py-1 text-burgundy transition-colors hover:bg-burgundy hover:text-ivory disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <label className={`cursor-pointer text-ink/60 hover:text-ink ${uploading ? "pointer-events-none opacity-50" : ""}`}>
            {uploading ? "Uploading..." : "Photo"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
              }}
            />
          </label>
          <button type="button" onClick={() => onMove(item.id, -1)} disabled={index === 0} className="text-ink/50 hover:text-ink disabled:opacity-30">
            &larr;
          </button>
          <button
            type="button"
            onClick={() => onMove(item.id, 1)}
            disabled={index === total - 1}
            className="text-ink/50 hover:text-ink disabled:opacity-30"
          >
            &rarr;
          </button>
          {confirmingDelete ? (
            <span className="flex items-center gap-2">
              <button type="button" onClick={handleDelete} disabled={saving} className="text-red-700 underline">
                Confirm delete
              </button>
              <button type="button" onClick={() => setConfirmingDelete(false)} className="text-ink/50 underline">
                Cancel
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirmingDelete(true)} className="text-red-700 underline">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
