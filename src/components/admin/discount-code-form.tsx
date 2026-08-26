"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, FIELD_CLASSES } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { useSubmit } from "@/lib/use-submit";
import type { PromotionCategory, DiscountType } from "@/lib/admin/promotions";
import type { DiscountCodeDetail } from "@/lib/admin/discount-codes";

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}
function startOfDayIso(date: string): string {
  return new Date(`${date}T00:00:00`).toISOString();
}
function endOfDayIso(date: string): string {
  return new Date(`${date}T23:59:59.999`).toISOString();
}

export function DiscountCodeForm({
  category,
  categoryUrlSegment,
  discountCode,
}: {
  category: PromotionCategory;
  categoryUrlSegment: string;
  discountCode?: DiscountCodeDetail;
}) {
  const router = useRouter();
  const { submitting, error, submit } = useSubmit();

  const [name, setName] = useState(discountCode?.name ?? "");
  const [code, setCode] = useState(discountCode?.code ?? "");
  const [discountType, setDiscountType] = useState<DiscountType>(discountCode?.discountType ?? "percent");
  const [discountValue, setDiscountValue] = useState(discountCode ? String(discountCode.discountValue) : "");
  const [startsAt, setStartsAt] = useState(discountCode ? toDateInput(discountCode.startsAt) : "");
  const [endsAt, setEndsAt] = useState(discountCode ? toDateInput(discountCode.endsAt) : "");
  const [maxUses, setMaxUses] = useState(discountCode?.maxUses != null ? String(discountCode.maxUses) : "");
  const [minSpend, setMinSpend] = useState(discountCode?.minSpend != null ? String(discountCode.minSpend) : "");
  const [internalNotes, setInternalNotes] = useState(discountCode?.internalNotes ?? "");
  const [enabled, setEnabled] = useState(discountCode?.enabled ?? true);

  const currency = category === "aurielle_collection" ? "₱" : "USD";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const body = {
      category,
      name,
      code,
      discountType,
      discountValue: Number(discountValue),
      startsAt: startOfDayIso(startsAt),
      endsAt: endOfDayIso(endsAt),
      maxUses: maxUses.trim() ? Number(maxUses) : null,
      minSpend: minSpend.trim() ? Number(minSpend) : null,
      internalNotes: internalNotes || null,
      enabled,
    };

    const result = await submit(async () => {
      const res = await fetch(discountCode ? `/api/admin/discount-codes/${discountCode.id}` : "/api/admin/discount-codes", {
        method: discountCode ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save discount code");
      return data;
    });

    if (result) {
      if (discountCode) router.refresh();
      else router.push(`/admin/promotions/${categoryUrlSegment}/discount-codes/${result.id}/edit`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-6">
      <FormField label="Campaign Name" value={name} onChange={setName} required />

      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Code * (up to 6 characters)</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          required
          placeholder="SAVE10"
          className={`mt-1.5 max-w-[200px] font-mono uppercase ${FIELD_CLASSES}`}
        />
      </div>

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
          placeholder={discountType === "percent" ? "e.g. 20" : "e.g. 50"}
          required
          className={`max-w-[200px] ${FIELD_CLASSES}`}
        />
        <p className="text-xs text-ink/50">
          {discountType === "percent" ? "Percent off the whole order." : `${currency} off the whole order.`}
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
        {discountCode ? "Save Changes" : "Create Discount Code"}
      </SubmitButton>
    </form>
  );
}
