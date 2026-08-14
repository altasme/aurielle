"use client";

// Shared with every hand-rolled <textarea>/<select>/file <input> across
// the form components, so input styling (and any future tweak to it)
// can't drift out of sync between them.
export const FIELD_CLASSES =
  "w-full rounded-sm border border-taupe/40 bg-ivory px-4 py-3 text-sm outline-none transition-colors focus:border-burgundy focus:ring-1 focus:ring-burgundy/20";

export function FormField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink/60">
        {label}
        {required && " *"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`mt-2 ${FIELD_CLASSES}`}
      />
    </div>
  );
}
