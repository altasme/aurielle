import Image from "next/image";

// Renders a real photo when one exists, otherwise the spec's own
// "placeholder rendering during development" convention: a solid
// brand-beige block naming the slot, canvas size and aspect ratio, so
// an empty slot is obvious and already correctly sized rather than
// silently missing or filled with a fabricated stock photo
// (launch-integrity rule -- no fake client work, ever).
export function StudioImageSlot({
  src,
  alt,
  slotName,
  canvas,
  aspectRatio,
  priority,
  sizes,
  className = "",
}: {
  src?: string;
  alt: string;
  slotName: string;
  canvas: string;
  aspectRatio: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  if (src) {
    // No baked-in "relative" here: callers must supply their own
    // position utility (e.g. "absolute inset-0" for a full-bleed hero,
    // "relative ..." elsewhere). Tailwind v4 emits .absolute before
    // .relative in its generated stylesheet, so a hardcoded "relative"
    // here would always beat a caller's "absolute" at equal
    // specificity, silently collapsing the wrapper to 0x0.
    return (
      <div className={`overflow-hidden ${className}`}>
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-1 border border-dashed border-taupe/40 bg-beige/60 p-4 text-center ${className}`}
    >
      <p className="text-xs uppercase tracking-wide text-ink/50">{slotName}</p>
      <p className="text-[11px] text-ink/40">
        {canvas} &middot; {aspectRatio}
      </p>
    </div>
  );
}
