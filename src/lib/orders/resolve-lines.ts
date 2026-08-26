import "server-only";
import { getPerfumeBySlug } from "@/lib/data/perfumes";
import { getSupplyMaterialBySlug } from "@/lib/data/supply-materials";
import type { CartLineInput, PromotionCategory } from "@/lib/promotions/apply";

export type ResolvedLine = CartLineInput & { pricingUnit: string | null; serialNumber: number | null };

export type ResolveLinesResult =
  | { ok: true; lines: ResolvedLine[]; currency: string; category: PromotionCategory }
  | { ok: false; error: string };

// Re-derives every cart line from the authoritative catalogue by slug
// -- never trusts a client-submitted price or name -- shared by the
// checkout page's live quote preview and the real order-creation route
// so both price a cart identically.
export async function resolveCartLines(
  businessLine: "collection" | "atelier_supply",
  items: { slug: string; quantity: number }[],
): Promise<ResolveLinesResult> {
  const category: PromotionCategory = businessLine === "collection" ? "aurielle_collection" : "atelier_supply";
  const lines: ResolvedLine[] = [];
  let currency: string | null = null;

  for (const rawItem of items) {
    const quantity = Math.min(Math.max(Math.floor(Number(rawItem.quantity)), 1), 10000);
    if (!Number.isFinite(quantity)) return { ok: false, error: "Invalid item quantity" };
    const slug = String(rawItem.slug ?? "");

    if (businessLine === "collection") {
      const perfume = await getPerfumeBySlug(slug);
      if (!perfume || perfume.price == null || !perfume.currency) {
        return { ok: false, error: `Unknown or unpriced perfume: ${slug}` };
      }
      currency ??= perfume.currency;
      if (perfume.currency !== currency) return { ok: false, error: "Mixed currencies in one order" };
      lines.push({
        productId: perfume.id,
        productTypeId: null,
        slug: perfume.slug,
        name: perfume.name,
        price: perfume.price,
        quantity,
        pricingUnit: null,
        serialNumber: null,
      });
    } else {
      const material = await getSupplyMaterialBySlug(slug);
      if (!material) return { ok: false, error: `Unknown material: ${slug}` };
      currency ??= material.currency;
      if (material.currency !== currency) return { ok: false, error: "Mixed currencies in one order" };
      lines.push({
        productId: material.id,
        productTypeId: material.productTypeId,
        slug: material.slug,
        name: material.displayName,
        price: material.price,
        quantity,
        pricingUnit: material.pricingUnit,
        serialNumber: material.serialNumber,
      });
    }
  }

  return { ok: true, lines, currency: currency ?? "", category };
}
