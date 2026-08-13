import { notFound } from "next/navigation";
import { getPerfumeBySlug, getPerfumes } from "@/lib/data/perfumes";

export function generateStaticParams() {
  return getPerfumes().map((p) => ({ slug: p.slug }));
}

export default async function PerfumeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const perfume = getPerfumeBySlug(slug);
  if (!perfume) notFound();

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10">
      <div className="aspect-square w-full border border-taupe/30 bg-beige/40" />

      <div>
        <h1 className="font-serif text-4xl text-ink">{perfume.name}</h1>

        {perfume.scentProfile.length > 0 && (
          <p className="mt-3 text-sm uppercase tracking-wide text-burgundy">
            {perfume.scentProfile.join(" · ")}
          </p>
        )}

        {perfume.description && (
          <p className="mt-4 text-sm text-ink/70">{perfume.description}</p>
        )}

        <div className="mt-8 space-y-2 text-sm text-ink/70">
          {perfume.size && <p>Size: {perfume.size}</p>}
          <p>Type: Perfume Oil</p>
          <p>Alcohol-Free</p>
          <p>Made in France</p>
        </div>

        {perfume.price != null ? (
          <div className="mt-10 border-t border-taupe/20 pt-6">
            <p className="text-lg text-burgundy">
              {perfume.currency} {perfume.price.toFixed(2)}
            </p>
            <button
              type="button"
              className="mt-4 w-full border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark"
            >
              Add to Cart
            </button>
          </div>
        ) : (
          <div className="mt-10 border-t border-taupe/20 pt-6">
            <p className="text-sm text-ink/50">
              Pricing and full product details for this fragrance are pending
              confirmation from the atelier.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 w-full cursor-not-allowed border border-taupe/40 px-8 py-3 text-xs uppercase tracking-[0.2em] text-ink/40"
            >
              Coming Soon
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
