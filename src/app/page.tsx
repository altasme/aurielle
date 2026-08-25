import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import { PerfumeCard } from "@/components/perfume-card";
import { Reveal } from "@/components/reveal";
import { getFeaturedPerfumes } from "@/lib/data/perfumes";
import { CUSTOMISATION_STUDIO_ENABLED } from "@/config/studio";
import { STUDIO_GROUPINGS } from "@/lib/data/studio-groupings";

const STUDIO_SPOTLIGHT = STUDIO_GROUPINGS.find((g) => g.spotlight);

// Homepage rebalance per the v5.2 "lean gateway" spec, which supersedes
// v5.1's reorder: v5.1 grouped the same sections into three runs but
// the page was still ~70% fragrance by real estate. v5.2 fixes the
// *volume*, not the order -- one equal-weight block per pillar (heading
// -> a taste -> one CTA), with destination-grade content (mood filter,
// philosophy, story bottles, founder story, community, factory,
// fragrance-dev process) relocated to /collection, /atelier-supply and
// /about, where it's still fully present, just not on the front door.

const ATELIER_CAPABILITIES = [
  {
    title: "Fragrance Oils",
    body: "Source fragrance oils and profiles for personal, creative or commercial applications.",
  },
  {
    title: "Material Profiles",
    body: "Explore documented fragrance material profiles to guide your next project.",
  },
  {
    title: "OEM & ODM",
    body: "Develop your own fragrance products with support from concept through finished product.",
  },
  {
    title: "Sourcing & Logistics",
    body: "Access supply and international shipping support for commercial fragrance projects.",
  },
];

const WHY_AURIELLE = [
  {
    title: "Refined Fragrance",
    body: "Signature perfume oils, crafted to become part of your signature.",
  },
  {
    title: "Materials & Supply",
    body: "Fragrance oils and sourcing for creators and businesses building their own line.",
  },
  {
    title: "Custom Craftsmanship",
    body: "Made-to-order UV printing -- packaging, labels and branding finished to a luxury standard.",
  },
];

// Falls back to a periodic refresh; admin saves also push an immediate
// update via revalidatePath("/") (see src/app/api/admin/products routes).
export const revalidate = 3600;

export default async function Home() {
  const featured = await getFeaturedPerfumes(4);

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-image object-cover"
        />
        <div className="relative z-10 flex flex-col items-center gap-6 border border-taupe/20 bg-ivory px-8 py-10 sm:px-14 sm:py-14">
          <p className="hero-in font-script text-3xl text-burgundy">
            Aurielle Paris Atelier
          </p>
          <h1 className="hero-in hero-in-delay-1 max-w-3xl font-serif text-4xl leading-tight text-ink sm:text-6xl">
            {CUSTOMISATION_STUDIO_ENABLED
              ? "FRAGRANCE · CRAFT · CUSTOMISATION"
              : "THE ART OF FRAGRANCE"}
          </h1>
          <p className="hero-in hero-in-delay-2 max-w-md text-base text-ink sm:text-lg">
            {CUSTOMISATION_STUDIO_ENABLED
              ? "From signature scents to fragrance supply and made-to-order UV printing, Aurielle Paris brings together refined fragrances, quality materials and custom craftsmanship for individuals, creators and businesses."
              : "From signature scents to fragrance supply and private-label creation, Aurielle Paris brings together refined fragrances, quality fragrance materials, custom packaging and product development support for individuals, creators and businesses."}
          </p>
          <div className="hero-in hero-in-delay-3 mt-4 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/collection">Discover Aurielle</ButtonLink>
            {CUSTOMISATION_STUDIO_ENABLED ? (
              <ButtonLink href="#pillars" variant="secondary">
                Explore Our Crafts
              </ButtonLink>
            ) : (
              <ButtonLink href="/atelier-supply" variant="secondary">
                Explore the Atelier
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      {/* THREE-PILLAR CHOOSER -- equal cards, same copy length, same
          button treatment on all three so the Studio card isn't the
          weak one. */}
      <section
        id="pillars"
        className={`mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-6 py-24 lg:px-10 ${
          CUSTOMISATION_STUDIO_ENABLED ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        <Reveal
          className={`text-center lg:text-center ${
            CUSTOMISATION_STUDIO_ENABLED ? "lg:col-span-3" : "lg:col-span-2"
          }`}
        >
          <p className="font-script text-2xl text-burgundy">
            {CUSTOMISATION_STUDIO_ENABLED ? "One House, Three Crafts" : "A World of Fragrance"}
          </p>
        </Reveal>
        <Reveal className="border border-taupe/30 p-10 text-center">
          <h2 className="font-serif text-2xl text-ink">Collection</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-burgundy">
            The Fragrance Collection
          </p>
          <p className="mx-auto mt-4 max-w-xs text-sm text-ink/70">
            Refined perfume oils crafted to become part of your signature.
          </p>
          <div className="mt-6">
            <ButtonLink href="/collection" variant="secondary">
              Shop the Collection
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal className="border border-taupe/30 p-10 text-center" delayMs={120}>
          <h2 className="font-serif text-2xl text-ink">Atelier Supply</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-burgundy">
            Fragrance Supply &amp; Creation
          </p>
          <p className="mx-auto mt-4 max-w-xs text-sm text-ink/70">
            Fragrance oils and sourcing for creators and businesses
            building their own line.
          </p>
          <div className="mt-6">
            <ButtonLink href="/atelier-supply" variant="secondary">
              Explore Supply
            </ButtonLink>
          </div>
        </Reveal>
        {CUSTOMISATION_STUDIO_ENABLED && (
          <Reveal className="border border-taupe/30 p-10 text-center" delayMs={240}>
            <h2 className="font-serif text-2xl text-ink">Studio</h2>
            <p className="mt-1 text-xs uppercase tracking-wide text-burgundy">
              Customisation Studio
            </p>
            <p className="mx-auto mt-4 max-w-xs text-sm text-ink/70">
              Made-to-order UV printing -- packaging, labels and branding
              finished to a luxury standard.
            </p>
            <div className="mt-6">
              <ButtonLink href="/studio" variant="secondary">
                Explore the Studio
              </ButtonLink>
            </div>
          </Reveal>
        )}
      </section>

      {/* PILLAR BLOCK: THE COLLECTION -- a taste, not the whole store.
          Story bottles, mood filter and philosophy live on /collection. */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">The Collection</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              Refined perfume oils crafted to become part of your signature.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {featured.map((perfume, i) => (
              <Reveal key={perfume.slug} delayMs={(i % 4) * 100}>
                <PerfumeCard perfume={perfume} />
              </Reveal>
            ))}
          </div>

          <div className="mt-10 text-center">
            <ButtonLink href="/collection">Shop the Collection</ButtonLink>
          </div>
        </div>
      </section>

      {/* PILLAR BLOCK: ATELIER SUPPLY -- a taste, not the full process.
          Factory photos and the concept-to-product journey live on
          /atelier-supply. Boundary rule: Supply owns the scent and
          sourcing, not physical printing -- no packaging-printing
          language here. */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <h2 className="font-serif text-3xl text-ink">Atelier Supply</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              Fragrance oils and sourcing for creators and businesses
              building their own line.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ATELIER_CAPABILITIES.map((item, i) => (
              <Reveal
                key={item.title}
                delayMs={i * 100}
                className="border border-taupe/30 bg-ivory p-8 text-left"
              >
                <h3 className="font-serif text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{item.body}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-10">
            <ButtonLink href="/atelier-supply">Explore Supply</ButtonLink>
          </div>
        </div>
      </section>

      {/* PILLAR BLOCK: CUSTOMISATION STUDIO -- a taste: luxury chips +
          the real print photo, one CTA. Fridge magnets etc. stay
          inside /studio, never the homepage (luxury face only). */}
      {CUSTOMISATION_STUDIO_ENABLED && STUDIO_SPOTLIGHT && (
        <section className="bg-beige px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-6xl text-center">
            <Reveal>
              <h2 className="font-serif text-3xl text-ink">Customisation Studio</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
                Made-to-order UV printing -- packaging, labels and branding
                finished to a luxury standard.
              </p>
            </Reveal>

            <Reveal delayMs={80} className="mt-8 flex flex-wrap justify-center gap-3">
              {STUDIO_SPOTLIGHT.items.map((item) => (
                <span
                  key={item}
                  className="border border-taupe/30 bg-ivory px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-ink/70"
                >
                  {item}
                </span>
              ))}
            </Reveal>

            <Reveal
              delayMs={160}
              className="relative mx-auto mt-10 aspect-[21/9] max-w-4xl overflow-hidden border border-taupe/30"
            >
              <Image
                src="/images/atelier/custom-label.jpg"
                alt="Close-up of custom perfume bottles, candles and metal labels bearing different private-label brand names"
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
            </Reveal>

            <div className="mt-10">
              <ButtonLink href="/studio">Explore the Studio</ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* WHY AURIELLE -- one standard, three crafts (not a perfume
          pitch dressed up as four generic columns). */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">Why Aurielle</h2>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {WHY_AURIELLE.map((item, i) => (
              <Reveal key={item.title} delayMs={i * 100} className="text-center">
                <h3 className="font-serif text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{item.body}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delayMs={300} className="mt-10 text-center">
            <p className="font-script text-xl text-burgundy">
              One atelier standard across everything we make.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
        <Image
          src="/images/perfumes/main/satin-mystique.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <Reveal className="relative z-10 mx-auto max-w-2xl border border-taupe/20 bg-ivory px-8 py-10 sm:px-14 sm:py-14">
          <p className="font-script text-2xl text-burgundy">
            From the scent you wear to the brand you build.
          </p>
          <h2 className="mt-2 font-serif text-3xl text-ink">
            Create Something of Your Own
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-ink/70">
            Whether you&rsquo;re looking for your next personal fragrance or
            developing something for your own brand, Aurielle Paris Atelier
            brings together refined fragrance, quality materials, and the
            freedom to create something uniquely yours.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <ButtonLink href="/collection">Explore the Collection</ButtonLink>
            <ButtonLink href="/business" variant="secondary">
              Talk to the Atelier
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
