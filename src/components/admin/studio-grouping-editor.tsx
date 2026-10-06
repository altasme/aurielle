"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { AdminStudioGrouping, AdminStudioGroupingItem } from "@/lib/admin/studio-content";
import { resizeImageToWebp } from "@/lib/image-resize-client";
import { FIELD_CLASSES } from "@/components/form-field";
import { StudioGroupingItemRow } from "@/components/admin/studio-grouping-item-row";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";

export function StudioGroupingEditor({
  grouping,
  initialItems,
}: {
  grouping: AdminStudioGrouping;
  initialItems: AdminStudioGroupingItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState(grouping.name);
  const [intro, setIntro] = useState(grouping.intro);
  const [imageBrief, setImageBrief] = useState(grouping.imageBrief);
  const [spotlight, setSpotlight] = useState(grouping.spotlight);
  const [imageUrl, setImageUrl] = useState(grouping.imageUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState(initialItems);
  const [newLabel, setNewLabel] = useState("");
  const [addingItem, setAddingItem] = useState(false);

  const dirty = name !== grouping.name || intro !== grouping.intro || imageBrief !== grouping.imageBrief || spotlight !== grouping.spotlight;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/studio/groupings/${grouping.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, intro, imageBrief, spotlight }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      router.refresh();
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
      const resized = await resizeImageToWebp(file, 1200);
      const formData = new FormData();
      formData.append("file", resized, "grouping.webp");
      const res = await fetch(`/api/admin/studio/groupings/${grouping.id}/image`, { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to upload photo");
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAddItem() {
    if (!newLabel.trim()) return;
    setAddingItem(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/studio/groupings/${grouping.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add item");
      setItems((prev) => [...prev, data.item as AdminStudioGroupingItem]);
      setNewLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAddingItem(false);
    }
  }

  async function handleMoveItem(id: string, direction: -1 | 1) {
    const index = items.findIndex((i) => i.id === id);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    setItems(reordered);

    const res = await fetch(`/api/admin/studio/groupings/${grouping.id}/items/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((i) => i.id) }),
    });
    if (!res.ok) setError("Failed to save new item order");
  }

  return (
    <div>
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div>
          <div className="relative aspect-[11/9] w-full overflow-hidden bg-beige/40">
            {imageUrl ? (
              <Image src={imageUrl} alt="" fill sizes="320px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">No image</div>
            )}
          </div>
          <label
            className={`mt-3 inline-flex cursor-pointer items-center justify-center border border-burgundy px-4 py-2 text-xs uppercase tracking-wide text-burgundy transition-colors hover:bg-burgundy hover:text-ivory ${uploading ? "pointer-events-none opacity-50" : ""}`}
          >
            {uploading ? "Uploading..." : "Replace Photo"}
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
          <p className="mt-4 text-xs text-ink/40">
            Shown by default, and whenever a selected item below has no photo of its own.
          </p>
        </div>

        <div>
          <div className="space-y-3">
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={`mt-1 ${FIELD_CLASSES}`} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60">Intro</label>
              <textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} className={`mt-1 ${FIELD_CLASSES}`} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-ink/60">Image brief (internal note)</label>
              <input value={imageBrief} onChange={(e) => setImageBrief(e.target.value)} className={`mt-1 ${FIELD_CLASSES}`} />
            </div>
            <label className="flex items-center gap-2 text-sm text-ink/70">
              <input type="checkbox" checked={spotlight} onChange={(e) => setSpotlight(e.target.checked)} />
              Show on homepage (spotlight)
            </label>
          </div>
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
              className="border border-burgundy px-5 py-2 text-xs uppercase tracking-wide text-burgundy transition-colors hover:bg-burgundy hover:text-ivory disabled:opacity-40"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <DeleteConfirmButton
              endpoint={`/api/admin/studio/groupings/${grouping.id}`}
              title="Delete Grouping?"
              description={`Are you sure you want to delete "${grouping.name}" and all its items? This cannot be undone.`}
            />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-lg text-ink">Items</h2>
        <p className="mt-1 text-sm text-ink/60">
          Shown as clickable chips on the Studio page. Clicking one swaps the photo shown beside it to the item&rsquo;s own
          photo, or the grouping&rsquo;s main photo if it doesn&rsquo;t have one.
        </p>
        <div className="mt-4 space-y-2">
          {items.map((item, i) => (
            <StudioGroupingItemRow
              key={item.id}
              groupingId={grouping.id}
              item={item}
              index={i}
              total={items.length}
              onSaved={(updated) => setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
              onDeleted={(id) => setItems((prev) => prev.filter((x) => x.id !== id))}
              onMove={handleMoveItem}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="New item label"
            className={FIELD_CLASSES}
          />
          <button
            type="button"
            onClick={handleAddItem}
            disabled={addingItem || !newLabel.trim()}
            className="shrink-0 border border-burgundy px-4 py-2 text-xs uppercase tracking-wide text-burgundy transition-colors hover:bg-burgundy hover:text-ivory disabled:opacity-50"
          >
            {addingItem ? "Adding..." : "+ Add Item"}
          </button>
        </div>
      </div>
    </div>
  );
}
