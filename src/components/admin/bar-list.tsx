// Horizontal magnitude bars -- order status, payment status, geography,
// top products by units. Identity comes from the text label (never
// color alone); every bar shares the same single burgundy hue, so
// there's nothing here that needs CVD validation.
export function BarList({
  items,
  formatValue,
  emptyLabel = "No data for this period.",
}: {
  items: { label: string; value: number; sublabel?: string }[];
  formatValue: (value: number) => string;
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));

  if (items.length === 0) {
    return <p className="text-sm text-ink/40">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-ink/80">{item.label}</span>
            <span className="shrink-0 tabular-nums text-ink/60">{formatValue(item.value)}</span>
          </div>
          {item.sublabel && <p className="text-xs text-ink/40">{item.sublabel}</p>}
          <div className="mt-1 h-2 w-full rounded-full bg-beige">
            <div className="h-2 rounded-full bg-burgundy" style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
