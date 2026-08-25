import type { Metadata } from "next";
import Image from "next/image";
import { getSupplyMaterials } from "@/lib/data/supply-materials";
import { SupplyCatalogueBrowser } from "@/components/supply-catalogue-browser";
import { ButtonLink } from "@/components/button-link";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Atelier Supply | Aurielle Paris Atelier",
  description:
    "Browse the Atelier Supply catalogue: fragrance materials, bottles, pouches, boxes and labels for creators, perfumers and businesses.",
};

// Relocated from the homepage per the v5.2 rebalance -- this is
// destination content once a visitor has chosen the Supply pillar,
// not a front-door taste. Step 03 hands labeling/branding off to the
// Customisation Studio rather than implying Supply prints it (the
// same Supply/Studio boundary established in the v5.1 pass).
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
    body: "Bring your labels, branding and finishes to life through the Customisation Studio.",
  },
  {
    number: "04",
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
      <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-ink">Atelier Supply</h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
            Fragrance materials, bottles, pouches, boxes and labels for your
            next creation &mdash; browse by category or search the full
            catalogue.
          </p>
        </div>

        <div className="mt-10">
          <SupplyCatalogueBrowser materials={materials} />
        </div>
      </div>

      {/* FROM CONCEPT TO FINISHED PRODUCT -- relocated from the
          homepage (v5.2). */}
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
    </div>
  );
}
