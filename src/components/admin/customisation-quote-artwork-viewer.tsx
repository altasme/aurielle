"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function CustomisationQuoteArtworkViewer({ quoteId }: { quoteId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/customisation-quotes/${quoteId}/artwork`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Failed to load artwork");
          return;
        }
        setUrl(data.url);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load artwork");
      });
    return () => {
      cancelled = true;
    };
  }, [quoteId]);

  if (error) return <p className="text-xs text-ink/40">{error}</p>;
  if (!url) return <p className="text-xs text-ink/40">Loading artwork...</p>;

  const isImage = /\.(jpe?g|png|webp|svg)($|\?)/i.test(url);

  return (
    <div>
      {isImage && (
        <a href={url} target="_blank" rel="noreferrer" className="block max-w-[160px]">
          <div className="relative aspect-square overflow-hidden border border-taupe/30 bg-beige/40">
            <Image src={url} alt="Customer artwork" fill sizes="160px" className="object-contain" />
          </div>
        </a>
      )}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-1 inline-block text-xs uppercase tracking-wide text-burgundy underline"
      >
        Open File
      </a>
      <p className="mt-1 text-[11px] text-ink/40">Link expires in 5 minutes.</p>
    </div>
  );
}
