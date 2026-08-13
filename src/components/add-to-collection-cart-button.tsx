"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import type { Perfume } from "@/lib/data/perfumes";

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
        <div className="flex items-center border border-taupe/40">
          <button
            type="button"
            className="px-3 py-2 text-sm"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-8 px-2 text-center text-sm">{quantity}</span>
          <button
            type="button"
            className="px-3 py-2 text-sm"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
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
          Added to cart —{" "}
          <a href="/cart" className="text-burgundy underline">
            view cart
          </a>
        </p>
      )}
    </div>
  );
}
