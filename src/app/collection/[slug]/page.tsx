import { notFound } from "next/navigation";
import { getPerfumeBySlug } from "@/lib/data/perfumes";

// Rendered per request rather than statically generated: perfumes are
// edited live via the admin CMS, so a build-time snapshot would go stale.
export const dynamic = "force-dynamic";

export default async function PerfumeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const perfume = await getPerfumeBySlug(slug);
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

        <div className="mt-8 space-y-2 text-sm text-ink/70">
          <p>Type: Perfume Oil</p>
          <p>Alcohol-Free</p>
          <p>Made in France</p>
        </div>

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
      </div>
    </div>
  );
}
