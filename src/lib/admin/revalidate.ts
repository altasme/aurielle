import "server-only";
import { revalidatePath } from "next/cache";
import type { ProductCategory } from "@/lib/admin/products";

// Every admin write that can change what a public visitor sees calls
// this: the category's listing page, its product detail page (if
// known), and the homepage (which features Aurielle Collection
// products regardless of which one changed).
export function revalidateProduct(category: ProductCategory, slug?: string): void {
  const listPath = category === "aurielle_collection" ? "/collection" : "/atelier-supply";
  revalidatePath(listPath);
  if (slug) revalidatePath(`${listPath}/${slug}`);
  if (category === "aurielle_collection") revalidatePath("/");
}
