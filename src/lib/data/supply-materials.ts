import { supabase } from "@/lib/supabase/client";

export type SupplyMaterial = {
  serialNumber: number;
  slug: string;
  displayName: string;
  price: number;
  currency: string;
  pricingUnit: string;
  available: boolean;
};

type SupplyMaterialRow = {
  serial_number: number;
  slug: string;
  display_name: string;
  price: number;
  currency: string;
  pricing_unit: string;
  available: boolean;
};

// search_aliases is intentionally never selected here (spec §13a). Search
// matching against it happens server-side via the `.or()` filter in
// searchSupplyMaterials below — its contents never appear in a response
// payload sent to the browser.
const PUBLIC_COLUMNS =
  "serial_number, slug, display_name, price, currency, pricing_unit, available";

function toSupplyMaterial(row: SupplyMaterialRow): SupplyMaterial {
  return {
    serialNumber: row.serial_number,
    slug: row.slug,
    displayName: row.display_name,
    price: Number(row.price),
    currency: row.currency,
    pricingUnit: row.pricing_unit,
    available: row.available,
  };
}

export async function getSupplyMaterials(): Promise<SupplyMaterial[]> {
  const { data, error } = await supabase
    .from("supply_materials")
    .select(PUBLIC_COLUMNS)
    .eq("available", true)
    .order("serial_number");
  if (error) throw error;
  return (data ?? []).map(toSupplyMaterial);
}

export async function getSupplyMaterialBySlug(
  slug: string,
): Promise<SupplyMaterial | undefined> {
  const { data, error } = await supabase
    .from("supply_materials")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slug)
    .eq("available", true)
    .maybeSingle();
  if (error) throw error;
  return data ? toSupplyMaterial(data) : undefined;
}

// Strips PostgREST filter-syntax metacharacters and SQL LIKE wildcards so
// user search input can't break out of the `.or()` filter string below or
// inject unintended wildcards/columns.
function sanitizeSearchTerm(input: string): string {
  return input.replace(/[,()%_]/g, " ").trim();
}

export async function searchSupplyMaterials(
  query: string,
): Promise<SupplyMaterial[]> {
  const term = sanitizeSearchTerm(query);
  if (!term) return getSupplyMaterials();

  const { data, error } = await supabase
    .from("supply_materials")
    .select(PUBLIC_COLUMNS)
    .eq("available", true)
    .or(`display_name.ilike.%${term}%,search_aliases.ilike.%${term}%`)
    .order("serial_number");
  if (error) throw error;
  return (data ?? []).map(toSupplyMaterial);
}
