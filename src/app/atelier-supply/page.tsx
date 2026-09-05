import type { Metadata } from "next";
import Image from "next/image";
import { getSupplyMaterials } from "@/lib/data/supply-materials";
import { SupplyCatalogueBrowser } from "@/components/supply-catalogue-browser";
import { ButtonLink } from "@/components/button-link";
import { Reveal } from "@/components/reveal";
import { ProcessStepIcon, type ProcessStepIconName } from "@/components/process-step-icon";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Atelier Supply | Aurielle Paris Atelier",
  description:
    "Browse the Atelier Supply catalogue: fragrance materials, bottles, pouches, boxes and labels for creators, perfumers and businesses.",
};

// Relocated from the homepage per the v5.2 rebalance, page structure
// completed per spec v5.4. Step 03 hands labeling/branding off to the
// Customisation Studio rather than implying Supply prints it (the
// Supply/Studio boundary established in the v5.1 pass). Icons stay
// fixed; title/body are editable via Website Management.
const CONCEPT_ICONS: ProcessStepIconName[] = ["scent", "packaging", "branding", "market"];

const BEHIND_IMAGES = [
  { key: "behind_warehouse", alt: "Warehouse stacked with packaged inventory ready for shipment" },
  { key: "behind_production", alt: "Stainless steel production tanks in a clean manufacturing facility" },
  { key: "behind_packaging", alt: "Automated packaging and filling equipment" },
  { key: "behind_finished", alt: "Wall display of finished fragrance products on illuminated shelving" },
];

// Falls back to a periodic refresh; admin saves also push an immediate
// update via revalidatePath() (see src/app/api/admin/products routes
// and src/lib/admin/site-content.ts).
export const revalidate = 3600;

export default async function AtelierSupplyPage() {
  const [materials, { text, images }] = await Promise.all([getSupplyMaterials(), getSiteContent("atelier-supply")]);

  return (
    <div>
      {/* PAGE HERO */}
      <section className="relative flex min-h-[45vh] flex-col items-center justify-center gap-3 overflow-hidden px-6 py-20 text-center">
        <Image src={images.hero_image} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-ink/50" />
        <Reveal className="relative z-10 [text-shadow:0_2px_16px_rgba(0,0,0,0.55)]">
          <h1 className="font-serif text-4xl text-ivory sm:text-5xl">{text.hero_headline}</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ivory/90">{text.hero_body}</p>
        </Reveal>
      </section>

      {/* CAPABILITY CARDS -- also shown on the Homepage; edited here
          (see EXTRA_REVALIDATE_PATHS in src/lib/admin/site-content.ts). */}
      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i, index) => (
              <Reveal key={i} delayMs={index * 100} className="border border-taupe/30 bg-beige/40 p-8 text-left">
                <h3 className="font-serif text-lg text-ink">{text[`capability_${i}_title`]}</h3>
                <p className="mt-2 text-sm text-ink/70">{text[`capability_${i}_body`]}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FROM CONCEPT TO FINISHED PRODUCT -- relocated from the
          homepage (v5.2); icons instead of numbered badges per v5.4. */}
      <section className="bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">{text.concept_heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">{text.concept_body}</p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CONCEPT_ICONS.map((icon, index) => {
              const i = index + 1;
              return (
                <Reveal key={icon} delayMs={index * 100} className="text-left">
                  <ProcessStepIcon name={icon} className="h-8 w-8 text-burgundy" />
                  <h3 className="mt-3 font-serif text-lg text-ink">{text[`concept_${i}_title`]}</h3>
                  <p className="mt-2 text-sm text-ink/70">{text[`concept_${i}_body`]}</p>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <ButtonLink href="/business">Start Your Project</ButtonLink>
          </div>
        </div>
      </section>

      {/* BEHIND THE SUPPLY -- relocated from the homepage (v5.2).
          Naming stays neutral since ownership of the pictured facility
          hasn't been confirmed. */}
      <section className="px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <p className="font-script text-2xl text-burgundy">{text.behind_eyebrow}</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">{text.behind_heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">{text.behind_body}</p>
          </Reveal>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {BEHIND_IMAGES.map((image, i) => (
              <Reveal
                key={image.key}
                delayMs={i * 80}
                className="relative aspect-[16/10] overflow-hidden border border-taupe/30"
              >
                <Image src={images[image.key]} alt={image.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* THE CATALOGUE */}
      <section id="catalogue" className="scroll-mt-20 bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">{text.catalogue_heading}</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">{text.catalogue_body}</p>
          </Reveal>

          <div className="mt-10">
            <SupplyCatalogueBrowser materials={materials} />
          </div>
        </div>
      </section>

      {/* CLOSE CTA */}
      <section className="px-6 py-20 text-center lg:px-10">
        <Reveal>
          <ButtonLink href="/business">Talk to the Atelier</ButtonLink>
        </Reveal>
      </section>
    </div>
  );
}
