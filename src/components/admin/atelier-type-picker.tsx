"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FIELD_CLASSES } from "@/components/form-field";
import type { ProductType } from "@/lib/admin/products";

// Second step of the Atelier Supply "Add Product" flow: the product
// type is chosen once, here, rather than being an editable field on
// the form itself -- it's the sub-menu the product is organized under
// (Fragrances / Bottles / Pouches / Boxes / Labels, or an admin-added
// custom one). Two management actions live alongside the picker itself:
// adding a brand new type, and renaming an existing one (any type,
// including the five seeded ones -- products reference a type by ID,
// so a rename is always safe and shows up everywhere immediately).
export function AtelierTypePicker({ types: initialTypes }: { types: ProductType[] }) {
  const router = useRouter();
  const [types, setTypes] = useState(initialTypes);
  const [creating, setCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate() {
    if (!newTypeName.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/admin/product-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTypeName.trim() }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to create product type");
      return;
    }
    router.push(`/admin/products/new?category=atelier_supply&productType=${data.type.id}`);
  }

  function startEditing(type: ProductType) {
    setError(null);
    setEditingId(type.id);
    setEditName(type.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    setSubmitting(true);
    setError(null);
    const res = await fetch(`/api/admin/product-types/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to rename product type");
      return;
    }
    setTypes((current) => current.map((t) => (t.id === id ? data.type : t)).sort((a, b) => a.name.localeCompare(b.name)));
    setEditingId(null);
    setEditName("");
  }

  return (
    <div>
      <p className="mt-2 text-sm text-ink/60">Choose a product type to continue, or edit an existing one.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {types.map((type) =>
          editingId === type.id ? (
            <div key={type.id} className="border border-burgundy bg-white p-4">
              <label className="text-xs uppercase tracking-wide text-ink/60">Type Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                className={`mt-2 ${FIELD_CLASSES}`}
              />
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveEdit(type.id)}
                  disabled={submitting}
                  className="border border-burgundy px-4 py-1.5 text-xs uppercase tracking-wide text-burgundy disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={submitting}
                  className="text-xs uppercase tracking-wide text-ink/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={type.id} className="group relative border border-taupe/20 bg-white p-6 text-center transition-colors hover:border-burgundy">
              <Link
                href={`/admin/products/new?category=atelier_supply&productType=${type.id}`}
                className="block"
              >
                <h2 className="font-serif text-lg text-ink">{type.name}</h2>
              </Link>
              <button
                type="button"
                onClick={() => startEditing(type)}
                className="mt-2 text-xs uppercase tracking-wide text-ink/40 underline hover:text-burgundy"
              >
                Edit
              </button>
            </div>
          ),
        )}
      </div>

      <div className="mt-6 max-w-sm">
        {creating ? (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-wide text-ink/60">New Type Name</label>
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className={`mt-2 ${FIELD_CLASSES}`}
              />
            </div>
            <button
              type="button"
              onClick={handleCreate}
              disabled={submitting}
              className="border border-burgundy px-4 py-3 text-xs uppercase tracking-wide text-burgundy disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setNewTypeName("");
              }}
              className="px-4 py-3 text-xs uppercase tracking-wide text-ink/50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="text-xs uppercase tracking-wide text-burgundy underline"
          >
            + New Type
          </button>
        )}
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
