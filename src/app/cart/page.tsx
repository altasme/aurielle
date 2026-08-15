"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { CartSection } from "@/components/cart-section";
import { formatMoney } from "@/lib/format-money";

export default function CartPage() {
  const {
    state,
    updateCollectionQuantity,
    updateSupplyQuantity,
    removeCollectionItem,
    removeSupplyItem,
  } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
      <h1 className="text-center font-serif text-4xl text-ink">Your Cart</h1>
      <p className="mt-3 text-center text-sm text-ink/60">
        Aurielle Collection and Atelier Supply are kept in two separate
        carts and checkouts. They&rsquo;re never combined into one order.
      </p>

      <CartSection
        heading="Aurielle Collection"
        checkoutHref="/checkout/collection"
        emptyMessage={
          <>
            Your collection cart is empty.{" "}
            <Link href="/collection" className="text-burgundy underline">
              Browse perfumes
            </Link>
            .
          </>
        }
        items={state.collection.map((item) => ({
          slug: item.slug,
          title: item.name,
          unitPriceLabel: `${formatMoney(item.currency, item.price)} each`,
          price: item.price,
          currency: item.currency,
          quantity: item.quantity,
        }))}
        onIncrease={(slug) => {
          const item = state.collection.find((i) => i.slug === slug);
          if (item) updateCollectionQuantity(slug, item.quantity + 1);
        }}
        onDecrease={(slug) => {
          const item = state.collection.find((i) => i.slug === slug);
          if (item) updateCollectionQuantity(slug, item.quantity - 1);
        }}
        onRemove={removeCollectionItem}
      />

      <CartSection
        heading="Atelier Supply"
        checkoutHref="/checkout/atelier-supply"
        emptyMessage={
          <>
            Your supply cart is empty.{" "}
            <Link href="/atelier-supply" className="text-burgundy underline">
              Browse materials
            </Link>
            .
          </>
        }
        items={state.supply.map((item) => ({
          slug: item.slug,
          title: item.displayName,
          unitPriceLabel: `${formatMoney(item.currency, item.price)} / ${item.pricingUnit}`,
          price: item.price,
          currency: item.currency,
          quantity: item.quantity,
          unit: item.pricingUnit,
        }))}
        onIncrease={(slug) => {
          const item = state.supply.find((i) => i.slug === slug);
          if (item) updateSupplyQuantity(slug, item.quantity + 1);
        }}
        onDecrease={(slug) => {
          const item = state.supply.find((i) => i.slug === slug);
          if (item) updateSupplyQuantity(slug, item.quantity - 1);
        }}
        onRemove={removeSupplyItem}
      />

      <p className="mt-16 text-center text-xs text-ink/40">
        Looking up an existing order?{" "}
        <Link href="/order-lookup" className="text-burgundy underline">
          Order lookup
        </Link>
      </p>
    </div>
  );
}
