import type { Metadata } from "next";
import Link from "next/link";
import { BusinessInquiryForm } from "@/components/business-inquiry-form";
import { Reveal } from "@/components/reveal";
import { CUSTOMISATION_STUDIO_ENABLED } from "@/config/studio";

export const metadata: Metadata = {
  title: "Business & Wholesale | Aurielle Paris Atelier",
};

export default function BusinessPage() {
  return (
    <Reveal className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <h1 className="font-serif text-4xl text-ink">For Your Business</h1>
      <p className="mt-4 text-sm text-ink/70">
        Looking for fragrance materials for your own creations, products or
        business?
      </p>
      {CUSTOMISATION_STUDIO_ENABLED && (
        <p className="mt-2 text-xs text-ink/50">
          Looking for custom UV-printed packaging or branding instead? Visit the{" "}
          <Link href="/studio" className="text-burgundy underline">
            Customisation Studio
          </Link>
          .
        </p>
      )}

      <BusinessInquiryForm />
    </Reveal>
  );
}
