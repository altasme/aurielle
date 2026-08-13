import type { Metadata } from "next";
import { BusinessInquiryForm } from "@/components/business-inquiry-form";

export const metadata: Metadata = {
  title: "Business & Wholesale | Aurielle Paris Atelier",
};

export default function BusinessPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <h1 className="font-serif text-4xl text-ink">For Your Business</h1>
      <p className="mt-4 text-sm text-ink/70">
        Looking for fragrance materials for your own creations, products or
        business?
      </p>

      <BusinessInquiryForm />
    </div>
  );
}
