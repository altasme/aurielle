import Link from "next/link";
import { notFound } from "next/navigation";
import { listDiscountCodes } from "@/lib/admin/discount-codes";
import { categoryFromUrlSegment, categoryLabel } from "@/lib/admin/promotion-category";
import { promotionStatusLabel, promotionStatusClasses } from "@/lib/admin/promotion-status";
import { formatMoney } from "@/lib/format-money";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";

export default async function DiscountCodesPage({ params }: PageProps<"/admin/promotions/[category]/discount-codes">) {
  const { category: categoryParam } = await params;
  const category = categoryFromUrlSegment(categoryParam);
  if (!category) notFound();

  const currency = category === "aurielle_collection" ? "₱" : "USD";
  const codes = await listDiscountCodes(category);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/50">{categoryLabel(category)}</p>
          <h1 className="font-serif text-2xl text-ink">Discount Codes</h1>
        </div>
        <Link
          href={`/admin/promotions/${categoryParam}/discount-codes/new`}
          className="border border-burgundy bg-burgundy px-4 py-2 text-xs uppercase tracking-wide text-ivory hover:bg-burgundy-dark"
        >
          + New Code
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto border border-taupe/20 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Campaign</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Uses</th>
              <th className="px-4 py-3">Min Spend</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => {
              const status = promotionStatusLabel(code);
              return (
                <tr key={code.id} className="border-b border-taupe/10 last:border-0 align-top">
                  <td className="px-4 py-3 text-ink">{code.name}</td>
                  <td className="px-4 py-3 font-mono text-ink">{code.code}</td>
                  <td className="px-4 py-3 text-ink/70">
                    {code.discountType === "percent" ? `${code.discountValue}%` : formatMoney(currency, code.discountValue)}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {new Date(code.startsAt).toLocaleDateString()} &ndash; {new Date(code.endsAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {code.usedCount}
                    {code.maxUses !== null ? ` / ${code.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{code.minSpend !== null ? formatMoney(currency, code.minSpend) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-sm px-2 py-0.5 text-[10px] uppercase tracking-wide ${promotionStatusClasses(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1.5">
                      <Link
                        href={`/admin/promotions/${categoryParam}/discount-codes/${code.id}/edit`}
                        className="text-xs uppercase tracking-wide text-burgundy underline"
                      >
                        Edit
                      </Link>
                      <DeleteConfirmButton
                        endpoint={`/api/admin/discount-codes/${code.id}`}
                        title="Delete Discount Code?"
                        description={`Are you sure you want to delete "${code.name}" (${code.code})? This cannot be undone.`}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
            {codes.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink/50">
                  No discount codes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
