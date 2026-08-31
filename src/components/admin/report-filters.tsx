import Link from "next/link";
import { REPORT_RANGE_PRESETS, type ReportRangePreset } from "@/lib/admin/report-ranges";

export function BusinessLineTabs({
  collectionHref,
  atelierHref,
  active,
}: {
  collectionHref: string;
  atelierHref: string;
  active: "collection" | "atelier_supply";
}) {
  return (
    <div className="flex gap-2 border-b border-taupe/20">
      <Link
        href={collectionHref}
        className={`border-b-2 px-3 py-2 text-xs uppercase tracking-wide transition-colors ${
          active === "collection" ? "border-burgundy text-burgundy" : "border-transparent text-ink/50 hover:text-ink"
        }`}
      >
        Aurielle Collection
      </Link>
      <Link
        href={atelierHref}
        className={`border-b-2 px-3 py-2 text-xs uppercase tracking-wide transition-colors ${
          active === "atelier_supply" ? "border-burgundy text-burgundy" : "border-transparent text-ink/50 hover:text-ink"
        }`}
      >
        Atelier Supply
      </Link>
    </div>
  );
}

export function ReportRangeTabs({
  active,
  buildHref,
}: {
  active: ReportRangePreset;
  buildHref: (preset: ReportRangePreset) => string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {REPORT_RANGE_PRESETS.map((preset) => (
        <Link
          key={preset.value}
          href={buildHref(preset.value)}
          className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
            active === preset.value
              ? "border-burgundy bg-burgundy text-ivory"
              : "border-taupe/30 text-ink/60 hover:border-burgundy hover:text-burgundy"
          }`}
        >
          {preset.label}
        </Link>
      ))}
    </div>
  );
}
