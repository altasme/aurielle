import type { Metadata } from "next";
import { AffiliateForm } from "@/components/affiliate-form";
import { Reveal } from "@/components/reveal";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Be an Affiliate | Aurielle Paris Atelier",
};

export default async function AffiliatePage() {
  const { text } = await getSiteContent("affiliate");

  return (
    <Reveal className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <p className="font-script text-2xl text-burgundy">{text.eyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">{text.heading}</h1>
      <p className="mt-4 text-sm text-ink/70">{text.body}</p>

      <AffiliateForm />
    </Reveal>
  );
}
