"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";

export default function CartPage() {
  const {
    state,
    updateCollectionQuantity,
    updateSupplyQuantity,
    removeCollectionItem,
    removeSupplyItem,
  } = useCart();

  const collectionSubtotal = state.collection.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const supplySubtotal = state.supply.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
      <h1 className="text-center font-serif text-4xl text-ink">Your Cart</h1>
      <p className="mt-3 text-center text-sm text-ink/60">
        Aurielle Collection and Atelier Supply are kept in two separate
        carts and checkouts — they&rsquo;re never combined into one order.
      </p>

      {/* Collection cart */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">Aurielle Collection</h2>
        {state.collection.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">
            Your collection cart is empty.{" "}
            <Link href="/collection" className="text-burgundy underline">
              Browse perfumes
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="mt-4 divide-y divide-taupe/15 border-y border-taupe/15">
              {state.collection.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-serif text-lg text-ink">{item.name}</p>
                    <p className="text-xs text-ink/50">
                      {item.currency} {item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-taupe/40">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm"
                        onClick={() =>
                          updateCollectionQuantity(item.slug, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-8 px-2 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm"
                        onClick={() =>
                          updateCollectionQuantity(item.slug, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="w-24 text-right text-sm text-burgundy">
                      {item.currency} {(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCollectionItem(item.slug)}
                      className="text-xs text-ink/40 underline hover:text-burgundy"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-ink/70">
                Subtotal: {state.collection[0]?.currency} {collectionSubtotal.toFixed(2)}
              </span>
              <Link
                href="/checkout/collection"
                className="border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </section>

      {/* Supply cart */}
      <section className="mt-16">
        <h2 className="font-serif text-2xl text-ink">Atelier Supply</h2>
        {state.supply.length === 0 ? (
          <p className="mt-4 text-sm text-ink/50">
            Your supply cart is empty.{" "}
            <Link href="/atelier-supply" className="text-burgundy underline">
              Browse materials
            </Link>
            .
          </p>
        ) : (
          <>
            <div className="mt-4 divide-y divide-taupe/15 border-y border-taupe/15">
              {state.supply.map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <p className="font-serif text-lg text-ink">
                      {item.displayName}
                    </p>
                    <p className="text-xs text-ink/50">
                      {item.currency} {item.price.toFixed(2)} / {item.pricingUnit}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-taupe/40">
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm"
                        onClick={() =>
                          updateSupplyQuantity(item.slug, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="min-w-8 px-2 text-center text-sm">
                        {item.quantity} {item.pricingUnit}
                      </span>
                      <button
                        type="button"
                        className="px-3 py-1.5 text-sm"
                        onClick={() =>
                          updateSupplyQuantity(item.slug, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="w-24 text-right text-sm text-burgundy">
                      {item.currency} {(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSupplyItem(item.slug)}
                      className="text-xs text-ink/40 underline hover:text-burgundy"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-ink/70">
                Subtotal: {state.supply[0]?.currency} {supplySubtotal.toFixed(2)}
              </span>
              <Link
                href="/checkout/atelier-supply"
                className="border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark"
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </section>

      <p className="mt-16 text-center text-xs text-ink/40">
        Looking up an existing order?{" "}
        <Link href="/order-lookup" className="text-burgundy underline">
          Order lookup
        </Link>
      </p>
    </div>
  );
}
