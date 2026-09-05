import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button-link";
import { StudioQuoteForm } from "@/components/studio-quote-form";
import { StudioImageSlot } from "@/components/studio-image-slot";
import { StudioGroupingGallery } from "@/components/studio-grouping-gallery";
import { StudioStepIcon, type StudioStepIconName } from "@/components/studio-step-icon";
import { FinishTile } from "@/components/finish-tile";
import { StickyQuoteButton } from "@/components/sticky-quote-button";
import { STUDIO_GROUPINGS } from "@/lib/data/studio-groupings";
import { STUDIO_FINISHES } from "@/lib/data/studio-finishes";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Customisation Studio | Aurielle Paris Atelier",
  description:
    "UV DTF printing and custom branding for luxury packaging, personal gifts, business solutions and industrial production. Request a quote from the Aurielle atelier.",
};

// Icons stay fixed; title/body are editable via Website Management.
const HOW_IT_WORKS_ICONS: StudioStepIconName[] = ["upload", "proof", "print", "delivered"];

export default async function CustomisationStudioPage() {
  const { text, images } = await getSiteContent("studio");

  return (
    <div>
      {/* 1. VISUAL HERO */}
      <section className="relative flex min-h-[45vh] flex-col items-center justify-center gap-3 overflow-hidden px-6 py-20 text-center">
        <StudioImageSlot
          src={images.hero_image}
          alt="The Aurielle Studio's A3 UV DTF printer mid-print on a floral design"
          slotName="studio-hero"
          canvas="1920x640"
          aspectRatio="3:1"
          priority
          sizes="100vw"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-ink/50" />
        <Reveal className="relative z-10 [text-shadow:0_2px_16px_rgba(0,0,0,0.55)]">
          <p className="font-script text-2xl text-ivory">{text.hero_eyebrow}</p>
          <h1 className="mt-2 font-serif text-4xl text-ivory sm:text-5xl">{text.hero_headline}</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ivory/90">{text.hero_body}</p>
          <div className="mt-6">
            <ButtonLink href="#quote">{text.hero_cta}</ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* 2. FINISHES STRIP */}
      <section className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-2xl text-ink">{text.finishes_heading}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">{text.finishes_body}</p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {STUDIO_FINISHES.map((finish, i) => (
              <Reveal key={finish.name} delayMs={i * 60}>
                <FinishTile name={finish.name} description={finish.description} image={finish.image} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3-6. FOUR GROUPINGS, alternating image side */}
      <div className="space-y-0">
        {STUDIO_GROUPINGS.map((grouping, i) => (
          <section
            key={grouping.slug}
            className={i % 2 === 0 ? "bg-beige px-6 py-20 lg:px-10" : "px-6 py-20 lg:px-10"}
          >
            <StudioGroupingGallery grouping={grouping} imageFirst={i % 2 === 0} />
          </section>
        ))}
      </div>

      {/* 7. HOW IT WORKS */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">{text.howitworks_heading}</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_ICONS.map((icon, index) => {
              const i = index + 1;
              return (
                <Reveal key={icon} delayMs={index * 100} className="text-center">
                  <StudioStepIcon name={icon} className="mx-auto h-10 w-10 text-burgundy" />
                  <h3 className="mt-4 font-serif text-lg text-ink">{text[`howitworks_${i}_title`]}</h3>
                  <p className="mt-2 text-sm text-ink/70">{text[`howitworks_${i}_body`]}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/*
        8. RECENT WORK: omitted for now. We only have one real
        print-work photo (used above, in the hero and the Luxury
        Packaging & Branding grouping), not enough distinct pieces for
        an honest gallery. Per the spec: "If there is not enough real
        work at launch, omit this section entirely. Do not fill it
        with fabricated samples." Add it back once real finished
        pieces exist (see docs/spec/AURIELLE_STUDIO_PAGE_SPEC.md §13).
      */}

      {/* 9. REQUEST A QUOTE */}
      <section id="quote" className="scroll-mt-20 px-6 py-24 lg:px-10">
        <div className="text-center">
          <h2 className="font-serif text-3xl text-ink">{text.quote_heading}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">{text.quote_body}</p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl">
          <Suspense>
            <StudioQuoteForm />
          </Suspense>
        </div>
      </section>

      <StickyQuoteButton />
    </div>
  );
}
