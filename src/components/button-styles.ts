// Single source of truth for the site's button look (thin border,
// minimal rounding, no heavy shadows, per spec §29 "Component Style").
// Shared between ButtonLink (navigation) and SubmitButton (form
// submits) so a <button type="submit"> and a <Link> styled as a button
// can never visually drift apart, the way they had before this file
// existed (six files duplicating the same class string, none of them
// actually matching ButtonLink's rounded-sm).
export function buttonClassName(variant: "primary" | "secondary" | "inverse" = "primary"): string {
  const base =
    "inline-flex items-center justify-center border px-8 py-3 text-xs uppercase tracking-[0.2em] transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "border-burgundy bg-burgundy text-ivory hover:bg-burgundy-dark",
    secondary: "border-burgundy text-burgundy hover:bg-burgundy hover:text-ivory",
    // Outline style for dark/photo backgrounds, where burgundy-on-burgundy
    // (the "secondary" variant) loses contrast against the backdrop.
    inverse: "border-ivory text-ivory hover:bg-ivory hover:text-burgundy-dark",
  }[variant];
  return `${base} ${styles}`;
}
