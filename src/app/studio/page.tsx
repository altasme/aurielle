import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button-link";
import { StudioQuoteForm } from "@/components/studio-quote-form";
import { StudioImageSlot } from "@/components/studio-image-slot";
import { StudioChipLink } from "@/components/studio-chip-link";
import { StudioStepIcon, type StudioStepIconName } from "@/components/studio-step-icon";
import { FinishTile } from "@/components/finish-tile";
import { StickyQuoteButton } from "@/components/sticky-quote-button";
import { STUDIO_GROUPINGS } from "@/lib/data/studio-groupings";
import { STUDIO_FINISHES } from "@/lib/data/studio-finishes";

export const metadata: Metadata = {
  title: "Customisation Studio | Aurielle Paris Atelier",
  description:
    "UV DTF printing and custom branding for luxury packaging, personal gifts, business solutions and industrial production. Request a quote from the Aurielle atelier.",
};

const HOW_IT_WORKS: { icon: StudioStepIconName; title: string; body: string }[] = [
  { icon: "upload", title: "Upload Your Artwork", body: "Send your design, logo or reference file with your quote request." },
  { icon: "proof", title: "We Proof It", body: "The atelier reviews your file and confirms sizing, placement and finish." },
  { icon: "print", title: "We Print", body: "Your piece is printed to order on our UV DTF printer." },
  { icon: "delivered", title: "Delivered", body: "Your finished piece is packed and sent to you." },
];

export default function CustomisationStudioPage() {
  return (
    <div>
      {/* 1. VISUAL HERO */}
      <section className="relative flex min-h-[45vh] flex-col items-center justify-center gap-3 overflow-hidden px-6 py-20 text-center">
        <StudioImageSlot
          src="/images/atelier/custom-label.jpg"
          alt="Close-up of custom-printed perfume bottles and metal labels bearing different private-label brand names"
          slotName="studio-hero"
          canvas="1920x640"
          aspectRatio="3:1"
          priority
          sizes="100vw"
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-ink/45" />
        <Reveal className="relative z-10">
          <p className="font-script text-2xl text-ivory">The Customisation Studio</p>
          <h1 className="mt-2 font-serif text-4xl text-ivory sm:text-5xl">
            Made-to-Order UV Printing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ivory/90">
            Every piece the Studio produces is made to order, no fixed catalogue, no stock
            pricing. Browse what we print by category below, then request a quote for your own
            project.
          </p>
          <div className="mt-6">
            <ButtonLink href="#quote">Request a Quote</ButtonLink>
          </div>
        </Reveal>
      </section>

      {/* 2. FINISHES STRIP */}
      <section className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-2xl text-ink">What the Studio Can Do</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              Hover or tap a finish to learn more.
            </p>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            {STUDIO_FINISHES.map((finish, i) => (
              <Reveal key={finish.name} delayMs={i * 60}>
                <FinishTile name={finish.name} description={finish.description} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3-6. FOUR GROUPINGS, alternating image side */}
      <div className="space-y-0">
        {STUDIO_GROUPINGS.map((grouping, i) => {
          const imageFirst = i % 2 === 0;
          return (
            <section
              key={grouping.slug}
              className={i % 2 === 0 ? "bg-beige px-6 py-20 lg:px-10" : "px-6 py-20 lg:px-10"}
            >
              <div
                className={`mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center ${
                  imageFirst ? "" : "lg:[&>*:first-child]:order-2"
                }`}
              >
                <Reveal>
                  <StudioImageSlot
                    src={grouping.image}
                    alt={grouping.image ? `${grouping.name} sample work` : ""}
                    slotName={`grouping-image: ${grouping.name}`}
                    canvas="640x520"
                    aspectRatio="11:9"
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="relative aspect-[11/9] w-full"
                  />
                </Reveal>
                <Reveal delayMs={100}>
                  <h2 className="font-serif text-2xl text-ink">{grouping.name}</h2>
                  <p className="mt-3 max-w-md text-sm text-ink/60">{grouping.intro}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {grouping.items.map((item) => (
                      <StudioChipLink
                        key={item}
                        href={`/studio?grouping=${encodeURIComponent(grouping.name)}&item=${encodeURIComponent(item)}#quote`}
                        grouping={grouping.name}
                        item={item}
                        className="rounded-sm border border-taupe/30 bg-ivory px-3 py-1.5 text-xs text-ink/70 transition-colors hover:border-burgundy hover:text-burgundy"
                      >
                        {item}
                      </StudioChipLink>
                    ))}
                  </div>
                  <div className="mt-6">
                    <StudioChipLink
                      href={`/studio?grouping=${encodeURIComponent(grouping.name)}#quote`}
                      grouping={grouping.name}
                      className="inline-block border border-burgundy px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-burgundy transition-colors hover:bg-burgundy hover:text-ivory"
                    >
                      Request a Quote
                    </StudioChipLink>
                  </div>
                </Reveal>
              </div>
            </section>
          );
        })}
      </div>

      {/* 7. HOW IT WORKS */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">How It Works</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.title} delayMs={i * 100} className="text-center">
                <StudioStepIcon name={step.icon} className="mx-auto h-10 w-10 text-burgundy" />
                <h3 className="mt-4 font-serif text-lg text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{step.body}</p>
              </Reveal>
            ))}
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
          <h2 className="font-serif text-3xl text-ink">Request a Quote</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
            Tell us what you have in mind and, if you have one, attach your artwork or logo. The
            atelier will follow up with pricing and turnaround.
          </p>
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
