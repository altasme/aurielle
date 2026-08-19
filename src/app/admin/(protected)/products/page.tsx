import Link from "next/link";
import Image from "next/image";
import { listProducts, listProductTypes, type ProductCategory } from "@/lib/admin/products";
import { formatMoney } from "@/lib/format-money";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

const CATEGORY_TABS: { value: ProductCategory; label: string }[] = [
  { value: "aurielle_collection", label: "Aurielle Collection" },
  { value: "atelier_supply", label: "Atelier Supply" },
];

function isCategory(value: string | undefined): value is ProductCategory {
  return value === "aurielle_collection" || value === "atelier_supply";
}

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const params = await searchParams;
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const category: ProductCategory = isCategory(categoryParam) ? categoryParam : "aurielle_collection";
  const searchParam = Array.isArray(params.search) ? params.search[0] : params.search;
  const search = searchParam ?? "";
  const productTypeParam = Array.isArray(params.productType) ? params.productType[0] : params.productType;

  const productTypes = category === "atelier_supply" ? await listProductTypes("atelier_supply") : [];
  const productTypeId = category === "atelier_supply" && productTypes.some((t) => t.id === productTypeParam)
    ? productTypeParam
    : undefined;

  const products = await listProducts({ category, search: search || undefined, productTypeId });

  const addProductHref =
    category === "atelier_supply" && productTypeId
      ? `/admin/products/new?category=atelier_supply&productType=${productTypeId}`
      : `/admin/products/new?category=${category}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-ink">Product &amp; Pricing</h1>
        <Link
          href={addProductHref}
          className="border border-burgundy bg-burgundy px-4 py-2 text-xs uppercase tracking-wide text-ivory hover:bg-burgundy-dark"
        >
          + Add Product
        </Link>
      </div>

      <div className="mt-6 flex gap-2 border-b border-taupe/20">
        {CATEGORY_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/products?category=${tab.value}`}
            className={`border-b-2 px-4 py-2 text-sm transition-colors ${
              category === tab.value
                ? "border-burgundy text-burgundy"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {category === "atelier_supply" && productTypes.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/admin/products?category=atelier_supply"
            className={`border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
              !productTypeId
                ? "border-burgundy bg-burgundy text-ivory"
                : "border-taupe/30 text-ink/60 hover:border-burgundy hover:text-burgundy"
            }`}
          >
            All
          </Link>
          {productTypes.map((type) => (
            <Link
              key={type.id}
              href={`/admin/products?category=atelier_supply&productType=${type.id}`}
              className={`border px-3 py-1.5 text-xs uppercase tracking-wide transition-colors ${
                productTypeId === type.id
                  ? "border-burgundy bg-burgundy text-ivory"
                  : "border-taupe/30 text-ink/60 hover:border-burgundy hover:text-burgundy"
              }`}
            >
              {type.name}
            </Link>
          ))}
        </div>
      )}

      <form method="get" className="mt-6 flex gap-3">
        <input type="hidden" name="category" value={category} />
        {productTypeId && <input type="hidden" name="productType" value={productTypeId} />}
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search products..."
          className="w-full max-w-sm rounded-sm border border-taupe/40 bg-white px-4 py-2 text-sm outline-none focus:border-burgundy"
        />
        <button type="submit" className="border border-taupe/40 px-4 py-2 text-sm text-ink/70">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto border border-taupe/20 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              {category === "atelier_supply" && <th className="px-4 py-3">Type</th>}
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-taupe/10 last:border-0">
                <td className="px-4 py-3">
                  {product.primaryImageUrl ? (
                    <Image
                      src={product.primaryImageUrl}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-sm object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-beige text-[10px] text-ink/40">
                      No image
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-ink">{product.name}</td>
                {category === "atelier_supply" && (
                  <td className="px-4 py-3 text-ink/70">{product.productTypeName ?? "—"}</td>
                )}
                <td className="px-4 py-3 text-ink/70">{formatMoney(product.currency, product.price)}</td>
                <td className="px-4 py-3 text-ink/70">{product.size ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-sm px-2 py-0.5 text-xs uppercase tracking-wide ${
                      product.status === "active" ? "bg-green-100 text-green-800" : "bg-beige text-ink/60"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-xs uppercase tracking-wide text-burgundy underline"
                    >
                      Edit
                    </Link>
                    <DeleteProductButton id={product.id} name={product.name} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={category === "atelier_supply" ? 7 : 6}
                  className="px-4 py-10 text-center text-sm text-ink/50"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
