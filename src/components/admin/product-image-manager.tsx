"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/admin/products";

export function ProductImageManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ProductImage[];
}) {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to upload image");
      setImages((prev) => [...prev, data.image as ProductImage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSetPrimary(imageId: string) {
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPrimary: true }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to set primary image");
      return;
    }
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
  }

  async function handleDelete(imageId: string) {
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to delete image");
      return;
    }
    setImages((prev) => {
      const remaining = prev.filter((img) => img.id !== imageId);
      const removed = prev.find((img) => img.id === imageId);
      if (removed?.isPrimary && remaining.length > 0) {
        const next = [...remaining].sort((a, b) => a.sortOrder - b.sortOrder)[0];
        return remaining.map((img) => ({ ...img, isPrimary: img.id === next.id }));
      }
      return remaining;
    });
  }

  async function handleMove(imageId: string, direction: -1 | 1) {
    const index = sorted.findIndex((img) => img.id === imageId);
    const swapWith = index + direction;
    if (swapWith < 0 || swapWith >= sorted.length) return;

    const reordered = [...sorted];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];
    const order = reordered.map((img) => img.id);

    setImages(reordered.map((img, i) => ({ ...img, sortOrder: i })));
    setError(null);
    const res = await fetch(`/api/admin/products/${productId}/images`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to reorder images");
    }
  }

  return (
    <div>
      {sorted.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {sorted.map((img, index) => (
            <div key={img.id} className="border border-taupe/20 bg-white p-2">
              <div className="relative aspect-square overflow-hidden bg-beige/40">
                <Image src={img.cloudinaryUrl} alt="" fill sizes="200px" className="object-cover" />
                {img.isPrimary && (
                  <span className="absolute left-1 top-1 rounded-sm bg-burgundy px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-ivory">
                    Primary
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => handleMove(img.id, -1)}
                  disabled={index === 0}
                  className="text-ink/50 hover:text-ink disabled:opacity-30"
                  aria-label="Move earlier"
                >
                  &larr;
                </button>
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    className="text-burgundy underline"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleMove(img.id, 1)}
                  disabled={index === sorted.length - 1}
                  className="text-ink/50 hover:text-ink disabled:opacity-30"
                  aria-label="Move later"
                >
                  &rarr;
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(img.id)}
                className="mt-1 w-full text-xs uppercase tracking-wide text-red-700 underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      <div className="mt-4">
        <label
          htmlFor="product-image-upload"
          aria-disabled={uploading}
          className={`inline-flex cursor-pointer items-center justify-center border border-burgundy px-6 py-2.5 text-xs uppercase tracking-wide text-burgundy transition-colors hover:bg-burgundy hover:text-ivory ${uploading ? "pointer-events-none opacity-50" : ""}`}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </label>
        <input
          ref={fileInputRef}
          id="product-image-upload"
          type="file"
          accept="image/*"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
          }}
          className="sr-only"
        />
      </div>
    </div>
  );
}
