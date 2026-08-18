import { notFound } from "next/navigation";
import Image from "next/image";
import { getPerfumeBySlug, getPerfumes } from "@/lib/data/perfumes";
import { AddToCollectionCartButton } from "@/components/add-to-collection-cart-button";
import { Reveal } from "@/components/reveal";
import { formatMoney } from "@/lib/format-money";

// Falls back to a periodic refresh; admin saves also push an immediate
// update via revalidatePath() (see src/app/api/admin/products routes).
export const revalidate = 3600;

export async function generateStaticParams() {
  const perfumes = await getPerfumes();
  return perfumes.map((p) => ({ slug: p.slug }));
}

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
      <Reveal className="relative aspect-square w-full overflow-hidden border border-taupe/30 bg-beige/40">
        <Image
          src={perfume.primaryImageUrl ?? `/images/perfumes/main/${perfume.slug}.jpg`}
          alt={perfume.name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
          className="object-cover"
        />
      </Reveal>

      <Reveal delayMs={120}>
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
          <p>Type: {perfume.perfumeType ?? "Perfume Oil"}</p>
          <p>Alcohol-Free</p>
          <p>Made in France</p>
        </div>

        {perfume.price != null ? (
          <div className="mt-10 border-t border-taupe/20 pt-6">
            <p className="text-lg text-burgundy">
              {formatMoney(perfume.currency!, perfume.price)}
            </p>
            <AddToCollectionCartButton
              perfume={{ ...perfume, price: perfume.price, currency: perfume.currency! }}
            />
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
      </Reveal>
    </div>
  );
}
