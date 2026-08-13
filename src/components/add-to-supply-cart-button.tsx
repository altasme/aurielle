"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/cart-context";
import type { SupplyMaterial } from "@/lib/data/supply-materials";
import { QuantityStepper } from "./quantity-stepper";

export function AddToSupplyCartButton({ material }: { material: SupplyMaterial }) {
  const { addSupplyItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const subtotal = material.price * quantity;

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase tracking-wide text-ink/60">
          Qty ({material.pricingUnit})
        </span>
        <QuantityStepper
          quantity={quantity}
          onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
          onIncrease={() => setQuantity((q) => q + 1)}
        />
      </div>

      <p className="text-xs text-ink/50">
        Subtotal: {material.currency} {subtotal.toFixed(2)}
      </p>

      <button
        type="button"
        onClick={() => {
          addSupplyItem(
            {
              slug: material.slug,
              serialNumber: material.serialNumber,
              displayName: material.displayName,
              price: material.price,
              currency: material.currency,
              pricingUnit: material.pricingUnit,
            },
            quantity,
          );
          setAdded(true);
        }}
        className="w-full border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark"
      >
        Request / Order
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
