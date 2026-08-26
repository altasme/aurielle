import { notFound } from "next/navigation";
import { getPromotion } from "@/lib/admin/promotions";
import { listProducts, listProductTypes } from "@/lib/admin/products";
import { categoryFromUrlSegment, categoryLabel } from "@/lib/admin/promotion-category";
import { PromotionForm } from "@/components/admin/promotion-form";

export default async function EditProductPromotionPage({
  params,
}: PageProps<"/admin/promotions/[category]/product-promotions/[id]/edit">) {
  const { category: categoryParam, id } = await params;
  const category = categoryFromUrlSegment(categoryParam);
  if (!category) notFound();

  const promotion = await getPromotion(id);
  if (!promotion || promotion.category !== category) notFound();

  const [products, productTypes] = await Promise.all([
    listProducts({ category }),
    category === "atelier_supply" ? listProductTypes("atelier_supply") : Promise.resolve([]),
  ]);

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink/50">{categoryLabel(category)}</p>
      <h1 className="font-serif text-2xl text-ink">Edit Product Promotion</h1>
      <PromotionForm
        category={category}
        categoryUrlSegment={categoryParam}
        promotion={promotion}
        products={products.map((p) => ({ id: p.id, name: p.name, price: p.price, currency: p.currency, productTypeName: p.productTypeName }))}
        productTypes={productTypes}
      />
    </div>
  );
}
