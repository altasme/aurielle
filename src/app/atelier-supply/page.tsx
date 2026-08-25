import type { Metadata } from "next";
import Image from "next/image";
import { getSupplyMaterials } from "@/lib/data/supply-materials";
import { SupplyCatalogueBrowser } from "@/components/supply-catalogue-browser";
import { ButtonLink } from "@/components/button-link";
import { Reveal } from "@/components/reveal";
import { ProcessStepIcon, type ProcessStepIconName } from "@/components/process-step-icon";
import { ATELIER_CAPABILITIES } from "@/lib/data/atelier-capabilities";

export const metadata: Metadata = {
  title: "Atelier Supply | Aurielle Paris Atelier",
  description:
    "Browse the Atelier Supply catalogue: fragrance materials, bottles, pouches, boxes and labels for creators, perfumers and businesses.",
};

// Relocated from the homepage per the v5.2 rebalance, page structure
// completed per spec v5.4. Step 03 hands labeling/branding off to the
// Customisation Studio rather than implying Supply prints it (the
// Supply/Studio boundary established in the v5.1 pass).
const CONCEPT_STEPS: { icon: ProcessStepIconName; title: string; body: string }[] = [
  {
    icon: "scent",
    title: "Develop Your Scent",
    body: "Select from available fragrance profiles or work toward a scent identity suited to your product and brand.",
  },
  {
    icon: "packaging",
    title: "Choose Your Packaging",
    body: "Explore bottles, caps, boxes, pouches and other packaging components.",
  },
  {
    icon: "branding",
    title: "Make It Yours",
    body: "Bring your labels, branding and finishes to life through the Customisation Studio.",
  },
  {
    icon: "market",
    title: "Bring It to Market",
    body: "Coordinate production, sourcing and supply for your finished fragrance products.",
  },
];

// Falls back to a periodic refresh; admin saves also push an immediate
// update via revalidatePath() (see src/app/api/admin/products routes).
export const revalidate = 3600;

export default async function AtelierSupplyPage() {
  const materials = await getSupplyMaterials();

  return (
    <div>
      {/* PAGE HERO */}
      <section className="relative flex min-h-[45vh] flex-col items-center justify-center gap-3 overflow-hidden px-6 py-20 text-center">
        <Image
          src="/images/headers/atelier-supply-hero.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/50" />
        <Reveal className="relative z-10 [text-shadow:0_2px_16px_rgba(0,0,0,0.55)]">
          <h1 className="font-serif text-4xl text-ivory sm:text-5xl">Atelier Supply</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ivory/90">
            Fragrance materials and sourcing for creators and businesses
            building their own line.
          </p>
        </Reveal>
      </section>

      {/* CAPABILITY CARDS */}
      <section className="px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ATELIER_CAPABILITIES.map((item, i) => (
              <Reveal
                key={item.title}
                delayMs={i * 100}
                className="border border-taupe/30 bg-beige/40 p-8 text-left"
              >
                <h3 className="font-serif text-lg text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{item.body}</p>
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
              <Reveal key={step.title} delayMs={i * 100} className="text-left">
                <ProcessStepIcon name={step.icon} className="h-8 w-8 text-burgundy" />
                <h3 className="mt-3 font-serif text-lg text-ink">{step.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{step.body}</p>
              </Reveal>
            ))}
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
            <p className="font-script text-2xl text-burgundy">Behind the Supply</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">
              Built for Ideas That Need to Scale
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
              Whether you&rsquo;re developing a signature scent, launching a
              fragrance collection or sourcing products for an established
              business, Atelier Supply connects fragrance, materials and
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

      {/* THE CATALOGUE */}
      <section id="catalogue" className="scroll-mt-20 bg-beige px-6 py-24 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <Reveal className="text-center">
            <h2 className="font-serif text-3xl text-ink">The Catalogue</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
              Fragrance materials, bottles, pouches, boxes and labels, priced
              in USD per kilogram. Browse by category or search the full
              catalogue.
            </p>
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
