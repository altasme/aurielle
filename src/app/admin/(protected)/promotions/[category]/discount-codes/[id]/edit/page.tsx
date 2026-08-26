import { notFound } from "next/navigation";
import { getDiscountCode } from "@/lib/admin/discount-codes";
import { categoryFromUrlSegment, categoryLabel } from "@/lib/admin/promotion-category";
import { DiscountCodeForm } from "@/components/admin/discount-code-form";

export default async function EditDiscountCodePage({
  params,
}: PageProps<"/admin/promotions/[category]/discount-codes/[id]/edit">) {
  const { category: categoryParam, id } = await params;
  const category = categoryFromUrlSegment(categoryParam);
  if (!category) notFound();

  const discountCode = await getDiscountCode(id);
  if (!discountCode || discountCode.category !== category) notFound();

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink/50">{categoryLabel(category)}</p>
      <h1 className="font-serif text-2xl text-ink">Edit Discount Code</h1>
      <DiscountCodeForm category={category} categoryUrlSegment={categoryParam} discountCode={discountCode} />
    </div>
  );
}
