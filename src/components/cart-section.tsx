"use client";

import type { ReactNode } from "react";
import { QuantityStepper } from "./quantity-stepper";
import { ButtonLink } from "./button-link";
import { formatMoney } from "@/lib/format-money";

type CartSectionItem = {
  slug: string;
  title: string;
  unitPriceLabel: string;
  price: number;
  currency: string;
  quantity: number;
  unit?: string;
};

export function CartSection({
  heading,
  items,
  emptyMessage,
  checkoutHref,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  heading: string;
  items: CartSectionItem[];
  emptyMessage: ReactNode;
  checkoutHref: string;
  onIncrease: (slug: string) => void;
  onDecrease: (slug: string) => void;
  onRemove: (slug: string) => void;
}) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currency = items[0]?.currency ?? "";

  return (
    <section className="mt-16">
      <h2 className="font-serif text-2xl text-ink">{heading}</h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">{emptyMessage}</p>
      ) : (
        <>
          <div className="mt-4 divide-y divide-taupe/15 border-y border-taupe/15">
            {items.map((item) => (
              <div
                key={item.slug}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="font-serif text-lg text-ink">{item.title}</p>
                  <p className="text-xs text-ink/50">{item.unitPriceLabel}</p>
                </div>
                <div className="flex items-center gap-4">
                  <QuantityStepper
                    size="sm"
                    quantity={item.quantity}
                    unit={item.unit}
                    onDecrease={() => onDecrease(item.slug)}
                    onIncrease={() => onIncrease(item.slug)}
                  />
                  <span className="w-24 text-right text-sm text-burgundy">
                    {formatMoney(item.currency, item.price * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(item.slug)}
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
              Subtotal: {formatMoney(currency, subtotal)}
            </span>
            <ButtonLink href={checkoutHref}>Checkout</ButtonLink>
          </div>
        </>
      )}
    </section>
  );
}
