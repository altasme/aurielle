"use client";

import { useState, type KeyboardEvent } from "react";
import { FIELD_CLASSES } from "@/components/form-field";

export function TagInput({
  label,
  tags,
  onChange,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const value = draft.trim();
    if (!value) return;
    if (!tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      onChange([...tags, value]);
    }
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink/60">{label}</label>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-sm border border-taupe/30 bg-beige/40 px-2.5 py-1 text-xs text-ink/80"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((t) => t !== tag))}
                className="text-ink/40 hover:text-red-700"
                aria-label={`Remove ${tag}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder="Type a tag and press Enter"
        className={`mt-2 ${FIELD_CLASSES}`}
      />
    </div>
  );
}
