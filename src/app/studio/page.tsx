import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Reveal } from "@/components/reveal";
import { ButtonLink } from "@/components/button-link";
import { StudioQuoteForm } from "@/components/studio-quote-form";
import { STUDIO_GROUPINGS } from "@/lib/data/studio-groupings";

export const metadata: Metadata = {
  title: "Customisation Studio | Aurielle Paris Atelier",
  description:
    "UV DTF printing and custom branding for luxury packaging, personal gifts, business solutions and industrial production. Request a quote from the Aurielle atelier.",
};

export default function CustomisationStudioPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
      <div className="text-center">
        <p className="font-script text-2xl text-burgundy">The Customisation Studio</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">Made-to-Order UV Printing</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-ink/60">
          Every piece the Studio produces is made to order -- no fixed catalogue, no stock
          pricing. Browse what we print by category below, then request a quote for your own
          project.
        </p>
      </div>

      <div className="mt-16 space-y-16">
        {STUDIO_GROUPINGS.map((grouping, i) => (
          <Reveal key={grouping.slug} delayMs={i * 80} className="border-t border-taupe/20 pt-10">
            <h2 className="font-serif text-2xl text-ink">{grouping.name}</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink/60">{grouping.intro}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {grouping.items.map((item) => (
                <span
                  key={item}
                  className="rounded-sm border border-taupe/30 bg-beige/40 px-3 py-1.5 text-xs text-ink/70"
                >
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href={`/studio?grouping=${encodeURIComponent(grouping.name)}#quote`}
                className="border border-burgundy px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-burgundy transition-colors hover:bg-burgundy hover:text-ivory"
              >
                Request a Quote
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-20 border-t border-taupe/20 pt-16">
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
      </div>

      <div className="mt-16 text-center">
        <ButtonLink href="/business" variant="secondary">
          Talk to the Atelier
        </ButtonLink>
      </div>
    </div>
  );
}
