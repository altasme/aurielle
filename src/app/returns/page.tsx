import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Returns | Aurielle Paris Atelier",
};

export default function ReturnsPage() {
  return <PolicyPage title="Returns" />;
}
