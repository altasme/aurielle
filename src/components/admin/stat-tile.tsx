// KPI card: label, value, and an optional vs-previous-period delta.
// Direction is carried by both the triangle glyph and the wording, not
// color alone -- this brand's palette has no dedicated green/red
// status pair, so "good" only ever borrows the existing burgundy
// accent and "neutral/bad" the existing muted ink tone.
export function StatTile({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: { percent: number | null; comparedTo: string; positiveIsGood?: boolean } | null;
}) {
  const positiveIsGood = delta?.positiveIsGood ?? true;
  const isGood = delta && delta.percent !== null && (delta.percent >= 0) === positiveIsGood;

  return (
    <div className="border border-taupe/20 bg-white p-5">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      {delta && (
        <p className={`mt-1 text-xs ${delta.percent === null ? "text-ink/40" : isGood ? "text-burgundy" : "text-ink/50"}`}>
          {delta.percent === null
            ? `No ${delta.comparedTo} to compare`
            : `${delta.percent >= 0 ? "▲" : "▼"} ${Math.abs(delta.percent).toFixed(1)}% vs ${delta.comparedTo}`}
        </p>
      )}
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    </div>
  );
}
