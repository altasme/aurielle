"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, FIELD_CLASSES } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { useSubmit } from "@/lib/use-submit";
import { formatMoney } from "@/lib/format-money";
import type { PromotionCategory, PromotionDetail, DiscountType } from "@/lib/admin/promotions";

type ProductOption = { id: string; name: string; price: number; currency: string; productTypeName: string | null };
type ProductTypeOption = { id: string; name: string };

// Timestamptz columns need a full ISO datetime; the form only asks for
// dates (spec: "start and end date"), so the start is pinned to the
// beginning of that day and the end to the end of it -- the promotion
// runs through the whole end date, not up to midnight at its start.
function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}
function startOfDayIso(date: string): string {
  return new Date(`${date}T00:00:00`).toISOString();
}
function endOfDayIso(date: string): string {
  return new Date(`${date}T23:59:59.999`).toISOString();
}

export function PromotionForm({
  category,
  categoryUrlSegment,
  promotion,
  products,
  productTypes,
}: {
  category: PromotionCategory;
  categoryUrlSegment: string;
  promotion?: PromotionDetail;
  products: ProductOption[];
  productTypes: ProductTypeOption[];
}) {
  const router = useRouter();
  const { submitting, error, submit } = useSubmit();

  const [name, setName] = useState(promotion?.name ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(promotion?.discountType ?? "percent");
  const [discountValue, setDiscountValue] = useState(promotion ? String(promotion.discountValue) : "");
  const [startsAt, setStartsAt] = useState(promotion ? toDateInput(promotion.startsAt) : "");
  const [endsAt, setEndsAt] = useState(promotion ? toDateInput(promotion.endsAt) : "");
  const [maxUses, setMaxUses] = useState(promotion?.maxUses != null ? String(promotion.maxUses) : "");
  const [minSpend, setMinSpend] = useState(promotion?.minSpend != null ? String(promotion.minSpend) : "");
  const [internalNotes, setInternalNotes] = useState(promotion?.internalNotes ?? "");
  const [enabled, setEnabled] = useState(promotion?.enabled ?? true);
  const [productIds, setProductIds] = useState<Set<string>>(new Set(promotion?.productIds ?? []));
  const [productTypeIds, setProductTypeIds] = useState<Set<string>>(new Set(promotion?.productTypeIds ?? []));
  const [itemSearch, setItemSearch] = useState("");

  const currency = category === "aurielle_collection" ? "₱" : "USD";

  const filteredProducts = useMemo(() => {
    const term = itemSearch.trim().toLowerCase();
    if (!term) return products;
    return products.filter((p) => p.name.toLowerCase().includes(term));
  }, [products, itemSearch]);

  function toggleProduct(id: string) {
    setProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleProductType(id: string) {
    setProductTypeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = {
      category,
      name,
      discountType,
      discountValue: Number(discountValue),
      startsAt: startOfDayIso(startsAt),
      endsAt: endOfDayIso(endsAt),
      maxUses: maxUses.trim() ? Number(maxUses) : null,
      minSpend: minSpend.trim() ? Number(minSpend) : null,
      internalNotes: internalNotes || null,
      enabled,
      productIds: [...productIds],
      productTypeIds: [...productTypeIds],
    };

    const result = await submit(async () => {
      const res = await fetch(promotion ? `/api/admin/promotions/${promotion.id}` : "/api/admin/promotions", {
        method: promotion ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save promotion");
      return data;
    });

    if (result) {
      if (promotion) router.refresh();
      else router.push(`/admin/promotions/${categoryUrlSegment}/product-promotions/${result.id}/edit`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-6">
      <FormField label="Campaign Name" value={name} onChange={setName} required />

      <fieldset className="space-y-3">
        <legend className="text-xs uppercase tracking-wide text-ink/60">Discount *</legend>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={discountType === "percent"} onChange={() => setDiscountType("percent")} />
            Percent off
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={discountType === "fixed"} onChange={() => setDiscountType("fixed")} />
            Fixed amount off
          </label>
        </div>
        <input
          type="number"
          min="0"
          step="0.01"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          placeholder={discountType === "percent" ? "e.g. 20" : `e.g. 50`}
          required
          className={`max-w-[200px] ${FIELD_CLASSES}`}
        />
        <p className="text-xs text-ink/50">
          {discountType === "percent" ? "Percent off each matching item's price." : `${currency} off each matching item's price.`}
        </p>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">Start Date *</label>
          <input
            type="date"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            required
            className={`mt-1.5 ${FIELD_CLASSES}`}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">End Date *</label>
          <input
            type="date"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
            className={`mt-1.5 ${FIELD_CLASSES}`}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">Number of Uses</label>
          <input
            type="number"
            min="1"
            step="1"
            value={maxUses}
            onChange={(e) => setMaxUses(e.target.value)}
            placeholder="Unlimited"
            className={`mt-1.5 ${FIELD_CLASSES}`}
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">Minimum Spend</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={minSpend}
            onChange={(e) => setMinSpend(e.target.value)}
            placeholder="None"
            className={`mt-1.5 ${FIELD_CLASSES}`}
          />
        </div>
      </div>

      {category === "atelier_supply" && productTypes.length > 0 && (
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">Item Groups</label>
          <p className="mt-1 text-xs text-ink/50">Every item in a checked group gets this discount.</p>
          <div className="mt-2 grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto border border-taupe/30 p-3 sm:grid-cols-3">
            {productTypes.map((type) => (
              <label key={type.id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={productTypeIds.has(type.id)} onChange={() => toggleProductType(type.id)} />
                {type.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">
          Specific Items {productIds.size > 0 && `(${productIds.size} selected)`}
        </label>
        <input
          type="text"
          value={itemSearch}
          onChange={(e) => setItemSearch(e.target.value)}
          placeholder="Search items..."
          className={`mt-1.5 ${FIELD_CLASSES}`}
        />
        <div className="mt-2 max-h-64 overflow-y-auto border border-taupe/30">
          {filteredProducts.map((product) => (
            <label
              key={product.id}
              className="flex items-center justify-between gap-3 border-b border-taupe/10 px-3 py-2 text-sm last:border-0 hover:bg-beige/20"
            >
              <span className="flex items-center gap-2">
                <input type="checkbox" checked={productIds.has(product.id)} onChange={() => toggleProduct(product.id)} />
                {product.name}
                {product.productTypeName && <span className="text-xs text-ink/40">({product.productTypeName})</span>}
              </span>
              <span className="text-xs text-ink/50">{formatMoney(product.currency, product.price)}</span>
            </label>
          ))}
          {filteredProducts.length === 0 && <p className="px-3 py-6 text-center text-xs text-ink/40">No items found.</p>}
        </div>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Internal Notes</label>
        <textarea
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          rows={3}
          placeholder="Not shown to customers."
          className={`mt-1.5 ${FIELD_CLASSES}`}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Enabled
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <SubmitButton pending={submitting} pendingLabel="Saving...">
        {promotion ? "Save Changes" : "Create Promotion"}
      </SubmitButton>
    </form>
  );
}
