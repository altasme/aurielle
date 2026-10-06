"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { AdminStudioFinish } from "@/lib/admin/studio-content";
import { resizeImageToWebp } from "@/lib/image-resize-client";
import { FIELD_CLASSES } from "@/components/form-field";

type Finish = AdminStudioFinish;

function FinishRow({
  finish,
  index,
  total,
  onSaved,
  onDeleted,
  onMove,
}: {
  finish: Finish;
  index: number;
  total: number;
  onSaved: (finish: Finish) => void;
  onDeleted: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  const [name, setName] = useState(finish.name);
  const [description, setDescription] = useState(finish.description);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dirty = name !== finish.name || description !== finish.description;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/studio/finishes/${finish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      onSaved({ ...finish, name, description });
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
      formData.append("file", resized, "finish.webp");
      const res = await fetch(`/api/admin/studio/finishes/${finish.id}/image`, { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to upload photo");
      onSaved({ ...finish, name, description, imageUrl: data.url });
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
      const res = await fetch(`/api/admin/studio/finishes/${finish.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to delete");
      onDeleted(finish.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setSaving(false);
    }
  }

  return (
    <div className="flex gap-4 border border-taupe/20 bg-white p-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-beige/40">
        {finish.imageUrl ? (
          <Image src={finish.imageUrl} alt="" fill sizes="96px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-ink/30">No image</div>
        )}
      </div>
      <div className="flex-1">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={name} onChange={(e) => setName(e.target.value)} className={FIELD_CLASSES} placeholder="Name" />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={FIELD_CLASSES}
            placeholder="Description"
          />
        </div>
        {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs uppercase tracking-wide">
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || saving}
            className="border border-burgundy px-3 py-1.5 text-burgundy transition-colors hover:bg-burgundy hover:text-ivory disabled:opacity-40"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <label className={`cursor-pointer text-ink/60 hover:text-ink ${uploading ? "pointer-events-none opacity-50" : ""}`}>
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
          <button type="button" onClick={() => onMove(finish.id, -1)} disabled={index === 0} className="text-ink/50 hover:text-ink disabled:opacity-30">
            &larr; Move
          </button>
          <button
            type="button"
            onClick={() => onMove(finish.id, 1)}
            disabled={index === total - 1}
            className="text-ink/50 hover:text-ink disabled:opacity-30"
          >
            Move &rarr;
          </button>
          {confirmingDelete ? (
            <span className="flex items-center gap-2">
              <span className="text-ink/60">Delete this finish?</span>
              <button type="button" onClick={handleDelete} disabled={saving} className="text-red-700 underline">
                Confirm
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

export function StudioFinishesManager({ initialFinishes }: { initialFinishes: Finish[] }) {
  const [finishes, setFinishes] = useState(initialFinishes);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!newName.trim() || !newDescription.trim()) {
      setError("Name and description are required.");
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/studio/finishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), description: newDescription.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create finish");
      setFinishes((prev) => [...prev, data.finish as Finish]);
      setNewName("");
      setNewDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create finish");
    } finally {
      setCreating(false);
    }
  }

  async function handleMove(id: string, direction: -1 | 1) {
    const index = finishes.findIndex((f) => f.id === id);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= finishes.length) return;

    const reordered = [...finishes];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    setFinishes(reordered);

    const res = await fetch("/api/admin/studio/finishes/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: reordered.map((f) => f.id) }),
    });
    if (!res.ok) setError("Failed to save new order");
  }

  return (
    <div>
      <div className="space-y-3">
        {finishes.map((finish, i) => (
          <FinishRow
            key={finish.id}
            finish={finish}
            index={i}
            total={finishes.length}
            onSaved={(updated) => setFinishes((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))}
            onDeleted={(id) => setFinishes((prev) => prev.filter((f) => f.id !== id))}
            onMove={handleMove}
          />
        ))}
      </div>

      <div className="mt-6 border border-dashed border-taupe/30 bg-beige/20 p-4">
        <p className="text-xs uppercase tracking-wide text-ink/50">Add a Finish</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} className={FIELD_CLASSES} placeholder="Name" />
          <input
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className={FIELD_CLASSES}
            placeholder="Description"
          />
        </div>
        {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="mt-3 border border-burgundy px-4 py-2 text-xs uppercase tracking-wide text-burgundy transition-colors hover:bg-burgundy hover:text-ivory disabled:opacity-50"
        >
          {creating ? "Adding..." : "+ Add Finish"}
        </button>
        <p className="mt-2 text-xs text-ink/40">Upload a photo for it after adding, from the row above.</p>
      </div>
    </div>
  );
}
