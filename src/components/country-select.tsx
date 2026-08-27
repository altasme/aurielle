"use client";

import { FIELD_CLASSES } from "./form-field";
import { COUNTRIES } from "@/lib/countries";

// Shared country dropdown -- every form that asks for a country
// (checkout, contact, business inquiry, studio quote) uses this
// instead of a free-text field, so submissions are consistently
// spelled/matchable instead of "Philipines"/"PH"/"philippines".
export function CountrySelect({
  label = "Country",
  value,
  onChange,
  required = false,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink/60">
        {label}
        {required && " *"}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`mt-2 ${FIELD_CLASSES}`}
      >
        <option value="" disabled>
          Select a country
        </option>
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
