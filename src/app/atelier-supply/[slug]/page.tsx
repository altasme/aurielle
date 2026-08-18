import { notFound } from "next/navigation";
import Image from "next/image";
import { getSupplyMaterialBySlug, getSupplyMaterials } from "@/lib/data/supply-materials";
import { AddToSupplyCartButton } from "@/components/add-to-supply-cart-button";

// Falls back to a periodic refresh; admin saves also push an immediate
// update via revalidatePath() (see src/app/api/admin/products routes).
export const revalidate = 3600;

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
      <div className="relative aspect-square w-full overflow-hidden border border-taupe/30 bg-beige/40">
        {material.primaryImageUrl && (
          <Image
            src={material.primaryImageUrl}
            alt={material.displayName}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover"
          />
        )}
      </div>

      <div>
        <h1 className="font-serif text-4xl text-ink">{material.displayName}</h1>
        <p className="mt-2 text-sm text-ink/50">
          Serial No. {material.serialNumber.toString().padStart(3, "0")}
        </p>

        {material.description && (
          <p className="mt-4 text-sm text-ink/70">{material.description}</p>
        )}

        <p className="mt-6 text-lg text-burgundy">
          USD {material.price.toFixed(2)} / {material.pricingUnit}
        </p>

        <div className="mt-8 space-y-2 border-t border-taupe/20 pt-6 text-sm text-ink/70">
          <p>Product Type: {material.productTypeName ?? "Fragrance Material"}</p>
          <p>Unit: {material.pricingUnit === "KG" ? "Kilogram" : material.pricingUnit}</p>
        </div>

        <div className="mt-10 border-t border-taupe/20 pt-6">
          <AddToSupplyCartButton material={material} />
        </div>
      </div>
    </div>
  );
}
