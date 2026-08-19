import type { Metadata } from "next";
import { getSupplyMaterials } from "@/lib/data/supply-materials";
import { SupplyCatalogueBrowser } from "@/components/supply-catalogue-browser";

export const metadata: Metadata = {
  title: "Atelier Supply | Aurielle Paris Atelier",
  description:
    "Browse the Atelier Supply catalogue: fragrance materials, bottles, pouches, boxes and labels for creators, perfumers and businesses.",
};

// Falls back to a periodic refresh; admin saves also push an immediate
// update via revalidatePath() (see src/app/api/admin/products routes).
export const revalidate = 3600;

export default async function AtelierSupplyPage() {
  const materials = await getSupplyMaterials();

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 lg:px-10">
      <div className="text-center">
        <h1 className="font-serif text-4xl text-ink">Atelier Supply</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-ink/60">
          Fragrance materials, bottles, pouches, boxes and labels for your
          next creation &mdash; browse by category or search the full
          catalogue.
        </p>
      </div>

      <div className="mt-10">
        <SupplyCatalogueBrowser materials={materials} />
      </div>
    </div>
  );
}
