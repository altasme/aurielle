import type { Metadata } from "next";
import Link from "next/link";
import { BusinessInquiryForm } from "@/components/business-inquiry-form";
import { Reveal } from "@/components/reveal";
import { CUSTOMISATION_STUDIO_ENABLED } from "@/config/studio";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Business & Wholesale | Aurielle Paris Atelier",
};

export default async function BusinessPage() {
  const { text } = await getSiteContent("business");

  return (
    <Reveal className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <p className="font-script text-2xl text-burgundy">{text.eyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">{text.heading}</h1>
      <p className="mt-4 text-sm text-ink/70">{text.body}</p>
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
