"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SupplyMaterial } from "@/lib/data/supply-materials";
import { matchesSupplyQuery } from "@/lib/data/supply-materials";
import { FIELD_CLASSES } from "./form-field";

const CATEGORIES = [
  "All",
  "Floral",
  "Fruity",
  "Woody",
  "Fresh",
  "Musky",
  "Amber",
  "Sweet",
  "Citrus",
  "Oriental",
  "Other",
];

type SortOption = "serial" | "name" | "price-asc" | "price-desc";

export function SupplyCatalogueBrowser({
  materials,
}: {
  materials: SupplyMaterial[];
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("serial");

  const results = useMemo(() => {
    const filtered = materials.filter((m) => matchesSupplyQuery(m, query));
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
  }, [materials, query, sort]);

  return (
    <div>
      <div className="mx-auto flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fragrance materials..."
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
        {CATEGORIES.map((category) => (
          <span
            key={category}
            className="border border-taupe/30 px-4 py-1.5 text-xs uppercase tracking-wide text-ink/50"
            title="Category filtering is not yet enabled: pending client classification."
          >
            {category}
          </span>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink/40">
        {results.length} material{results.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 divide-y divide-taupe/15 border-y border-taupe/15">
        {results.map((material) => (
          <Link
            key={material.slug}
            href={`/atelier-supply/${material.slug}`}
            className="flex items-center justify-between gap-4 px-2 py-5 transition-colors hover:bg-beige/30"
          >
            <span className="font-serif text-lg text-ink">
              {material.displayName}
            </span>
            <span className="whitespace-nowrap text-sm text-burgundy">
              USD {material.price.toFixed(2)} / {material.pricingUnit}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
