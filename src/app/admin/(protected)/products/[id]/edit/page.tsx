import { notFound } from "next/navigation";
import { getProduct, listProductTypes } from "@/lib/admin/products";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImageManager } from "@/components/admin/product-image-manager";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const productTypes =
    product.category === "atelier_supply" ? await listProductTypes("atelier_supply") : [];

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Edit Product</h1>
      <p className="mt-1 text-sm text-ink/60">{product.name}</p>

      <ProductForm category={product.category} product={product} productTypes={productTypes} />

      <div className="mt-10 max-w-2xl border-t border-taupe/20 pt-8">
        <h2 className="text-xs uppercase tracking-wide text-ink/60">Product Images</h2>
        <div className="mt-4">
          <ProductImageManager productId={product.id} initialImages={product.images} />
        </div>
      </div>
    </div>
  );
}
