import Link from "next/link";
import { notFound } from "next/navigation";
import { listPromotions } from "@/lib/admin/promotions";
import { categoryFromUrlSegment, categoryLabel } from "@/lib/admin/promotion-category";
import { promotionStatusLabel, promotionStatusClasses } from "@/lib/admin/promotion-status";
import { formatMoney } from "@/lib/format-money";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";

export default async function ProductPromotionsPage({ params }: PageProps<"/admin/promotions/[category]/product-promotions">) {
  const { category: categoryParam } = await params;
  const category = categoryFromUrlSegment(categoryParam);
  if (!category) notFound();

  const currency = category === "aurielle_collection" ? "₱" : "USD";
  const promotions = await listPromotions(category);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/50">{categoryLabel(category)}</p>
          <h1 className="font-serif text-2xl text-ink">Product Promotions</h1>
        </div>
        <Link
          href={`/admin/promotions/${categoryParam}/product-promotions/new`}
          className="border border-burgundy bg-burgundy px-4 py-2 text-xs uppercase tracking-wide text-ivory hover:bg-burgundy-dark"
        >
          + New Promotion
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-taupe/20 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Applies To</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Uses</th>
              <th className="px-4 py-3">Min Spend</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => {
              const status = promotionStatusLabel(promo);
              return (
                <tr key={promo.id} className="border-b border-taupe/10 last:border-0 align-top">
                  <td className="px-4 py-3 text-ink">{promo.name}</td>
                  <td className="px-4 py-3 text-ink/70">
                    {promo.discountType === "percent" ? `${promo.discountValue}%` : formatMoney(currency, promo.discountValue)}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {promo.productCount} item{promo.productCount === 1 ? "" : "s"}
                    {category === "atelier_supply" && promo.productTypeCount > 0 && (
                      <>, {promo.productTypeCount} group{promo.productTypeCount === 1 ? "" : "s"}</>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {new Date(promo.startsAt).toLocaleDateString()} &ndash; {new Date(promo.endsAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {promo.usedCount}
                    {promo.maxUses !== null ? ` / ${promo.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{promo.minSpend !== null ? formatMoney(currency, promo.minSpend) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wide ${promotionStatusClasses(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <Link
                        href={`/admin/promotions/${categoryParam}/product-promotions/${promo.id}/edit`}
                        className="text-xs uppercase tracking-wide text-burgundy underline"
                      >
                        Edit
                      </Link>
                      <DeleteConfirmButton
                        endpoint={`/api/admin/promotions/${promo.id}`}
                        title="Delete Promotion?"
                        description={`Are you sure you want to delete "${promo.name}"? This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {promotions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink/50">
                  No product promotions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
