import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { PerfumeCard } from "@/components/perfume-card";
import { Reveal } from "@/components/reveal";
import { getFeaturedPerfumes, MOODS } from "@/lib/data/perfumes";

// Homepage restructure per client-supplied "Homepage Improvement &
// Content Specification": Aurielle (B2C) and Atelier (B2B supply /
// private-label) as one fragrance house with two connected worlds.

const ATELIER_CAPABILITIES = [
  {
    title: "Fragrance Oils",
    body: "Source fragrance materials and profiles for personal, creative or commercial applications.",
  },
  {
    title: "Custom Packaging",
    body: "Bottles, caps, boxes, pouches, labels and other packaging components designed around your brand.",
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

const CONCEPT_STEPS = [
  {
    number: "01",
    title: "Develop Your Scent",
    body: "Select from available fragrance profiles or work toward a scent identity suited to your product and brand.",
  },
  {
    number: "02",
    title: "Choose Your Packaging",
    body: "Explore bottles, caps, boxes, pouches and other packaging components.",
  },
  {
    number: "03",
    title: "Make It Yours",
    body: "Customize labels, branding, finishes and presentation around your identity.",
  },
  {
    number: "04",
    title: "Bring It to Market",
    body: "Coordinate production, sourcing and supply for your finished fragrance products.",
  },
];

// Spec §11 "Every Bottle, a Story": reused, already-licensed product
// photography as atmosphere, not fabricated reviews (no verified
// customer testimonials exist yet, spec §27 in the earlier round).
const EXPERIENCE_IMAGES = [
  {
    slug: "paris-nocturne",
    name: "Paris Nocturne",
    descriptor: "Midnight Paris, candlelight and quiet sophistication.",
    alt: "Aurielle perfume oil on a marble table at night, with the Eiffel Tower lit in the distance",
  },
  {
    slug: "donna-velours",
    name: "Donna Velours",
    descriptor: "Deep plum, velvet and dark florals.",
    alt: "Aurielle perfume oil among deep plum roses and velvet drapery",
  },
  {
    slug: "rouge-royale",
    name: "Rouge Royale",
    descriptor: "Crimson, burgundy, roses and polished gold.",
    alt: "Aurielle perfume oil among red roses, a candle and gold jewelry",
  },
];

const WHY_AURIELLE = [
  {
    title: "Refined Fragrance",
    body: "Thoughtfully selected fragrance profiles for personal and commercial applications.",
  },
  {
    title: "From Scent to Product",
    body: "Go beyond fragrance oils with packaging, customization and product development support.",
  },
  {
    title: "Personal & Commercial",
    body: "Whether you're discovering a signature scent or building a fragrance business.",
  },
  {
    title: "Supply That Supports Growth",
    body: "From individual requirements to commercial sourcing and larger-scale projects.",
  },
];

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
        <div className="relative z-10 flex flex-col items-center gap-6 border border-taupe/20 bg-ivory px-8 py-10 sm:px-14 sm:py-14">
          <p className="hero-in font-script text-3xl text-burgundy">
            Aurielle Paris Atelier
          </p>
          <h1 className="hero-in hero-in-delay-1 max-w-3xl font-serif text-4xl leading-tight text-ink sm:text-6xl">
            THE ART OF FRAGRANCE
          </h1>
          <p className="hero-in hero-in-delay-2 max-w-md text-base text-ink sm:text-lg">
            From signature scents to fragrance supply and private-label
            creation, Aurielle Paris brings together refined fragrances,
            quality fragrance materials, custom packaging and product
            development support for individuals, creators and businesses.
          </p>
          <div className="hero-in hero-in-delay-3 mt-4 flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/collection">Discover Aurielle</ButtonLink>
            <ButtonLink href="/atelier-supply" variant="secondary">
              Explore the Atelier
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* A WORLD OF FRAGRANCE, spec §5 */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-2 lg:px-10">
        <Reveal className="text-center lg:col-span-2 lg:text-center">
          <p className="font-script text-2xl text-burgundy">A World of Fragrance</p>
        </Reveal>
        <Reveal className="border border-taupe/30 p-10 text-center">
          <h2 className="font-serif text-2xl text-ink">Aurielle</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-burgundy">
            The Fragrance Collection
          </p>
          <p className="mx-auto mt-4 max-w-xs text-sm text-ink/70">
            Discover refined perfume oils created to become part of your
            signature. Explore scents inspired by femininity, mystery,
            elegance, warmth and allure.
          </p>
          <div className="mt-6">
            <ButtonLink href="/collection" variant="secondary">
              Discover Aurielle
            </ButtonLink>
          </div>
        </Reveal>
        <Reveal className="border border-taupe/30 p-10 text-center" delayMs={120}>
          <h2 className="font-serif text-2xl text-ink">Atelier</h2>
          <p className="mt-1 text-xs uppercase tracking-wide text-burgundy">
            Fragrance Supply &amp; Creation
          </p>
          <p className="mx-auto mt-4 max-w-xs text-sm text-ink/70">
            For perfumers, creators and businesses looking to source
            fragrance materials, develop products, customize packaging or
            build a fragrance line.
          </p>
          <div className="mt-6">
            <ButtonLink href="/atelier-supply" variant="secondary">
              Explore the Atelier
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* ATELIER INTRODUCTION, spec §6 */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <p className="font-script text-2xl text-burgundy">The Aurielle Atelier</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">
              More Than Fragrance. A Supply Partner.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
              From fragrance oils and packaging to custom branding and
              finished products, Aurielle Paris Atelier supports creators
              and businesses throughout the fragrance development process.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="mt-12">
            <ButtonLink href="/atelier-supply">Explore Atelier Supply</ButtonLink>
          </div>
        </div>
      </section>

      {/* REAL-WORLD BUSINESS PROOF, spec §7. Naming stays neutral
          ("Behind the Supply") since ownership of the pictured facility
          hasn't been confirmed, per the spec's own rule against
          claiming "Our Factory" without that confirmation. */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="font-script text-2xl text-burgundy">Behind the Supply</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">
              Built for Ideas That Need to Scale
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
              Whether you&rsquo;re developing a signature scent, launching a
              fragrance collection or sourcing products for an established
              business, the Atelier connects fragrance, packaging and
              supply into one process.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              { slug: "warehouse", label: "Warehouse", alt: "Warehouse stacked with packaged inventory ready for shipment" },
              { slug: "production", label: "Production", alt: "Stainless steel production tanks in a clean manufacturing facility" },
              { slug: "packaging", label: "Packaging", alt: "Automated packaging and filling equipment" },
              { slug: "finished-product", label: "Finished Product", alt: "Wall display of finished fragrance products on illuminated shelving" },
            ].map((image, i) => (
              <Reveal
                key={image.slug}
                delayMs={i * 80}
                className="relative aspect-[16/10] overflow-hidden border border-taupe/30"
              >
                <Image
                  src={`/images/atelier/${image.slug}.jpg`}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FROM CONCEPT TO FINISHED PRODUCT, spec §8 */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">
              From Concept to Finished Product
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
              Bring your fragrance idea to life through a process designed
              around your brand, your product and your goals.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CONCEPT_STEPS.map((step, i) => (
              <Reveal key={step.number} delayMs={i * 100} className="text-left">
                <p className="font-script text-xl text-burgundy">{step.number}</p>
                <h3 className="mt-1 font-serif text-lg text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{step.body}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 text-center">
            <ButtonLink href="/business">Start Your Project</ButtonLink>
          </div>
        </div>
      </section>

      {/* YOUR BRAND, YOUR BOTTLE, spec §9 */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">
              Your Brand. Your Bottle. Your Identity.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
              From custom labels and metal plates to bottles, caps and
              packaging, the Atelier helps transform fragrance concepts
              into products that look and feel like your brand.
            </p>
          </Reveal>

          <Reveal
            delayMs={100}
            className="relative mt-10 aspect-[21/9] overflow-hidden border border-taupe/30"
          >
            <Image
              src="/images/atelier/custom-label.jpg"
              alt="Close-up of custom perfume bottles, candles and metal labels bearing different private-label brand names"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </Reveal>

          <div className="mt-10 text-center">
            <ButtonLink href="/business" variant="secondary">
              Explore Customization
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* AURIELLE COLLECTION, spec §10 */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="font-script text-2xl text-burgundy">The Aurielle Collection</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">
              Fragrance Made Personal
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              Refined perfume oils crafted to become part of your signature.
              Each bottle holds 10 milliliters of refined, alcohol-free
              scent.
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

      {/* EVERY BOTTLE, A STORY, spec §11 */}
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
                <p className="mx-auto mt-1 max-w-[24ch] text-center text-xs text-ink/50">
                  {image.descriptor}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FIND YOUR SIGNATURE, spec §12: mood-based discovery, not a
          formal fragrance-family classification (unconfirmed by the
          client). Already functionally filters /collection. */}
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

      {/* THE AURIELLE PHILOSOPHY */}
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

      {/* WHY AURIELLE, spec §13 */}
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

      {/* THE STORY BEHIND AURIELLE, spec §14 */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-24 lg:grid-cols-2 lg:items-start lg:px-10">
        <Reveal className="relative aspect-[4/3] overflow-hidden border border-taupe/30">
          <Image
            src="/images/atelier/founder.jpg"
            alt="Portrait of the Aurielle Paris Atelier founder"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
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

      {/* FRAGRANCE IN THE REAL WORLD, spec §15. Real event photography,
          not fabricated testimonials: no verified customer quotes exist
          yet, so this stays photo-only until real ones are supplied. */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-serif text-3xl text-ink">Fragrance in the Real World</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
              From personal signatures to growing fragrance businesses,
              Aurielle is part of a community of people creating,
              discovering and sharing fragrance.
            </p>
          </Reveal>

          <Reveal
            delayMs={100}
            className="relative mx-auto mt-10 aspect-[16/9] max-w-3xl overflow-hidden border border-taupe/30"
          >
            <Image
              src="/images/atelier/community-event.jpg"
              alt="Guests exploring fragrance samples together at an Aurielle event"
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* CREATE SOMETHING OF YOUR OWN, spec §16: the primary B2B
          conversion section. */}
      <section className="relative flex flex-col items-center justify-center gap-6 overflow-hidden px-6 py-24 text-center">
        <Image
          src="/images/perfumes/main/mystere-xiii.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-burgundy-dark/80" />
        <Reveal className="relative z-10 mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl text-ivory">
            Create Something of Your Own
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-ivory/80">
            Developing a fragrance line, creating your own products or
            sourcing fragrance materials for your business? The Atelier is
            here to help.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <ButtonLink href="/business">Talk to the Atelier</ButtonLink>
            <ButtonLink href="/atelier-supply" variant="inverse">
              View Supply Catalog
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* FINAL LUXURY CTA, spec §17. border-t makes this read as a
          distinct section from "Create Something of Your Own" above it:
          both are dark, full-bleed, burgundy-overlaid photo sections, so
          without a visible seam they blend into what looks like one
          broken image rather than two intentional blocks. */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center gap-6 overflow-hidden border-t border-ivory/20 px-6 py-24 text-center">
        <Image
          src="/images/perfumes/main/noir-elixir.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-burgundy-dark/70" />
        <Reveal className="relative z-10 flex flex-col items-center gap-4">
          <p className="font-script text-3xl text-ivory">Discover Your Signature</p>
          <p className="max-w-md text-sm text-ivory/80">
            Enter the world of Aurielle Paris.
          </p>
          <div className="mt-2">
            <ButtonLink href="/collection">Shop the Collection</ButtonLink>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
