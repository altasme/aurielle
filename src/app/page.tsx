import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { PerfumeCard } from "@/components/perfume-card";
import { Reveal } from "@/components/reveal";
import { getFeaturedPerfumes, MOODS } from "@/lib/data/perfumes";

// Spec §27 (Social Proof): reuse existing marketing photography rather
// than fabricated reviews, since no verified customer testimonials
// exist yet. Deliberately different slugs than getFeaturedPerfumes(4)
// above so this section reads as mood/atmosphere, not a repeat of the
// product grid.
const EXPERIENCE_IMAGES = [
  {
    slug: "paris-nocturne",
    name: "Paris Nocturne",
    descriptor: "The Night",
    alt: "Aurielle perfume oil on a marble table at night, with the Eiffel Tower lit in the distance",
  },
  {
    slug: "visionnaire",
    name: "Visionnaire",
    descriptor: "The Confidence",
    alt: "Aurielle perfume oil beside greenery and a gilded mirror",
  },
  {
    slug: "rose-de-minuit",
    name: "Rose de Minuit",
    descriptor: "The Allure",
    alt: "Aurielle perfume oil among dark red roses and candlelight",
  },
];

const WHY_AURIELLE = [
  {
    title: "Refined Perfume Oils",
    body: "Explore concentrated fragrance compositions designed for a lasting scent experience.",
  },
  {
    title: "Alcohol-Free",
    body: "Perfume oils offer a different, intimate way to experience fragrance.",
  },
  {
    title: "Various Signature Scents",
    body: "A collection spanning floral, woody, warm, mysterious and alluring profiles.",
  },
  {
    title: "For Creators & Businesses",
    body: "Our Atelier also provides fragrance materials for those creating something of their own.",
  },
];

export default function Home() {
  const featured = getFeaturedPerfumes(4);

  return (
    <div className="flex flex-col">
      {/* 1. HERO, spec §4 */}
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
            THE ART OF FRAGRANCE
          </h1>
          <p className="hero-in hero-in-delay-2 max-w-md text-base text-ink sm:text-lg">
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

      {/* 2. INTRODUCTION, spec §5: A World of Fragrance */}
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
              Discover Aurielle
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

      {/* 3. AURIELLE COLLECTION PREVIEW, spec §6 */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">
              The Aurielle Collection
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
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

      {/* THE AURIELLE EXPERIENCE, spec §27: reused photography, not
          fabricated reviews (no verified customer feedback exists yet). */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="font-script text-2xl text-burgundy">Every Bottle, a Story</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">
              The Aurielle Experience
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {EXPERIENCE_IMAGES.map((image, i) => (
              <Reveal key={image.slug} delayMs={i * 100}>
                <div className="relative aspect-[3/4] overflow-hidden border border-taupe/30">
                  <Image
                    src={`/images/perfumes/main/${image.slug}.jpg`}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-center font-serif text-sm text-ink">
                  {image.name}
                </p>
                <p className="text-center text-xs uppercase tracking-wide text-burgundy">
                  {image.descriptor}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FIND YOUR SCENT: mood-based discovery, not a formal fragrance-
          family classification (unconfirmed by the client). */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <p className="font-script text-2xl text-burgundy">Find Your Scent</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">
              A Fragrance for Every Mood
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
              Discover scents inspired by femininity, mystery, elegance,
              warmth and allure.
            </p>
          </Reveal>

          <Reveal delayMs={120} className="mt-10 flex flex-wrap justify-center gap-3">
            {MOODS.map((mood) => (
              <Link
                key={mood}
                href={`/collection?mood=${encodeURIComponent(mood)}`}
                className="border border-burgundy px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-burgundy transition-colors hover:bg-burgundy hover:text-ivory"
              >
                {mood}
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 5. THE AURIELLE PHILOSOPHY */}
      <Reveal className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-10">
        <p className="font-script text-2xl text-burgundy">The Aurielle Philosophy</p>
        <h2 className="mt-2 font-serif text-3xl text-ink">
          A Scent Becomes Part of You
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink/70">
          Fragrance is more than something you wear. It becomes a memory, a
          mood, a presence.
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink/70">
          Aurielle was created around the belief that the right scent should
          feel personal. Something that accompanies you, reflects you and
          eventually becomes part of how you are remembered.
        </p>
        <div className="mt-6">
          <ButtonLink href="/collection" variant="secondary">
            Explore the Collection
          </ButtonLink>
        </div>
      </Reveal>

      {/* 6. THE ATELIER, replaces the generic "For Your Business" block */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <h2 className="font-serif text-3xl text-ink">The Atelier</h2>
            <p className="mt-3 font-serif text-xl text-burgundy">
              Need fragrance materials for your business?
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
              Explore fragrance oils and materials available by kg/L,
              whether you&rsquo;re developing your own fragrance, building a
              product line, or sourcing for commercial production.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Reveal className="border border-taupe/30 bg-ivory p-8 text-left">
              <h3 className="font-serif text-lg text-ink">Fragrance Oils</h3>
              <p className="mt-2 text-sm text-ink/70">
                Browse available fragrance materials and pricing by kg/L.
              </p>
            </Reveal>
            <Reveal delayMs={100} className="border border-taupe/30 bg-ivory p-8 text-left">
              <h3 className="font-serif text-lg text-ink">For Perfumers</h3>
              <p className="mt-2 text-sm text-ink/70">
                Materials for developing your own fragrance creations.
              </p>
            </Reveal>
            <Reveal delayMs={200} className="border border-taupe/30 bg-ivory p-8 text-left">
              <h3 className="font-serif text-lg text-ink">For Businesses</h3>
              <p className="mt-2 text-sm text-ink/70">
                Bulk supply for brands, manufacturers and commercial use.
              </p>
            </Reveal>
          </div>

          <div className="mt-12">
            <ButtonLink href="/atelier-supply">View Atelier Supply</ButtonLink>
          </div>
        </div>
      </section>

      {/* 7. WHY AURIELLE, trust section */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">Why Aurielle</h2>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_AURIELLE.map((item, i) => (
              <Reveal key={item.title} delayMs={i * 100} className="text-center">
                <h3 className="font-serif text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink/60">{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. BUSINESS / WHOLESALE CTA */}
      <Reveal className="bg-beige px-6 py-24 text-center lg:px-10">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl text-ink">
            Create Something of Your Own
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-ink/70">
            Whether you&rsquo;re developing a fragrance line, creating your
            own products, or sourcing fragrance materials for your business,
            the Atelier is here to help.
          </p>
          <div className="mt-6">
            <ButtonLink href="/atelier-supply">Explore Atelier Supply</ButtonLink>
          </div>
        </div>
      </Reveal>

      {/* 9. THE STORY BEHIND AURIELLE. Founder photo still pending. */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-2 lg:items-start lg:px-10">
        <Reveal className="flex aspect-[4/3] items-center justify-center border border-taupe/30 bg-beige/40">
          <p className="px-6 text-center text-xs uppercase tracking-wide text-ink/40">
            Founder photo pending
          </p>
        </Reveal>
        <Reveal delayMs={120}>
          <h2 className="font-serif text-3xl text-ink">The Story Behind Aurielle</h2>
          <p className="mt-4 text-sm text-ink/70">
            A fragrance is more than a scent. It is a memory, an emotion, a
            presence.
          </p>
          <p className="mt-4 text-sm text-ink/70">
            Inspired by the timeless elegance of Paris and the artistry of
            French perfumery, Aurielle Paris Atelier was created to make
            fragrance feel personal.
          </p>
          <p className="mt-4 text-sm text-ink/70">
            Our collection of refined perfume oils invites you into different
            worlds of beauty, mystery, warmth and allure, with each
            composition created to become part of your own signature.
          </p>
          <p className="mt-4 text-sm text-ink/70">
            Beyond the collection, our Atelier supplies fragrance materials
            to perfumers, creators and businesses, giving others the
            opportunity to create something uniquely their own.
          </p>
          <div className="mt-6">
            <ButtonLink href="/collection" variant="secondary">
              Discover the World of Aurielle
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* 10. FINAL CTA, atmospheric close */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
        <Image
          src="/images/perfumes/main/rouge-royale.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-burgundy-dark/70" />
        <Reveal className="relative z-10 flex flex-col items-center gap-4">
          <p className="font-script text-3xl text-ivory">Discover Your Signature</p>
          <p className="max-w-md text-sm text-ivory/80">
            Enter the world of Aurielle Paris Atelier.
          </p>
          <div className="mt-2">
            <ButtonLink href="/collection">Shop the Collection</ButtonLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
