import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Terms & Conditions | Aurielle Paris Atelier",
};

export default function TermsPage() {
  return <PolicyPage title="Terms & Conditions" />;
}
