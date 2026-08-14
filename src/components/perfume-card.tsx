import Link from "next/link";
import Image from "next/image";
import type { Perfume } from "@/lib/data/perfumes";

export function PerfumeCard({ perfume }: { perfume: Perfume }) {
  return (
    <Link href={`/collection/${perfume.slug}`} className="group flex flex-col">
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
      <p className="mt-1 text-center text-xs uppercase tracking-wide text-burgundy">
        View Fragrance
      </p>
    </Link>
  );
}
