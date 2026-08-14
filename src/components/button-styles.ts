// Single source of truth for the site's button look (thin border,
// minimal rounding, no heavy shadows, per spec §29 "Component Style").
// Shared between ButtonLink (navigation) and SubmitButton (form
// submits) so a <button type="submit"> and a <Link> styled as a button
// can never visually drift apart, the way they had before this file
// existed (six files duplicating the same class string, none of them
// actually matching ButtonLink's rounded-sm).
export function buttonClassName(variant: "primary" | "secondary" = "primary"): string {
  const base =
    "inline-flex items-center justify-center border px-8 py-3 text-xs uppercase tracking-[0.2em] transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "border-burgundy bg-burgundy text-ivory hover:bg-burgundy-dark"
      : "border-burgundy text-burgundy hover:bg-burgundy hover:text-ivory";
  return `${base} ${styles}`;
}
