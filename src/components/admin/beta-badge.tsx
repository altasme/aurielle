// Small "BETA" pill for Aurielle Mail -- visually distinct from the
// solid burgundy "New" unread badge (inquiry-row-actions.tsx) so the
// two don't read as the same kind of indicator. Ghost/outline style:
// a status label, not a count.
export function BetaBadge() {
  return (
    <span className="rounded-sm border border-burgundy/40 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-burgundy">
      Beta
    </span>
  );
}
