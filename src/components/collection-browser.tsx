"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { MOODS, type Perfume } from "@/lib/data/perfumes";
import { PerfumeCard } from "./perfume-card";
import { Reveal } from "./reveal";

function chipClassName(active: boolean): string {
  const base = "border px-4 py-1.5 text-xs uppercase tracking-wide transition-colors";
  return active
    ? `${base} border-burgundy bg-burgundy text-ivory`
    : `${base} border-taupe/30 text-ink/60 hover:border-burgundy hover:text-burgundy`;
}

export function CollectionBrowser({ perfumes }: { perfumes: Perfume[] }) {
  const searchParams = useSearchParams();
  const initialMood = searchParams.get("mood");
  const [mood, setMood] = useState<string | null>(
    initialMood && (MOODS as readonly string[]).includes(initialMood) ? initialMood : null,
  );

  const filtered = useMemo(
    () => (mood ? perfumes.filter((p) => p.mood === mood) : perfumes),
    [perfumes, mood],
  );

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setMood(null)} className={chipClassName(mood === null)}>
          All
        </button>
        {MOODS.map((m) => (
          <button key={m} type="button" onClick={() => setMood(m)} className={chipClassName(mood === m)}>
            {m}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {filtered.map((perfume, i) => (
          <Reveal key={perfume.slug} delayMs={(i % 4) * 100}>
            <PerfumeCard perfume={perfume} />
          </Reveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-ink/50">
          No fragrances match that mood yet.
        </p>
      )}
    </div>
  );
}
