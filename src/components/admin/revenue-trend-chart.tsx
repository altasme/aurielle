"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format-money";

type Point = { date: string; label: string; amount: number };

// Inline SVG column chart -- no charting dependency, consistent with
// this project's minimal-dependency pattern (worker-mailer/plain fetch
// over adding libraries that assume a Node runtime Cloudflare Workers
// doesn't have). A native <title> gives every bar a zero-JS tooltip
// fallback; the styled tooltip on hover/focus is the primary one.
export function RevenueTrendChart({ points, currency }: { points: Point[]; currency: string }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (points.length === 0) {
    return <p className="text-sm text-ink/40">No revenue recorded for this period.</p>;
  }

  const max = Math.max(1, ...points.map((p) => p.amount));
  const barWidth = 28;
  const gap = 10;
  const chartHeight = 180;
  const width = points.length * (barWidth + gap) + gap;
  const barHeights = points.map((p) => Math.max(2, (p.amount / max) * (chartHeight - 8)));
  const labelStride = Math.max(1, Math.ceil(points.length / 10));

  return (
    <div className="overflow-x-auto">
      <div className="relative inline-block" style={{ minWidth: width }}>
        <svg width={width} height={chartHeight + 28} role="img" aria-label={`Revenue trend in ${currency}`}>
          <line x1={0} y1={chartHeight} x2={width} y2={chartHeight} stroke="#a9998a" strokeOpacity={0.35} strokeWidth={1} />
          {points.map((p, i) => {
            const x = gap + i * (barWidth + gap);
            const y = chartHeight - barHeights[i];
            const active = hoverIndex === i;
            return (
              <g key={p.date}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeights[i]}
                  rx={4}
                  fill="#6d1b2b"
                  fillOpacity={active ? 1 : 0.72}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex((cur) => (cur === i ? null : cur))}
                  onFocus={() => setHoverIndex(i)}
                  onBlur={() => setHoverIndex((cur) => (cur === i ? null : cur))}
                  tabIndex={0}
                >
                  <title>{`${p.label}: ${formatMoney(currency, p.amount)}`}</title>
                </rect>
                {i % labelStride === 0 && (
                  <text x={x + barWidth / 2} y={chartHeight + 16} textAnchor="middle" fontSize={10} fill="#2a2320" fillOpacity={0.5}>
                    {p.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hoverIndex !== null && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-sm bg-ink px-2 py-1 text-xs text-ivory shadow-md"
            style={{
              left: gap + hoverIndex * (barWidth + gap) + barWidth / 2,
              top: chartHeight - barHeights[hoverIndex] - 8,
            }}
          >
            <div className="font-medium">{formatMoney(currency, points[hoverIndex].amount)}</div>
            <div className="text-ivory/60">{points[hoverIndex].label}</div>
          </div>
        )}
      </div>
    </div>
  );
}
