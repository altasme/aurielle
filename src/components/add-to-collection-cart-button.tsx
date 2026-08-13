"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import type { Perfume } from "@/lib/data/perfumes";
import { QuantityStepper } from "./quantity-stepper";

export function AddToCollectionCartButton({
  perfume,
}: {
  perfume: Perfume & { price: number; currency: string };
}) {
  const { addCollectionItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wide text-ink/60">Qty</span>
        <QuantityStepper
          quantity={quantity}
          onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          onIncrease={() => setQuantity((q) => q + 1)}
        />
      </div>

      <button
        type="button"
        onClick={() => {
          addCollectionItem(
            {
              slug: perfume.slug,
              name: perfume.name,
              price: perfume.price,
              currency: perfume.currency,
            },
            quantity,
          );
          setAdded(true);
        }}
        className="w-full border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark"
      >
        Add to Cart
      </button>

      {added && (
        <p className="text-center text-xs text-ink/60">
          Added to cart.{" "}
          <a href="/cart" className="text-burgundy underline">
            View cart
          </a>
        </p>
      )}
    </div>
  );
}
