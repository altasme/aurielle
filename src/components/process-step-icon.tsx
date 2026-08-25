// Simple line-art icons for the Atelier Supply process steps (spec
// v5.4: "icons only"). Minimal stroke icons, no baked-in text (brand-
// lock rule), scaled via className rather than fixed px so they stay
// crisp at the 64x64 canvas size the spec calls for.
export type ProcessStepIconName = "scent" | "packaging" | "branding" | "market";

const PATHS: Record<ProcessStepIconName, React.ReactNode> = {
  scent: (
    <>
      <path d="M10 3h4" />
      <path d="M11 3v3.5L8 10a3 3 0 0 0-1 2.24V19a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-6.76A3 3 0 0 0 16 10l-3-3.5V3" />
      <path d="M8 15h8" />
    </>
  ),
  packaging: (
    <>
      <path d="M3 8l9-4 9 4-9 4-9-4Z" />
      <path d="M3 8v9l9 4 9-4V8" />
      <path d="M12 12v9" />
    </>
  ),
  branding: (
    <>
      <path d="M3 11.5V4a1 1 0 0 1 1-1h7.5a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7Z" />
      <circle cx="8" cy="8" r="1.5" />
    </>
  ),
  market: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V10l7-6 7 6v11" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
};

export function ProcessStepIcon({
  name,
  className = "h-8 w-8",
}: {
  name: ProcessStepIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
