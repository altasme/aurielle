"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import type { SupplyMaterialCard } from "@/lib/data/supply-materials";
import { matchesSupplyQuery } from "@/lib/data/supply-search";
import { FIELD_CLASSES } from "./form-field";

type SortOption = "serial" | "name" | "price-asc" | "price-desc";

// Search/sort/filter still run instantly across the whole catalogue
// (matching everything, not just the current page) -- only the
// *rendered* grid is paginated, so a match on "page 4" is never
// invisible to someone who hasn't clicked there yet. With up to a few
// hundred materials, capping the grid at 50 rendered cards at a time
// (instead of all of them) is what actually cuts render/layout cost;
// the data itself was already trimmed to a lean per-card shape
// (src/lib/data/supply-materials.ts).
const PAGE_SIZE = 50;

function chipClassName(active: boolean): string {
  const base = "border px-4 py-1.5 text-xs uppercase tracking-wide transition-colors";
  return active
    ? `${base} border-burgundy bg-burgundy text-ivory`
    : `${base} border-taupe/30 text-ink/60 hover:border-burgundy hover:text-burgundy`;
}

export function SupplyCatalogueBrowser({
  materials,
}: {
  materials: SupplyMaterialCard[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("serial");
  const [type, setType] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);

  const types = useMemo(() => {
    const names = new Set(materials.map((m) => m.productTypeName ?? "Other"));
    return [...names].sort();
  }, [materials]);

  const results = useMemo(() => {
    const filtered = materials
      .filter((m) => matchesSupplyQuery(m, query))
      .filter((m) => !type || (m.productTypeName ?? "Other") === type);
    const sorted = [...filtered];
    switch (sort) {
      case "name":
        sorted.sort((a, b) => a.displayName.localeCompare(b.displayName));
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      default:
        sorted.sort((a, b) => a.serialNumber - b.serialNumber);
    }
    return sorted;
  }, [materials, query, sort, type]);

  // A changed search/sort/filter can easily leave `page` pointing past
  // the end of the new result set -- reset to page 1 whenever any of
  // them change, rather than showing an empty grid. Adjusted during
  // render (React's recommended pattern for this), not in a useEffect:
  // an effect here would setState synchronously on every filter change,
  // triggering an extra, unnecessary render pass.
  const [prevFilters, setPrevFilters] = useState({ query, sort, type });
  if (prevFilters.query !== query || prevFilters.sort !== sort || prevFilters.type !== type) {
    setPrevFilters({ query, sort, type });
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pageItems = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goToPage(next: number) {
    setPage(next);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div>
      <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Atelier Supply..."
          className={FIELD_CLASSES}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className={`sm:w-56 ${FIELD_CLASSES}`}
        >
          <option value="serial">Sort: Default</option>
          <option value="name">Sort: Name A–Z</option>
          <option value="price-asc">Sort: Price, Low to High</option>
          <option value="price-desc">Sort: Price, High to Low</option>
        </select>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={() => setType(null)} className={chipClassName(type === null)}>
          All
        </button>
        {types.map((t) => (
          <button key={t} type="button" onClick={() => setType(t)} className={chipClassName(type === t)}>
            {t}
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink/40">
        {results.length} material{results.length === 1 ? "" : "s"}
        {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
      </p>

      {results.length > 0 ? (
        <div ref={gridRef} className="mt-6 grid grid-cols-2 gap-6 scroll-mt-24 sm:grid-cols-3 lg:grid-cols-4">
          {pageItems.map((material) => (
            <Link key={material.slug} href={`/atelier-supply/${material.slug}`} className="group flex flex-col">
              <div className="relative aspect-square w-full overflow-hidden border border-taupe/30 bg-beige/40 transition-colors group-hover:border-burgundy">
                {material.primaryImageUrl ? (
                  <Image
                    src={material.primaryImageUrl}
                    alt={material.displayName}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">
                    No image
                  </div>
                )}
              </div>
              {material.productTypeName && (
                <p className="mt-3 text-center text-xs uppercase tracking-wide text-burgundy/70">
                  {material.productTypeName}
                </p>
              )}
              <p className="mt-1 text-center font-serif text-base text-ink">{material.displayName}</p>
              <p className="mt-1 text-center text-sm text-ink/70">
                USD {material.price.toFixed(2)} / {material.pricingUnit}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-10 text-center text-sm text-ink/50">No materials match your search.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-6 text-xs uppercase tracking-wide">
          {page > 1 ? (
            <button type="button" onClick={() => goToPage(page - 1)} className="text-burgundy underline">
              &larr; Previous
            </button>
          ) : (
            <span className="text-ink/30">&larr; Previous</span>
          )}
          <span className="text-ink/50">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <button type="button" onClick={() => goToPage(page + 1)} className="text-burgundy underline">
              Next &rarr;
            </button>
          ) : (
            <span className="text-ink/30">Next &rarr;</span>
          )}
        </div>
      )}
    </div>
  );
}
