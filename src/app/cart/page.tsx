import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cart | Aurielle Paris Atelier",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-10">
      <h1 className="font-serif text-4xl text-ink">Your Cart</h1>
      <p className="mt-4 text-sm text-ink/60">
        Your cart is empty. Aurielle Collection and Atelier Supply items are
        kept in two separate carts and checkouts — see the Collection or
        Atelier Supply pages to start browsing.
      </p>
      <p className="mt-10 text-xs text-ink/40">
        Cart state, line items and checkout are not yet wired up in this
        build.
      </p>
    </div>
  );
}
