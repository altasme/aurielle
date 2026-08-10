import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { getFeaturedPerfumes } from "@/lib/data/perfumes";

export const dynamic = "force-dynamic";

export default async function Home() {
  const featured = await getFeaturedPerfumes(4);

  return (
    <div className="flex flex-col">
      {/* HERO — spec §4 */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center gap-6 bg-gradient-to-b from-beige to-ivory px-6 py-24 text-center">
        <p className="font-script text-3xl text-burgundy">Aurielle Paris Atelier</p>
        <h1 className="max-w-3xl font-serif text-4xl leading-tight text-ink sm:text-6xl">
          THE ART OF FRAGRANCE
        </h1>
        <p className="max-w-xl text-base text-ink/70 sm:text-lg">
          Discover Aurielle Paris Atelier — a fragrance house creating refined
          perfumes and supplying quality fragrance materials to creators and
          businesses worldwide.
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <ButtonLink href="/collection">Explore the Collection</ButtonLink>
          <ButtonLink href="/atelier-supply" variant="secondary">
            Explore Atelier Supply
          </ButtonLink>
        </div>
      </section>

      {/* INTRODUCTION — spec §5 */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-2 lg:px-10">
        <div className="text-center lg:col-span-2 lg:text-center">
          <p className="font-script text-2xl text-burgundy">A World of Fragrance</p>
        </div>
        <div className="border border-taupe/30 p-10 text-center">
          <h2 className="font-serif text-2xl text-ink">Aurielle</h2>
          <p className="mt-4 text-sm text-ink/70">
            Discover our signature collection of refined perfume oils created
            for everyday elegance and unforgettable moments.
          </p>
          <div className="mt-6">
            <ButtonLink href="/collection" variant="secondary">
              Discover Aurielle
            </ButtonLink>
          </div>
        </div>
        <div className="border border-taupe/30 p-10 text-center">
          <h2 className="font-serif text-2xl text-ink">Atelier</h2>
          <p className="mt-4 text-sm text-ink/70">
            Explore our extensive fragrance supply catalogue for perfumers,
            businesses and fragrance creators.
          </p>
          <div className="mt-6">
            <ButtonLink href="/atelier-supply" variant="secondary">
              Explore Supply
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* AURIELLE COLLECTION PREVIEW — spec §6 */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-serif text-3xl text-ink">
              The Aurielle Collection
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Fragrance oils crafted to become part of your signature.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {featured.map((perfume) => (
              <Link
                key={perfume.slug}
                href={`/collection/${perfume.slug}`}
                className="group flex flex-col"
              >
                <div className="aspect-[3/4] w-full border border-taupe/30 bg-ivory transition-colors group-hover:border-burgundy" />
                <p className="mt-4 text-center font-serif text-lg text-ink">
                  {perfume.name}
                </p>
                <p className="text-center text-xs uppercase tracking-wide text-burgundy">
                  View Fragrance
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <ButtonLink href="/collection">View All Perfumes</ButtonLink>
          </div>
        </div>
      </section>

      {/* BUSINESS CTA */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10">
        <h2 className="font-serif text-3xl text-ink">For Your Business</h2>
        <p className="mt-4 text-sm text-ink/70">
          Looking for fragrance materials for your own creations, products or
          business?
        </p>
        <div className="mt-6">
          <ButtonLink href="/business">Talk to the Atelier</ButtonLink>
        </div>
      </section>
    </div>
  );
}
