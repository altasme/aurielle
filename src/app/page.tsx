import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import { PerfumeCard } from "@/components/perfume-card";
import { Reveal } from "@/components/reveal";
import { getFeaturedPerfumes } from "@/lib/data/perfumes";
import { CUSTOMISATION_STUDIO_ENABLED } from "@/config/studio";
import { STUDIO_GROUPINGS } from "@/lib/data/studio-groupings";
import { getSiteContent } from "@/lib/site-content";

const STUDIO_SPOTLIGHT = STUDIO_GROUPINGS.find((g) => g.spotlight);

// Homepage rebalance per the v5.2 "lean gateway" spec, which supersedes
// v5.1's reorder: v5.1 grouped the same sections into three runs but
// the page was still ~70% fragrance by real estate. v5.2 fixes the
// *volume*, not the order -- one equal-weight block per pillar (heading
// -> a taste -> one CTA), with destination-grade content (mood filter,
// philosophy, story bottles, founder story, community, factory,
// fragrance-dev process) relocated to /collection, /atelier-supply and
// /about, where it's still fully present, just not on the front door
// (spec v5.4 completes those three receiving pages).

// Falls back to a periodic refresh; admin saves also push an immediate
// update via revalidatePath("/") (see src/app/api/admin/products routes
// and src/lib/admin/site-content.ts).
export const revalidate = 3600;

export default async function Home() {
  // The Atelier Supply capability cards below are edited from the
  // Atelier Supply page in Website Management (they're shared with
  // that page, so there's one place to keep them in sync rather than
  // two copies drifting apart) -- see EXTRA_REVALIDATE_PATHS in
  // src/lib/admin/site-content.ts.
  const [featured, { text, images }, atelier] = await Promise.all([
    getFeaturedPerfumes(4),
    getSiteContent("home"),
    getSiteContent("atelier-supply"),
  ]);

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative flex min-h-[85vh] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
        <Image
          src={images.hero_image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-image object-cover"
        />
        <div className="relative z-10 flex flex-col items-center gap-6 border border-taupe/20 bg-ivory px-8 py-10 sm:px-14 sm:py-14">
          <p className="hero-in font-script text-3xl text-burgundy">{text.hero_eyebrow}</p>
          <h1 className="hero-in hero-in-delay-1 max-w-3xl font-serif text-4xl leading-tight text-ink sm:text-6xl">
            {text.hero_headline}
          </h1>
          <p className="hero-in hero-in-delay-2 max-w-md text-base font-normal text-ink/70 sm:text-lg">
            {text.hero_body}
          </p>
          <div className="hero-in hero-in-delay-3 mt-4 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/collection">{text.hero_cta_primary}</ButtonLink>
            <ButtonLink href="/atelier-supply" variant="secondary">
              {text.hero_cta_secondary}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* PILLAR BLOCK: CUSTOMISATION STUDIO -- a taste: luxury chips +
          the real print photo, one CTA. Fridge magnets etc. stay
          inside /studio, never the homepage (luxury face only). Placed
          right after the hero per client direction -- Studio services
          get top billing, not buried after Collection/Atelier Supply. */}
      {CUSTOMISATION_STUDIO_ENABLED && STUDIO_SPOTLIGHT && (
        <section className="bg-beige px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-6xl text-center">
            <Reveal>
              <h2 className="font-serif text-3xl text-ink">{text.studio_teaser_heading}</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{text.studio_teaser_body}</p>
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
                src={images.studio_teaser_image}
                alt="Close-up of custom perfume bottles, candles and metal labels bearing different private-label brand names"
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
              />
            </Reveal>

            <div className="mt-10">
              <ButtonLink href="/studio">{text.studio_teaser_cta}</ButtonLink>
            </div>
          </div>
        </section>
      )}

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
          <h2 className="font-serif text-2xl text-ink">{text.pillar_collection_heading}</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-burgundy">{text.pillar_collection_eyebrow}</p>
          <p className="mx-auto mt-4 max-w-xs text-sm text-ink/70">{text.pillar_collection_body}</p>
          <div className="mt-6">
            <ButtonLink href="/collection" variant="secondary">
              {text.pillar_collection_cta}
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal className="border border-taupe/30 p-10 text-center" delayMs={120}>
          <h2 className="font-serif text-2xl text-ink">{text.pillar_atelier_heading}</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-burgundy">{text.pillar_atelier_eyebrow}</p>
          <p className="mx-auto mt-4 max-w-xs text-sm text-ink/70">{text.pillar_atelier_body}</p>
          <div className="mt-6">
            <ButtonLink href="/atelier-supply" variant="secondary">
              {text.pillar_atelier_cta}
            </ButtonLink>
          </div>
        </Reveal>
        {CUSTOMISATION_STUDIO_ENABLED && (
          <Reveal className="border border-taupe/30 p-10 text-center" delayMs={240}>
            <h2 className="font-serif text-2xl text-ink">{text.pillar_studio_heading}</h2>
            <p className="mt-1 text-xs uppercase tracking-wide text-burgundy">{text.pillar_studio_eyebrow}</p>
            <p className="mx-auto mt-4 max-w-xs text-sm text-ink/70">{text.pillar_studio_body}</p>
            <div className="mt-6">
              <ButtonLink href="/studio" variant="secondary">
                {text.pillar_studio_cta}
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
            <h2 className="font-serif text-3xl text-ink">{text.collection_heading}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{text.collection_body}</p>
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
            <h2 className="font-serif text-3xl text-ink">{text.atelier_heading}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{text.atelier_body}</p>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Reveal
                key={i}
                delayMs={(i - 1) * 100}
                className="border border-taupe/30 bg-ivory p-8 text-left"
              >
                <h3 className="font-serif text-lg text-ink">{atelier.text[`capability_${i}_title`]}</h3>
                <p className="mt-2 text-sm text-ink/70">{atelier.text[`capability_${i}_body`]}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-10">
            <ButtonLink href="/atelier-supply">Explore Supply</ButtonLink>
          </div>
        </div>
      </section>

      {/* WHY AURIELLE -- one standard, three crafts (not a perfume
          pitch dressed up as four generic columns). */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">{text.why_heading}</h2>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Reveal key={i} delayMs={(i - 1) * 100} className="text-center">
                <h3 className="font-serif text-lg text-ink">{text[`why_${i}_title`]}</h3>
                <p className="mt-2 text-sm text-ink/60">{text[`why_${i}_body`]}</p>
              </Reveal>
            ))}
          </div>
          <Reveal delayMs={300} className="mt-10 text-center">
            <p className="font-script text-xl text-burgundy">{text.why_closing_line}</p>
          </Reveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
        <Image src={images.final_cta_image} alt="" fill sizes="100vw" className="object-cover" />
        <Reveal className="relative z-10 mx-auto max-w-2xl border border-taupe/20 bg-ivory px-8 py-10 sm:px-14 sm:py-14">
          <p className="font-script text-2xl text-burgundy">{text.final_cta_eyebrow}</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">{text.final_cta_heading}</h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-ink/70">{text.final_cta_body}</p>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <ButtonLink href="/collection">{text.final_cta_primary}</ButtonLink>
            <ButtonLink href="/business" variant="secondary">
              {text.final_cta_secondary}
            </ButtonLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
