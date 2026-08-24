import type { Metadata } from "next";
import { AffiliateForm } from "@/components/affiliate-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Be an Affiliate | Aurielle Paris Atelier",
};

export default function AffiliatePage() {
  return (
    <Reveal className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <h1 className="font-serif text-4xl text-ink">Be an Affiliate</h1>
      <p className="mt-4 text-sm text-ink/70">
        Share Aurielle with your audience. Tell us a bit about yourself and where you sell or post,
        and we&rsquo;ll follow up with the details.
      </p>

      <AffiliateForm />
    </Reveal>
  );
}
