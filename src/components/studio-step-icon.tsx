// Line-art icons for the Studio's "How It Works" stepper (spec:
// "icons only", NEW placeholder status -- these are meant to be built
// now, unlike photo slots). No baked-in text (brand-lock rule).
export type StudioStepIconName = "upload" | "proof" | "print" | "delivered";

const PATHS: Record<StudioStepIconName, React.ReactNode> = {
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="M7 9l5-5 5 5" />
      <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </>
  ),
  proof: (
    <>
      <path d="M5 3h9l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h5" />
      <path d="m9 14 2 2 4-4" />
    </>
  ),
  print: (
    <>
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-2" />
      <path d="M6 14h12v7H6z" />
    </>
  ),
  delivered: (
    <>
      <path d="M3 8l9-4 9 4-9 4-9-4Z" />
      <path d="M3 8v9l9 4 9-4V8" />
      <path d="M12 12v9" />
      <path d="m8 6 8 4" />
    </>
  ),
};

export function StudioStepIcon({
  name,
  className = "h-8 w-8",
}: {
  name: StudioStepIconName;
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
