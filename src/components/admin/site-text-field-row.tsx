"use client";

import { useState } from "react";
import { useSubmit } from "@/lib/use-submit";
import { FIELD_CLASSES } from "@/components/form-field";
import type { TextFieldType } from "@/lib/site-content";

// One editable field on a Website Management page: label, input/
// textarea, Save (only enabled once actually changed), and a "Reset to
// original" link that only appears once this field has ever been
// edited away from the site's built-in copy.
export function SiteTextFieldRow({
  page,
  fieldKey,
  label,
  type,
  defaultValue,
  initialValue,
}: {
  page: string;
  fieldKey: string;
  label: string;
  type: TextFieldType;
  defaultValue: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const [savedValue, setSavedValue] = useState(initialValue);
  const { submitting, error, submit } = useSubmit();
  const dirty = value !== savedValue;
  const isDefault = savedValue === defaultValue;

  async function save() {
    const result = await submit(async () => {
      const res = await fetch(`/api/admin/site-content/${page}/text`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldKey, value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      return data;
    });
    if (result) setSavedValue(value);
  }

  async function reset() {
    const result = await submit(async () => {
      const res = await fetch(`/api/admin/site-content/${page}/text?field=${encodeURIComponent(fieldKey)}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to reset");
      return data;
    });
    if (result) {
      setValue(defaultValue);
      setSavedValue(defaultValue);
    }
  }

  return (
    <div className="border border-taupe/20 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs uppercase tracking-wide text-ink/50">{label}</label>
        {!isDefault && (
          <button type="button" onClick={reset} disabled={submitting} className="text-xs text-ink/40 underline disabled:opacity-50">
            Reset to original
          </button>
        )}
      </div>
      {type === "textarea" ? (
        <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} className={`mt-2 ${FIELD_CLASSES}`} />
      ) : (
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)} className={`mt-2 ${FIELD_CLASSES}`} />
      )}
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={submitting || !dirty}
          className="border border-burgundy px-4 py-1.5 text-xs uppercase tracking-wide text-burgundy transition-colors hover:bg-burgundy hover:text-ivory disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-burgundy"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
        {dirty && !submitting && <span className="text-xs text-ink/40">Unsaved changes</span>}
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
