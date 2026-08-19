import Link from "next/link";
import { notFound } from "next/navigation";
import { listProductTypes, listMoods, type ProductCategory } from "@/lib/admin/products";
import { ProductForm } from "@/components/admin/product-form";
import { AtelierTypePicker } from "@/components/admin/atelier-type-picker";

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
    description: "Raw materials and supplies, organized into Fragrances, Bottles, Pouches, Boxes, Labels and more.",
  },
];

export default async function NewProductPage({
  searchParams,
}: PageProps<"/admin/products/new">) {
  const params = await searchParams;
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const productTypeParam = Array.isArray(params.productType) ? params.productType[0] : params.productType;

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

  if (categoryParam === "atelier_supply") {
    const types = await listProductTypes("atelier_supply");

    if (!productTypeParam) {
      return (
        <div>
          <h1 className="font-serif text-2xl text-ink">Add Product &mdash; Atelier Supply</h1>
          <AtelierTypePicker types={types} />
        </div>
      );
    }

    const productType = types.find((t) => t.id === productTypeParam);
    if (!productType) notFound();

    return (
      <div>
        <h1 className="font-serif text-2xl text-ink">Add Product &mdash; Atelier Supply</h1>
        <p className="mt-1 text-sm text-ink/60">Type: {productType.name}</p>
        <ProductForm
          category="atelier_supply"
          productTypeId={productType.id}
          productTypeName={productType.name}
        />
      </div>
    );
  }

  const moodSuggestions = await listMoods();

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Add Product &mdash; Aurielle Collection</h1>
      <ProductForm category="aurielle_collection" moodSuggestions={moodSuggestions} />
    </div>
  );
}
