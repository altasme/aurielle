import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getPerfumes } from "@/lib/data/perfumes";
import { CollectionBrowser } from "@/components/collection-browser";
import { Reveal } from "@/components/reveal";
import { MOODS } from "@/lib/data/moods";

export const metadata: Metadata = {
  title: "The Aurielle Collection | Aurielle Paris Atelier",
  description:
    "Browse the Aurielle Collection of refined perfume oils crafted for everyday elegance.",
};

// Spec §11 "Every Bottle, a Story": reused, already-licensed product
// photography as atmosphere, not fabricated reviews (no verified
// customer testimonials exist yet). Relocated here from the homepage
// per the v5.2 rebalance -- this is destination content, not a
// front-door taste.
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

// Falls back to a periodic refresh; admin saves also push an immediate
// update via revalidatePath() (see src/app/api/admin/products routes).
export const revalidate = 3600;

export default async function CollectionPage() {
  const perfumes = await getPerfumes();

  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <Reveal className="text-center">
          <h1 className="font-serif text-4xl text-ink">The Aurielle Collection</h1>
          <p className="mt-3 text-sm text-ink/60">
            Fragrance oils crafted to become part of your signature.
          </p>
        </Reveal>

        <div className="mt-10">
          <Suspense>
            <CollectionBrowser perfumes={perfumes} />
          </Suspense>
        </div>
      </div>

      {/* EVERY BOTTLE, A STORY -- relocated from the homepage (v5.2). */}
      <section className="bg-beige px-6 py-24 lg:px-10">
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

      {/* FIND YOUR SIGNATURE -- relocated from the homepage (v5.2):
          mood-based discovery, not a formal fragrance-family
          classification (unconfirmed by the client). Filters the
          browser above via the mood query param. */}
      <section className="px-6 py-24 lg:px-10">
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

      {/* THE AURIELLE PHILOSOPHY -- relocated from the homepage (v5.2). */}
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
      </Reveal>
    </div>
  );
}
