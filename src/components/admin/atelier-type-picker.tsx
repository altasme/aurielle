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
// custom one).
export function AtelierTypePicker({ types }: { types: ProductType[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
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

  return (
    <div>
      <p className="mt-2 text-sm text-ink/60">Choose a product type to continue.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {types.map((type) => (
          <Link
            key={type.id}
            href={`/admin/products/new?category=atelier_supply&productType=${type.id}`}
            className="border border-taupe/20 bg-white p-6 text-center transition-colors hover:border-burgundy"
          >
            <h2 className="font-serif text-lg text-ink">{type.name}</h2>
          </Link>
        ))}
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
