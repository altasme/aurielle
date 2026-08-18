// Split out from src/lib/data/supply-materials.ts (which is
// server-only, since it now reads from Supabase) so the client-side
// search browser can still import this pure predicate function.
import type { SupplyMaterial } from "@/lib/data/supply-materials";

export function matchesSupplyQuery(material: SupplyMaterial, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    material.displayName.toLowerCase().includes(q) ||
    material.searchAliases.toLowerCase().includes(q)
  );
}
