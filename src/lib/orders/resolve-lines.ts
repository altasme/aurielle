import "server-only";
import { getPerfumeBySlug } from "@/lib/data/perfumes";
import { getSupplyMaterialBySlug } from "@/lib/data/supply-materials";
import type { CartLineInput, PromotionCategory } from "@/lib/promotions/apply";

export type ResolvedLine = CartLineInput & { pricingUnit: string | null; serialNumber: number | null };

export type ResolveLinesResult =
  | { ok: true; lines: ResolvedLine[]; currency: string; category: PromotionCategory }
  | { ok: false; error: string };

type ResolvedItem =
  | { ok: true; line: ResolvedLine; currency: string }
  | { ok: false; error: string };

async function resolveItem(
  businessLine: "collection" | "atelier_supply",
  rawItem: { slug: string; quantity: number },
): Promise<ResolvedItem> {
  const quantity = Math.min(Math.max(Math.floor(Number(rawItem.quantity)), 1), 10000);
  if (!Number.isFinite(quantity)) return { ok: false, error: "Invalid item quantity" };
  const slug = String(rawItem.slug ?? "");

  if (businessLine === "collection") {
    const perfume = await getPerfumeBySlug(slug);
    if (!perfume || perfume.price == null || !perfume.currency) {
      return { ok: false, error: `Unknown or unpriced perfume: ${slug}` };
    }
    return {
      ok: true,
      currency: perfume.currency,
      line: {
        productId: perfume.id,
        productTypeId: null,
        slug: perfume.slug,
        name: perfume.name,
        price: perfume.price,
        quantity,
        pricingUnit: null,
        serialNumber: null,
      },
    };
  }

  const material = await getSupplyMaterialBySlug(slug);
  if (!material) return { ok: false, error: `Unknown material: ${slug}` };
  return {
    ok: true,
    currency: material.currency,
    line: {
      productId: material.id,
      productTypeId: material.productTypeId,
      slug: material.slug,
      name: material.displayName,
      price: material.price,
      quantity,
      pricingUnit: material.pricingUnit,
      serialNumber: material.serialNumber,
    },
  };
}

// Re-derives every cart line from the authoritative catalogue by slug
// -- never trusts a client-submitted price or name -- shared by the
// checkout page's live quote preview and the real order-creation route
// so both price a cart identically. Every line is looked up in
// parallel, not one Supabase round-trip at a time in sequence: a
// multi-item Atelier Supply cart (a bulk/B2B catalogue -- customers
// plausibly order many distinct materials in one order) could
// otherwise turn one checkout request into dozens of sequential
// round-trips, adding real wall-clock time proportional to cart size.
export async function resolveCartLines(
  businessLine: "collection" | "atelier_supply",
  items: { slug: string; quantity: number }[],
): Promise<ResolveLinesResult> {
  const category: PromotionCategory = businessLine === "collection" ? "aurielle_collection" : "atelier_supply";
  const resolved = await Promise.all(items.map((rawItem) => resolveItem(businessLine, rawItem)));

  const firstError = resolved.find((r): r is { ok: false; error: string } => !r.ok);
  if (firstError) return { ok: false, error: firstError.error };

  const okResults = resolved as { ok: true; line: ResolvedLine; currency: string }[];
  const currency = okResults[0]?.currency ?? "";
  if (okResults.some((r) => r.currency !== currency)) {
    return { ok: false, error: "Mixed currencies in one order" };
  }

  return { ok: true, lines: okResults.map((r) => r.line), currency, category };
}
