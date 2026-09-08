// One shared, on-brand status-pill vocabulary for every list in the
// admin panel (orders, products, affiliates, promotions...). Before
// this, each list invented its own badge colors ad hoc -- several
// reached for Tailwind's default red/green/blue/amber, which reads as
// bolted-on next to the site's ivory/beige/burgundy/taupe palette.
// Every tier here is built only from that palette (plus "brown", an
// existing-but-until-now-unused token) so a badge never looks like it
// wandered in from a different design system.
export type StatusTier = "neutral" | "progress" | "progressStrong" | "positive" | "negative" | "muted";

const TIER_CLASSES: Record<StatusTier, string> = {
  // Awaiting action / just submitted -- the calmest tier.
  neutral: "bg-beige text-ink/60",
  // Confirmed and moving, early in a pipeline.
  progress: "bg-taupe/25 text-ink/60",
  // Further along the same pipeline -- one hue, more intensity, not a
  // different color, so a multi-step status reads as progress rather
  // than as arbitrarily different states.
  progressStrong: "bg-taupe/45 text-ink/80",
  // Done, active, approved, paid -- the brand accent at low strength.
  positive: "bg-burgundy/10 text-burgundy",
  // Cancelled, rejected, failed -- needs to read as distinctly "not
  // good" without borrowing an off-palette red (that's reserved for
  // destructive actions and error text, not status labels).
  negative: "bg-brown/10 text-brown",
  // Expired, used up, refunded -- over and done, but not a failure.
  muted: "bg-taupe/20 text-ink/50",
};

export function statusBadgeClasses(tier: StatusTier): string {
  return TIER_CLASSES[tier];
}

export function StatusBadge({ tier, children }: { tier: StatusTier; children: React.ReactNode }) {
  return (
    <span className={`rounded-sm px-2 py-0.5 text-xs uppercase tracking-wide ${TIER_CLASSES[tier]}`}>{children}</span>
  );
}
