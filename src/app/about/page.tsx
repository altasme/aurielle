import type { Metadata } from "next";
import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button-link";
import { CUSTOMISATION_STUDIO_ENABLED } from "@/config/studio";

export const metadata: Metadata = {
  title: "About | Aurielle Paris Atelier",
};

type Section = {
  title: string;
  paragraphs: string[];
  cta?: { href: string; label: string };
};

const SECTIONS: Section[] = [
  {
    title: "Our Story",
    paragraphs: [
      "Aurielle Paris Atelier was created from a love of fragrance, elegance and the timeless art of perfumery.",
      "Inspired by the beauty and character of Paris, Aurielle brings together refined perfume oils and fragrance materials for those who appreciate scent as more than an accessory.",
      "Each fragrance is an invitation to discover a different mood, memory and expression of individuality. From delicate florals and luminous compositions to deeper woods, amber and mysterious evening scents, the Aurielle collection is designed to become part of your personal signature.",
      "Beyond the collection, Atelier Supply extends this passion into fragrance creation, offering materials for perfumers, creators and businesses seeking to develop something of their own.",
      "A world of fragrance, created to be discovered.",
    ],
  },
  {
    title: "Atelier Supply",
    paragraphs: [
      "Where fragrance becomes possibility.",
      "Atelier Supply is the sourcing side of our world, offering fragrance materials for perfumers, creators, manufacturers and businesses.",
      "Whether you are developing your own fragrance, creating a new product line, or sourcing materials for your business, our collection of fragrance materials provides a starting point for your next creation.",
      "Available materials are presented with their corresponding customer-facing pricing and supply information, making it easier to explore options for both smaller creative projects and larger requirements.",
      "Discover the Atelier Supply collection and begin creating your own world of fragrance.",
    ],
    cta: { href: "/atelier-supply", label: "View Atelier Supply" },
  },
  ...(CUSTOMISATION_STUDIO_ENABLED
    ? [
        {
          title: "The Customisation Studio",
          paragraphs: [
            "Where craft becomes yours to keep.",
            "The Customisation Studio is Aurielle's newest craft: made-to-order UV printing for luxury packaging, personal gifts, business branding and industrial production.",
            "Whether you're printing a label for your own perfume line, branding a corporate gift, or producing a small batch of custom pieces, the Studio brings your artwork to life on the object itself.",
            "Every piece is made to order, no fixed catalogue or stock pricing. Share your artwork and request a quote to begin.",
            "Discover the Customisation Studio and bring your own design to life.",
          ],
          cta: { href: "/studio", label: "Explore the Studio" },
        },
      ]
    : []),
  {
    title: "Our Philosophy",
    paragraphs: [
      "We believe fragrance should be personal.",
      "A beautiful scent does more than create an impression. It can evoke a memory, change a mood, become part of a ritual and eventually feel inseparable from the person who wears it.",
      "That is why Aurielle approaches fragrance as an experience rather than simply a product.",
      "Our collection explores different expressions of beauty, from soft and feminine to deep, mysterious and sensual, allowing every individual to discover a fragrance that feels uniquely their own.",
      "Because the most memorable fragrance is the one that becomes part of your story.",
    ],
  },
  {
    title: "Fragrance Craftsmanship",
    paragraphs: [
      "Inspired by the artistry and elegance of French perfumery.",
      "Aurielle's fragrance collection is centered around refined perfume oils designed to offer a distinctive and lasting fragrance experience.",
      "Each composition is given its own character and atmosphere, creating a collection that moves between floral, woody, warm, sensual and sophisticated expressions.",
      "From the finished Aurielle collection to the fragrance materials offered through Atelier Supply, our world is built around one idea:",
      "Fragrance is an art of composition, discovery and personal expression.",
    ],
  },
  {
    title: "Rooted in French Fragrance Tradition",
    paragraphs: [
      "Aurielle Paris Atelier presents a collection of refined perfume oils crafted in France, inspired by the elegance, artistry and enduring influence of French perfumery.",
      "From the compositions themselves to the atmosphere surrounding the brand, France serves as an important part of the Aurielle identity.",
      "A French-inspired world of fragrance, created for discovery.",
    ],
  },
];

export default function AboutPage() {
  return (
    <div>
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
        <Reveal className="text-center">
          <p className="font-script text-2xl text-burgundy">Let&apos;s begin</p>
          <h1 className="mt-2 font-serif text-4xl text-ink">About Aurielle</h1>
        </Reveal>

        <div className="mt-16 space-y-14">
          {SECTIONS.map((section) => (
            <Reveal key={section.title} className="border-t border-taupe/20 pt-8">
              <h2 className="font-serif text-2xl text-ink">{section.title}</h2>
              <div className="mt-3 max-w-md space-y-3 text-sm text-ink/60">
                {section.paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              {section.cta && (
                <div className="mt-6">
                  <ButtonLink href={section.cta.href} variant="secondary">
                    {section.cta.label}
                  </ButtonLink>
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>

      {/* THE STORY BEHIND AURIELLE -- relocated from the homepage
          (v5.2). */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-start">
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
              Beyond the collection, Atelier Supply supplies fragrance
              materials to perfumers, creators and businesses, giving others
              the opportunity to create something uniquely their own.
            </p>
            <div className="mt-6">
              <ButtonLink href="/collection" variant="secondary">
                Discover the World of Aurielle
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FRAGRANCE IN THE REAL WORLD -- relocated from the homepage
          (v5.2). Real event photography, not fabricated testimonials:
          no verified customer quotes exist yet, so this stays
          photo-only until real ones are supplied. */}
      <section className="px-6 py-24 lg:px-10">
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
    </div>
  );
}
