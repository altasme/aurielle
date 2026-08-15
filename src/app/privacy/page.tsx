import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Aurielle Paris Atelier",
};

export default function PrivacyPage() {
  return <PolicyPage title="Privacy Policy" />;
}
