import type { PromotionCategory } from "@/lib/admin/promotions";

// URL segments match the existing /checkout/[type] convention
// ("collection" | "atelier-supply"), kept separate from the DB's
// category values (aurielle_collection | atelier_supply) so routes
// read naturally.
export type CategoryUrlSegment = "collection" | "atelier-supply";

export function categoryFromUrlSegment(segment: string): PromotionCategory | null {
  if (segment === "collection") return "aurielle_collection";
  if (segment === "atelier-supply") return "atelier_supply";
  return null;
}

export function categoryToUrlSegment(category: PromotionCategory): CategoryUrlSegment {
  return category === "aurielle_collection" ? "collection" : "atelier-supply";
}

export function categoryLabel(category: PromotionCategory): string {
  return category === "aurielle_collection" ? "Aurielle Collection" : "Atelier Supply";
}
