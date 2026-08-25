"use client";

import { useState } from "react";
import { StudioImageSlot } from "./studio-image-slot";

// Hover reveals the description on desktop (CSS group-hover); tap
// toggles it on touch devices, since hover doesn't fire reliably there.
export function FinishTile({
  name,
  description,
  image,
}: {
  name: string;
  description: string;
  image?: string;
}) {
  const [tapped, setTapped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setTapped((v) => !v)}
      className="group relative aspect-square w-full overflow-hidden border border-taupe/30 text-left"
    >
      <StudioImageSlot
        src={image}
        slotName={`Finish: ${name}`}
        canvas="240x240"
        aspectRatio="1:1"
        alt={`${name} finish sample`}
        sizes="240px"
        className="absolute inset-0"
      />
      <div
        className={`absolute inset-0 flex flex-col justify-end bg-ink/70 p-3 text-ivory transition-opacity ${
          tapped ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <p className="font-serif text-sm">{name}</p>
        <p className="mt-1 text-[11px] text-ivory/80">{description}</p>
      </div>
    </button>
  );
}
