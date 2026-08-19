"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, FIELD_CLASSES } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { TagInput } from "@/components/admin/tag-input";
import { useSubmit } from "@/lib/use-submit";
import type { ProductCategory, ProductDetail, ProductStatus } from "@/lib/admin/products";

export function ProductForm({
  category,
  product,
  productTypeId,
  productTypeName,
  moodSuggestions,
}: {
  category: ProductCategory;
  product?: ProductDetail;
  // Atelier Supply, create mode only: the type chosen in the previous
  // step (AtelierTypePicker). Not shown/editable on the edit form.
  productTypeId?: string;
  productTypeName?: string;
  // Aurielle Collection: existing values, offered as suggestions for
  // the free-text mood field (admin can type any new one too).
  moodSuggestions?: string[];
}) {
  const router = useRouter();
  const { submitting, error, submit } = useSubmit();

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [size, setSize] = useState(product?.size ?? "");
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "draft");
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [mood, setMood] = useState<string>(product?.mood ?? "");

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
      {!product && category === "atelier_supply" && productTypeName && (
        <p className="text-xs uppercase tracking-wide text-ink/50">
          Product Type: <span className="text-ink">{productTypeName}</span>
        </p>
      )}
      {product && category === "atelier_supply" && product.productTypeName && (
        <p className="text-xs uppercase tracking-wide text-ink/50">
          Product Type: <span className="text-ink">{product.productTypeName}</span>
        </p>
      )}

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

      {category === "aurielle_collection" && (
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">
            Mood (optional &mdash; powers the &ldquo;Find Your Scent&rdquo; homepage filter)
          </label>
          <input
            type="text"
            list="mood-suggestions"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="e.g. Feminine, Warm, Elegant..."
            className={`mt-2 ${FIELD_CLASSES}`}
          />
          <datalist id="mood-suggestions">
            {(moodSuggestions ?? []).map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
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
