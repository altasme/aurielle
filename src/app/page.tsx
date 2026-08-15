import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import { PerfumeCard } from "@/components/perfume-card";
import { Reveal } from "@/components/reveal";
import { getFeaturedPerfumes } from "@/lib/data/perfumes";

export default function Home() {
  const featured = getFeaturedPerfumes(4);

  return (
    <div className="flex flex-col">
      {/* HERO, spec §4 */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-image object-cover"
        />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <p className="hero-in font-script text-3xl text-burgundy">
            Aurielle Paris Atelier
          </p>
          <h1 className="hero-in hero-in-delay-1 max-w-3xl font-serif text-4xl leading-tight text-ink sm:text-6xl">
            THE ART OF FRAGRANCE
          </h1>
          <p className="hero-in hero-in-delay-2 max-w-xl text-base text-ink/70 sm:text-lg">
            Refined perfume oils crafted in France, made to become the
            signature only you wear. Discover the collection, or source
            quality fragrance materials for your own creations.
          </p>
          <div className="hero-in hero-in-delay-3 mt-4 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/collection">Shop the Collection</ButtonLink>
            <ButtonLink href="/atelier-supply" variant="secondary">
              Explore Atelier Supply
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <Reveal className="border-b border-taupe/20 bg-beige/40 px-6 py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 divide-x divide-taupe/30 text-center text-xs uppercase tracking-wide text-ink/60">
          <span className="px-4 first:pl-0">Alcohol-Free Perfume Oils</span>
          <span className="px-4">Made in France</span>
          <span className="px-4">Boutique Fragrance House</span>
          <span className="px-4 last:pr-0">Made to Last</span>
        </div>
      </Reveal>

      {/* INTRODUCTION, spec §5 */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-2 lg:px-10">
        <Reveal className="text-center lg:col-span-2 lg:text-center">
          <p className="font-script text-2xl text-burgundy">A World of Fragrance</p>
        </Reveal>
        <Reveal className="border border-taupe/30 p-10 text-center">
          <h2 className="font-serif text-2xl text-ink">Aurielle</h2>
          <p className="mt-4 text-sm text-ink/70">
            Fourteen perfume oils, each designed to become the scent no one
            can quite place. Refined, alcohol-free and made to last.
          </p>
          <div className="mt-6">
            <ButtonLink href="/collection" variant="secondary">
              Shop Aurielle
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal className="border border-taupe/30 p-10 text-center" delayMs={120}>
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
        </Reveal>
      </section>

      {/* AURIELLE COLLECTION PREVIEW, spec §6 */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">
              The Aurielle Collection
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Fragrance oils crafted to become part of your signature. Each
              bottle holds ten milliliters of refined, alcohol-free scent.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {featured.map((perfume, i) => (
              <Reveal key={perfume.slug} delayMs={(i % 4) * 100}>
                <PerfumeCard perfume={perfume} />
              </Reveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <ButtonLink href="/collection">Shop All Perfumes</ButtonLink>
          </div>
        </div>
      </section>

      {/* BUSINESS CTA */}
      <Reveal className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10">
        <h2 className="font-serif text-3xl text-ink">For Your Business</h2>
        <p className="mt-4 text-sm text-ink/70">
          Looking for fragrance materials for your own creations, products or
          business?
        </p>
        <div className="mt-6">
          <ButtonLink href="/business">Talk to the Atelier</ButtonLink>
        </div>
      </Reveal>
    </div>
  );
}
