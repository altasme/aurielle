import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button-link";
import { CUSTOMISATION_STUDIO_ENABLED } from "@/config/studio";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About | Aurielle Paris Atelier",
};

// About carries the brand narrative for all three pillars, not just
// fragrance (spec v5.4). "What We Do" replaces the previous separate
// long-form Atelier Supply / Customisation Studio essays with a
// leaner, parallel three-block summary matching the homepage's pillar
// framing; those two pages now carry their own full story instead.
const WHAT_WE_DO_LINKS = [
  { href: "/collection", cta: "Shop the Collection" },
  { href: "/atelier-supply", cta: "Explore Supply" },
  ...(CUSTOMISATION_STUDIO_ENABLED ? [{ href: "/studio", cta: "Explore the Studio" }] : []),
];

export default async function AboutPage() {
  const { text, images } = await getSiteContent("about");

  return (
    <div>
      {/* PAGE HERO. hero.jpg is very bright (~217/255 average
          luminance in the text band), so it needs a much stronger
          scrim than a typical hero photo to keep white text legible
          -- measured, not guessed, at bg-ink/80. */}
      <section className="relative flex min-h-[40vh] flex-col items-center justify-center gap-3 overflow-hidden px-6 py-20 text-center">
        <Image src={images.hero_image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/80" />
        <Reveal className="relative z-10 [text-shadow:0_2px_16px_rgba(0,0,0,0.55)]">
          <p className="font-script text-2xl text-ivory">{text.hero_eyebrow}</p>
          <h1 className="mt-2 font-serif text-4xl text-ivory sm:text-5xl">{text.hero_headline}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ivory/90">{text.hero_body}</p>
        </Reveal>
      </section>

      {/* THE STORY BEHIND AURIELLE (founder). Previously split across
          two consecutive sections ("Our Story" + this one) that told
          the same origin story twice, back to back, in near-identical
          language (same Paris-inspiration beat, same fragrance-to-
          full-house expansion beat). Merged into one telling. */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-start">
          <Reveal className="relative aspect-[4/3] overflow-hidden border border-taupe/30">
            <Image
              src={images.founder_image}
              alt="Portrait of the Aurielle Paris Atelier founder"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </Reveal>
          <Reveal delayMs={120}>
            <h2 className="font-serif text-3xl text-ink">{text.story_heading}</h2>
            <p className="mt-4 text-sm text-ink/70">{text.story_body_1}</p>
            <p className="mt-4 text-sm text-ink/70">{text.story_body_2}</p>
            <p className="mt-4 text-sm text-ink/70">{text.story_body_3}</p>
            <p className="mt-4 text-sm text-ink/70">{text.story_body_4}</p>
          </Reveal>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl text-center">
          <Reveal>
            <h2 className="font-serif text-3xl text-ink">{text.whatwedo_heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">{text.whatwedo_body}</p>
          </Reveal>

          <div
            className={`mx-auto mt-12 grid gap-6 sm:grid-cols-2 ${
              WHAT_WE_DO_LINKS.length === 3 ? "lg:grid-cols-3" : ""
            }`}
          >
            {WHAT_WE_DO_LINKS.map((item, i) => (
              <Reveal key={item.href} delayMs={i * 100} className="border border-taupe/30 p-8 text-center">
                <h3 className="font-serif text-lg text-ink">{text[`whatwedo_${i + 1}_title`]}</h3>
                <p className="mt-2 text-sm text-ink/70">{text[`whatwedo_${i + 1}_body`]}</p>
                <div className="mt-5">
                  <ButtonLink href={item.href} variant="secondary">
                    {item.cta}
                  </ButtonLink>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FRAGRANCE IN THE REAL WORLD (community). Real event
          photography, not fabricated testimonials: no verified
          customer quotes exist yet, so this stays photo-only until
          real ones are supplied. */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="font-serif text-3xl text-ink">{text.community_heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">{text.community_body}</p>
          </Reveal>

          <Reveal
            delayMs={100}
            className="relative mx-auto mt-10 aspect-[16/9] max-w-3xl overflow-hidden border border-taupe/30"
          >
            <Image
              src={images.community_image}
              alt="Guests exploring fragrance samples together at an Aurielle event"
              fill
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* CLOSE CTA */}
      <section className="px-6 py-20 text-center lg:px-10">
        <Reveal className="flex flex-col justify-center gap-4 sm:flex-row">
          <ButtonLink href="/collection">Explore the Collection</ButtonLink>
          <ButtonLink href="/business" variant="secondary">
            Talk to the Atelier
          </ButtonLink>
        </Reveal>
      </section>
    </div>
  );
}
