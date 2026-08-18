"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, FIELD_CLASSES } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { TagInput } from "@/components/admin/tag-input";
import { useSubmit } from "@/lib/use-submit";
import type { ProductCategory, ProductDetail, ProductStatus, ProductType } from "@/lib/admin/products";
import { MOODS } from "@/lib/data/moods";

const PERFUME_TYPES = ["Perfume Oil", "Waterbased"] as const;

export function ProductForm({
  category,
  product,
  productTypes,
}: {
  category: ProductCategory;
  product?: ProductDetail;
  productTypes: ProductType[];
}) {
  const router = useRouter();
  const { submitting, error, submit } = useSubmit();

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [size, setSize] = useState(product?.size ?? "");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "draft");
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [perfumeType, setPerfumeType] = useState<string>(product?.perfumeType ?? "");
  const [mood, setMood] = useState<string>(product?.mood ?? "");
  const [productTypeId, setProductTypeId] = useState<string>(product?.productTypeId ?? "");

  const [types, setTypes] = useState(productTypes);
  const [creatingType, setCreatingType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [typeError, setTypeError] = useState<string | null>(null);

  async function handleCreateType(e: FormEvent) {
    e.preventDefault();
    setTypeError(null);
    if (!newTypeName.trim()) return;
    const res = await fetch("/api/admin/product-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTypeName.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setTypeError(data.error ?? "Failed to create product type");
      return;
    }
    setTypes((prev) => [...prev, data.type as ProductType]);
    setProductTypeId(data.type.id);
    setNewTypeName("");
    setCreatingType(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = {
      category,
      name,
      description,
      price: Number(price),
      size,
      status,
      tags,
      perfumeType: category === "aurielle_collection" ? perfumeType : undefined,
      mood: category === "aurielle_collection" ? mood || undefined : undefined,
      productTypeId: category === "atelier_supply" ? productTypeId : undefined,
    };

    const result = await submit(async () => {
      const res = await fetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save product");
      return data;
    });

    if (result) {
      if (product) {
        router.refresh();
      } else {
        router.push(`/admin/products/${result.id}/edit`);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">
      <FormField label="Product Name" value={name} onChange={setName} required />

      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Description *</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className={`mt-2 ${FIELD_CLASSES}`}
        />
      </div>

      {category === "aurielle_collection" ? (
        <TagInput label="Scent Tags" tags={tags} onChange={setTags} />
      ) : (
        <TagInput label="Product Tags" tags={tags} onChange={setTags} />
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Price (₱)" type="number" value={price} onChange={setPrice} required />
        <FormField label="Size" value={size} onChange={setSize} required />
      </div>

      {category === "aurielle_collection" ? (
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">Type *</label>
          <select
            value={perfumeType}
            onChange={(e) => setPerfumeType(e.target.value)}
            required
            className={`mt-2 ${FIELD_CLASSES}`}
          >
            <option value="" disabled>
              Select a type
            </option>
            {PERFUME_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-xs uppercase tracking-wide text-ink/60">
            Mood (optional &mdash; powers the &ldquo;Find Your Scent&rdquo; homepage filter)
          </label>
          <select value={mood} onChange={(e) => setMood(e.target.value)} className={`mt-2 ${FIELD_CLASSES}`}>
            <option value="">None</option>
            {MOODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">Product Type *</label>
          <select
            value={productTypeId}
            onChange={(e) => setProductTypeId(e.target.value)}
            required
            className={`mt-2 ${FIELD_CLASSES}`}
          >
            <option value="" disabled>
              Select a product type
            </option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {creatingType ? (
            <div className="mt-3 flex items-end gap-3">
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
                onClick={handleCreateType}
                className="border border-burgundy px-4 py-3 text-xs uppercase tracking-wide text-burgundy"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setCreatingType(false);
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
              onClick={() => setCreatingType(true)}
              className="mt-2 text-xs uppercase tracking-wide text-burgundy underline"
            >
              + New Type
            </button>
          )}
          {typeError && <p className="mt-2 text-sm text-red-700">{typeError}</p>}
        </div>
      )}

      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProductStatus)}
          className={`mt-2 ${FIELD_CLASSES}`}
        >
          <option value="draft">Draft (hidden from public site)</option>
          <option value="active">Active (visible on public site)</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      <SubmitButton pending={submitting} pendingLabel="Saving...">
        {product ? "Save Changes" : "Create Product"}
      </SubmitButton>
    </form>
  );
}
