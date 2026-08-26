import Link from "next/link";
import { listPromotions } from "@/lib/admin/promotions";
import { listDiscountCodes } from "@/lib/admin/discount-codes";

const SECTIONS = [
  {
    title: "Aurielle Collection",
    urlCategory: "collection" as const,
    dbCategory: "aurielle_collection" as const,
  },
  {
    title: "Atelier Supply",
    urlCategory: "atelier-supply" as const,
    dbCategory: "atelier_supply" as const,
  },
];

export default async function AdminPromotionsPage() {
  const counts = await Promise.all(
    SECTIONS.map(async (section) => ({
      promotions: (await listPromotions(section.dbCategory)).length,
      codes: (await listDiscountCodes(section.dbCategory)).length,
    })),
  );

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Promotion</h1>
      <p className="mt-1 text-sm text-ink/60">
        Product promotions and discount codes for Aurielle Collection and Atelier Supply. A discount code always
        overrides any auto-applied promotions for that order -- the two never stack.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section, i) => (
          <div key={section.urlCategory} className="border border-taupe/20 bg-white p-6">
            <h2 className="font-serif text-lg text-ink">{section.title}</h2>
            <div className="mt-4 space-y-3">
              <Link
                href={`/admin/promotions/${section.urlCategory}/product-promotions`}
                className="flex items-center justify-between border border-taupe/20 px-4 py-3 text-sm transition-colors hover:border-burgundy"
              >
                <span>Product Promotions</span>
                <span className="text-xs text-ink/50">{counts[i].promotions}</span>
              </Link>
              <Link
                href={`/admin/promotions/${section.urlCategory}/discount-codes`}
                className="flex items-center justify-between border border-taupe/20 px-4 py-3 text-sm transition-colors hover:border-burgundy"
              >
                <span>Discount Codes</span>
                <span className="text-xs text-ink/50">{counts[i].codes}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
