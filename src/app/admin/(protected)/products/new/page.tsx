import Link from "next/link";
import { listProductTypes, type ProductCategory } from "@/lib/admin/products";
import { ProductForm } from "@/components/admin/product-form";

function isCategory(value: string | undefined): value is ProductCategory {
  return value === "aurielle_collection" || value === "atelier_supply";
}

const CATEGORY_CARDS: { value: ProductCategory; label: string; description: string }[] = [
  {
    value: "aurielle_collection",
    label: "Aurielle Collection",
    description: "Perfumes and fragrances, priced in ₱.",
  },
  {
    value: "atelier_supply",
    label: "Atelier Supply",
    description: "Raw materials and supplies, with admin-defined product types.",
  },
];

export default async function NewProductPage({
  searchParams,
}: PageProps<"/admin/products/new">) {
  const params = await searchParams;
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;

  if (!isCategory(categoryParam)) {
    return (
      <div>
        <h1 className="font-serif text-2xl text-ink">Add Product</h1>
        <p className="mt-2 text-sm text-ink/60">Choose a category to continue.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {CATEGORY_CARDS.map((card) => (
            <Link
              key={card.value}
              href={`/admin/products/new?category=${card.value}`}
              className="border border-taupe/20 bg-white p-6 transition-colors hover:border-burgundy"
            >
              <h2 className="font-serif text-lg text-ink">{card.label}</h2>
              <p className="mt-2 text-sm text-ink/60">{card.description}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const productTypes =
    categoryParam === "atelier_supply" ? await listProductTypes("atelier_supply") : [];

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">
        Add Product &mdash;{" "}
        {categoryParam === "aurielle_collection" ? "Aurielle Collection" : "Atelier Supply"}
      </h1>
      <ProductForm category={categoryParam} productTypes={productTypes} />
    </div>
  );
}
