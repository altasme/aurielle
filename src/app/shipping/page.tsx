import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Shipping | Aurielle Paris Atelier",
};

export default function ShippingPage() {
  return <PolicyPage title="Shipping" />;
}
