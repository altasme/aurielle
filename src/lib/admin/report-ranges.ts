// Date-range presets for Reports & Analytics. Every preset also carries
// a "previous period" of equal length immediately before it, so KPI
// tiles can show a vs-last-period delta -- a single snapshot number
// ("PHP 42,000 this month") is much less commercially useful than one
// with direction ("up 18% vs last month"). "All Time" has no previous
// period to compare against.

export type ReportRangePreset = "7d" | "30d" | "90d" | "mtd" | "ytd" | "all";

export const REPORT_RANGE_PRESETS: { value: ReportRangePreset; label: string }[] = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "mtd", label: "Month to Date" },
  { value: "ytd", label: "Year to Date" },
  { value: "all", label: "All Time" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export type ReportRangeBounds = {
  preset: ReportRangePreset;
  label: string;
  // Inclusive lower bound; null means unbounded ("All Time").
  from: Date | null;
  // Exclusive upper bound -- always "now".
  to: Date;
  // Equal-length window immediately preceding `from`, for a delta
  // comparison. Both null when the preset has no meaningful previous
  // period (All Time).
  previousFrom: Date | null;
  previousTo: Date | null;
};

export function resolveReportRange(presetParam: string | undefined): ReportRangeBounds {
  const now = new Date();
  const preset: ReportRangePreset = REPORT_RANGE_PRESETS.some((p) => p.value === presetParam)
    ? (presetParam as ReportRangePreset)
    : "30d";
  const label = REPORT_RANGE_PRESETS.find((p) => p.value === preset)!.label;

  if (preset === "all") {
    return { preset, label, from: null, to: now, previousFrom: null, previousTo: null };
  }

  if (preset === "mtd" || preset === "ytd") {
    const from = preset === "mtd" ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(now.getFullYear(), 0, 1);
    const daysSoFar = Math.max(1, Math.ceil((now.getTime() - from.getTime()) / DAY_MS));
    const previousTo = from;
    const previousFrom = new Date(previousTo.getTime() - daysSoFar * DAY_MS);
    return { preset, label, from, to: now, previousFrom, previousTo };
  }

  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const from = new Date(now.getTime() - days * DAY_MS);
  const previousTo = from;
  const previousFrom = new Date(from.getTime() - days * DAY_MS);
  return { preset, label, from, to: now, previousFrom, previousTo };
}

// Percent change vs the previous period, or null when there's nothing
// to compare against (no previous period, or a zero baseline).
export function percentDelta(current: number, previous: number | null): number | null {
  if (previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
