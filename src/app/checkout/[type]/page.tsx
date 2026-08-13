import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";

export function generateStaticParams() {
  return [{ type: "collection" }, { type: "atelier-supply" }];
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (type !== "collection" && type !== "atelier-supply") notFound();

  return (
    <CheckoutForm businessLine={type === "collection" ? "collection" : "atelier_supply"} />
  );
}
