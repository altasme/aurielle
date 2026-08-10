import { notFound } from "next/navigation";
import { getSupplyMaterialBySlug, getSupplyMaterials } from "@/lib/data/supply-materials";

export async function generateStaticParams() {
  const materials = await getSupplyMaterials();
  return materials.map((m) => ({ slug: m.slug }));
}

export default async function SupplyMaterialDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const material = await getSupplyMaterialBySlug(slug);
  if (!material) notFound();

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10">
      <div className="aspect-square w-full border border-taupe/30 bg-beige/40" />

      <div>
        <h1 className="font-serif text-4xl text-ink">{material.displayName}</h1>
        <p className="mt-2 text-sm text-ink/50">
          Serial No. {material.serialNumber.toString().padStart(3, "0")}
        </p>

        <p className="mt-6 text-lg text-burgundy">
          USD {material.price.toFixed(2)} / {material.pricingUnit}
        </p>

        <div className="mt-8 space-y-2 border-t border-taupe/20 pt-6 text-sm text-ink/70">
          <p>Product Type: Fragrance Material</p>
          <p>Unit: {material.pricingUnit === "KG" ? "Kilogram" : material.pricingUnit}</p>
        </div>

        <button
          type="button"
          className="mt-10 w-full border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark"
        >
          Request / Order
        </button>
      </div>
    </div>
  );
}
