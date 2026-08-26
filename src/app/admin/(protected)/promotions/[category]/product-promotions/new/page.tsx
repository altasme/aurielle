import { notFound } from "next/navigation";
import { listProducts, listProductTypes } from "@/lib/admin/products";
import { categoryFromUrlSegment, categoryLabel } from "@/lib/admin/promotion-category";
import { PromotionForm } from "@/components/admin/promotion-form";

export default async function NewProductPromotionPage({
  params,
}: PageProps<"/admin/promotions/[category]/product-promotions/new">) {
  const { category: categoryParam } = await params;
  const category = categoryFromUrlSegment(categoryParam);
  if (!category) notFound();

  const [products, productTypes] = await Promise.all([
    listProducts({ category }),
    category === "atelier_supply" ? listProductTypes("atelier_supply") : Promise.resolve([]),
  ]);

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink/50">{categoryLabel(category)}</p>
      <h1 className="font-serif text-2xl text-ink">New Product Promotion</h1>
      <PromotionForm
        category={category}
        categoryUrlSegment={categoryParam}
        products={products.map((p) => ({ id: p.id, name: p.name, price: p.price, currency: p.currency, productTypeName: p.productTypeName }))}
        productTypes={productTypes}
      />
    </div>
  );
}
