"use client";

import { useState } from "react";
import Image from "next/image";
import { cloudinaryDetailUrl, cloudinaryThumbUrl } from "@/lib/cloudinary-url";

export type GalleryImage = { url: string; isPrimary: boolean };

// Main photo + a thumbnail strip beneath it that swaps which photo is
// shown large, for any product with more than one uploaded image.
// Starts on the admin's chosen primary photo, wherever it sits in the
// display order, not necessarily the first thumbnail.
export function ProductImageGallery({ images, alt }: { images: GalleryImage[]; alt: string }) {
  const [selected, setSelected] = useState(() => Math.max(0, images.findIndex((img) => img.isPrimary)));
  const active = images[selected] as GalleryImage | undefined;

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden border border-taupe/30 bg-beige/40">
        {active && (
          <Image
            src={cloudinaryDetailUrl(active.url)}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={selected === i}
              className={`relative h-16 w-16 shrink-0 overflow-hidden border transition-colors sm:h-20 sm:w-20 ${
                selected === i ? "border-burgundy" : "border-taupe/30 hover:border-burgundy/60"
              }`}
            >
              <Image src={cloudinaryThumbUrl(img.url)} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
