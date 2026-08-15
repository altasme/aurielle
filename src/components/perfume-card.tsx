"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Perfume } from "@/lib/data/perfumes";
import { formatMoney } from "@/lib/format-money";
import { useCart } from "@/lib/cart/cart-context";

export function PerfumeCard({ perfume }: { perfume: Perfume }) {
  const { addCollectionItem } = useCart();
  const [added, setAdded] = useState(false);
  const canAddToCart = perfume.price != null && !!perfume.currency;

  return (
    <div className="group flex flex-col">
      <Link href={`/collection/${perfume.slug}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden border border-taupe/30 bg-beige/40 transition-colors group-hover:border-burgundy">
          <Image
            src={`/images/perfumes/cards/${perfume.slug}.jpg`}
            alt={perfume.name}
            fill
            sizes="(min-width: 1024px) 25vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <p className="mt-4 text-center font-serif text-lg text-ink">
          {perfume.name}
        </p>
        {perfume.scentProfile.length > 0 && (
          <p className="text-center text-xs text-ink/50">
            {perfume.scentProfile.join(" · ")}
          </p>
        )}
        {perfume.price != null && perfume.currency && (
          <p className="mt-1 text-center text-sm text-ink">
            {formatMoney(perfume.currency, perfume.price)}
          </p>
        )}
      </Link>
      {canAddToCart ? (
        <button
          type="button"
          onClick={() => {
            addCollectionItem(
              { slug: perfume.slug, name: perfume.name, price: perfume.price!, currency: perfume.currency! },
              1,
            );
            setAdded(true);
            setTimeout(() => setAdded(false), 1500);
          }}
          className="mt-1 text-center text-xs uppercase tracking-wide text-burgundy hover:text-burgundy-dark"
        >
          {added ? "Added to Cart" : "Add to Cart"}
        </button>
      ) : (
        <Link
          href={`/collection/${perfume.slug}`}
          className="mt-1 text-center text-xs uppercase tracking-wide text-ink/40"
        >
          Coming Soon
        </Link>
      )}
    </div>
  );
}
