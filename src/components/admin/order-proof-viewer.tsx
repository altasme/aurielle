"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function OrderProofViewer({ orderId }: { orderId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/orders/${orderId}/proof`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? "Failed to load proof of payment");
          return;
        }
        setUrl(data.url);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load proof of payment");
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (error) return <p className="text-sm text-ink/50">{error}</p>;
  if (!url) return <p className="text-sm text-ink/50">Loading proof of payment...</p>;

  const isImage = /\.(jpe?g|png|webp)($|\?)/i.test(url);

  return (
    <div>
      {isImage && (
        <a href={url} target="_blank" rel="noreferrer" className="block max-w-xs">
          <div className="relative aspect-square overflow-hidden border border-taupe/30 bg-beige/40">
            <Image src={url} alt="Proof of payment" fill sizes="320px" className="object-contain" />
          </div>
        </a>
      )}
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-xs uppercase tracking-wide text-burgundy underline"
      >
        Open Full Size
      </a>
      <p className="mt-1 text-[11px] text-ink/40">Link expires in 5 minutes.</p>
    </div>
  );
}
