"use client";

// No analytics provider is wired up yet (deferred to Phase 2, per
// README "What's scaffolded vs. not yet built"). This is a safe stub
// so event call sites (Studio Category Clicked, Quote Requested) can
// exist now and start actually reporting the moment a provider (GA4,
// Meta Pixel, etc.) is dropped in here, without touching call sites.
export function track(event: string, properties?: Record<string, string>): void {
  if (process.env.NODE_ENV !== "production") {
    console.info(`[analytics] ${event}`, properties ?? {});
  }
}
