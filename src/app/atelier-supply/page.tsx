import Link from "next/link";
import type { Metadata } from "next";
import { getSupplyMaterials, searchSupplyMaterials } from "@/lib/data/supply-materials";

export const metadata: Metadata = {
  title: "Atelier Supply | Aurielle Paris Atelier",
  description:
    "Browse the Atelier Supply catalogue — fragrance materials for creators, perfumers and businesses, priced in USD/KG.",
};

export const dynamic = "force-dynamic";

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

export default async function AtelierSupplyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const materials = q ? await searchSupplyMaterials(q) : await getSupplyMaterials();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-ink">Atelier Supply</h1>
        <p className="mt-3 text-sm text-ink/60">
          Explore our extensive fragrance catalogue and discover materials
          available for your next creation.
        </p>
      </div>

      <form className="mx-auto mt-10 max-w-xl" action="/atelier-supply" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search fragrance materials..."
          className="w-full border border-taupe/40 bg-ivory px-5 py-3 text-sm outline-none focus:border-burgundy"
        />
      </form>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((category) => (
          <span
            key={category}
            className="border border-taupe/30 px-4 py-1.5 text-xs uppercase tracking-wide text-ink/50"
            title="Category filtering is not yet enabled — pending client classification."
          >
            {category}
          </span>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink/40">
        {materials.length} material{materials.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 divide-y divide-taupe/15 border-y border-taupe/15">
        {materials.map((material) => (
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
