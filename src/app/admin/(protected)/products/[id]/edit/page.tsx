import { notFound } from "next/navigation";
import { getProduct, listMoods } from "@/lib/admin/products";
import { ProductForm } from "@/components/admin/product-form";
import { ProductImageManager } from "@/components/admin/product-image-manager";

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const moodSuggestions = product.category === "aurielle_collection" ? await listMoods() : [];

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Edit Product</h1>
      <p className="mt-1 text-sm text-ink/60">{product.name}</p>

      <div className="mt-8 max-w-2xl border border-taupe/20 bg-white p-6">
        <h2 className="font-serif text-lg text-ink">Product Images</h2>
        <p className="mt-1 text-xs text-ink/50">
          Square images work best (1:1 aspect ratio), JPG, PNG or WebP, at least 1000&times;1000px.
          The first image uploaded becomes the primary image shown on the public site until you
          set a different one.
        </p>
        <div className="mt-4">
          <ProductImageManager productId={product.id} initialImages={product.images} />
        </div>
      </div>

      <ProductForm category={product.category} product={product} moodSuggestions={moodSuggestions} />
    </div>
  );
}
