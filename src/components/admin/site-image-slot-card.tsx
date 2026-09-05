"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useSubmit } from "@/lib/use-submit";

// One photo slot on a Website Management page: current photo, a guide
// (recommended size/aspect ratio/file type) so a non-technical client
// knows what to upload before she picks a file, Replace, and a "Reset
// to original photo" link once it's ever been replaced.
export function SiteImageSlotCard({
  page,
  slotKey,
  label,
  recommendedSize,
  aspectRatio,
  format,
  maxSizeMb,
  defaultValue,
  initialValue,
}: {
  page: string;
  slotKey: string;
  label: string;
  recommendedSize: string;
  aspectRatio: string;
  format: string;
  maxSizeMb: number;
  defaultValue: string;
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  const { submitting, error, submit } = useSubmit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDefault = value === defaultValue;
  const inputId = `site-image-${page}-${slotKey}`;

  async function handleUpload(file: File) {
    const result = await submit(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/site-content/${page}/images/${slotKey}`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to upload photo");
      return data;
    });
    if (result) setValue(result.url);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleReset() {
    const result = await submit(async () => {
      const res = await fetch(`/api/admin/site-content/${page}/images/${slotKey}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to reset photo");
      return data;
    });
    if (result) setValue(defaultValue);
  }

  return (
    <div className="border border-taupe/20 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <div className="relative mt-3 aspect-video w-full overflow-hidden bg-beige/40">
        <Image src={value} alt="" fill sizes="400px" className="object-cover" />
      </div>

      <div className="mt-3 space-y-0.5 rounded-sm bg-beige/40 p-3 text-xs text-ink/60">
        <p>
          <span className="font-medium text-ink/70">Recommended size:</span> {recommendedSize}
        </p>
        <p>
          <span className="font-medium text-ink/70">Aspect ratio:</span> {aspectRatio}
        </p>
        <p>
          <span className="font-medium text-ink/70">File type:</span> {format}, up to {maxSizeMb}MB
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label
          htmlFor={inputId}
          aria-disabled={submitting}
          className={`inline-flex cursor-pointer items-center justify-center border border-burgundy px-4 py-1.5 text-xs uppercase tracking-wide text-burgundy transition-colors hover:bg-burgundy hover:text-ivory ${submitting ? "pointer-events-none opacity-50" : ""}`}
        >
          {submitting ? "Uploading..." : "Replace Photo"}
        </label>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/*"
          disabled={submitting}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
          className="sr-only"
        />
        {!isDefault && (
          <button type="button" onClick={handleReset} disabled={submitting} className="text-xs text-ink/40 underline disabled:opacity-50">
            Reset to original photo
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
