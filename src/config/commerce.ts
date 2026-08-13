// Governs order + catalogue behaviour across the app. Phase 2 activation
// (Stripe checkout, live-DB catalogue) means flipping these two constants
// and wiring the corresponding modules — no Phase 1 rebuild.
// See docs/spec/AURIELLE_SPEC_v4.md "THE SEAM BETWEEN PHASES".

export const COMMERCE_MODE: "manual" | "stripe" = "manual";

export const CATALOGUE_SOURCE: "static" | "supabase" = "static";
