import type { Metadata } from "next";
import { OrderLookupForm } from "@/components/order-lookup-form";

export const metadata: Metadata = {
  title: "Order Lookup | Aurielle Paris Atelier",
};

export default function OrderLookupPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center lg:px-10">
      <h1 className="font-serif text-4xl text-ink">Order Lookup</h1>
      <p className="mt-4 text-sm text-ink/60">
        Since there are no customer accounts, look up your order status here
        using your order number and email.
      </p>

      <OrderLookupForm />
    </div>
  );
}
