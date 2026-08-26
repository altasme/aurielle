import { notFound } from "next/navigation";
import { categoryFromUrlSegment, categoryLabel } from "@/lib/admin/promotion-category";
import { DiscountCodeForm } from "@/components/admin/discount-code-form";

export default async function NewDiscountCodePage({ params }: PageProps<"/admin/promotions/[category]/discount-codes/new">) {
  const { category: categoryParam } = await params;
  const category = categoryFromUrlSegment(categoryParam);
  if (!category) notFound();

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink/50">{categoryLabel(category)}</p>
      <h1 className="font-serif text-2xl text-ink">New Discount Code</h1>
      <DiscountCodeForm category={category} categoryUrlSegment={categoryParam} />
    </div>
  );
}
