// Spec v5 addendum: the Customisation Studio (UV printing) pillar --
// a quote-based showcase, not a priced catalogue. This flag gates the
// whole pillar (page, nav entry, homepage band/spotlight); the other
// pillars are untouched whether it's on or off. STUDIO_MODE exists so
// a future priced/commerce mode is a deliberate, separate decision,
// not something the current build silently drifts into.
export const CUSTOMISATION_STUDIO_ENABLED = true;
export const STUDIO_MODE = "quote" as const;
