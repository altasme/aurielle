"use client";

import { useState } from "react";
import Link from "next/link";
import { Reveal } from "./reveal";
import { StudioImageSlot } from "./studio-image-slot";
import { track } from "@/lib/analytics";
import type { StudioGrouping } from "@/lib/data/studio-groupings";

// Clicking an item swaps the photo shown beside it (like a product
// gallery) instead of navigating away immediately -- items without
// their own photo yet just fall back to the grouping's default image.
// "Request a Quote" carries whichever item is currently selected, so
// the quote form's prefill (see StudioQuoteForm) still works.
export function StudioGroupingGallery({
  grouping,
  imageFirst,
}: {
  grouping: StudioGrouping;
  imageFirst: boolean;
}) {
  const itemImages = grouping.itemImages ?? {};
  const firstWithImage = grouping.items.find((item) => itemImages[item]);
  const [selected, setSelected] = useState<string | null>(firstWithImage ?? null);

  const src = (selected && itemImages[selected]) || grouping.image;
  const quoteHref = `/studio?grouping=${encodeURIComponent(grouping.name)}${
    selected ? `&item=${encodeURIComponent(selected)}` : ""
  }#quote`;

  function selectItem(item: string) {
    setSelected(item);
    track("Studio Category Clicked", { grouping: grouping.name, item });
  }

  return (
    <div
      className={`mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center ${
        imageFirst ? "" : "lg:[&>*:first-child]:order-2"
      }`}
    >
      <Reveal>
        <StudioImageSlot
          src={src}
          alt={selected ? `${selected} sample work` : `${grouping.name} sample work`}
          slotName={`grouping-image: ${grouping.name}`}
          canvas="640x520"
          aspectRatio="11:9"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="relative aspect-[11/9] w-full"
        />
      </Reveal>
      <Reveal delayMs={100}>
        <h2 className="font-serif text-2xl text-ink">{grouping.name}</h2>
        <p className="mt-3 max-w-md text-sm text-ink/60">{grouping.intro}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {grouping.items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectItem(item)}
              aria-pressed={selected === item}
              className={`rounded-sm border px-3 py-1.5 text-xs transition-colors ${
                selected === item
                  ? "border-burgundy bg-burgundy text-ivory"
                  : "border-taupe/30 bg-ivory text-ink/70 hover:border-burgundy hover:text-burgundy"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <Link
            href={quoteHref}
            onClick={() => track("Studio Category Clicked", { grouping: grouping.name, item: selected ?? "" })}
            className="inline-block border border-burgundy px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-burgundy transition-colors hover:bg-burgundy hover:text-ivory"
          >
            Request a Quote
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
