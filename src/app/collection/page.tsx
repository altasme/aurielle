import type { Metadata } from "next";
import { getPerfumes } from "@/lib/data/perfumes";
import { PerfumeCard } from "@/components/perfume-card";

export const metadata: Metadata = {
  title: "The Aurielle Collection | Aurielle Paris Atelier",
  description:
    "Browse the Aurielle Collection of refined perfume oils crafted for everyday elegance.",
};

export default function CollectionPage() {
  const perfumes = getPerfumes();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-ink">The Aurielle Collection</h1>
        <p className="mt-3 text-sm text-ink/60">
          Fragrance oils crafted to become part of your signature.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-2 gap-6 lg:grid-cols-4">
        {perfumes.map((perfume) => (
          <PerfumeCard key={perfume.slug} perfume={perfume} />
        ))}
      </div>
    </div>
  );
}
