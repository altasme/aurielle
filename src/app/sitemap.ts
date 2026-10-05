import type { MetadataRoute } from "next";
import { getPerfumes } from "@/lib/data/perfumes";
import { getSupplyMaterials } from "@/lib/data/supply-materials";

// Periodic refresh like the rest of the catalogue (src/app/collection/
// page.tsx etc.) -- a new/removed product shows up here within the hour
// rather than needing a redeploy.
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://auriellefragrancestudio.com";

const STATIC_PAGES = [
  "",
  "/collection",
  "/atelier-supply",
  "/about",
  "/studio",
  "/business",
  "/contact",
  "/affiliate",
  "/privacy",
  "/returns",
  "/shipping",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [perfumes, materials] = await Promise.all([getPerfumes(), getSupplyMaterials()]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const perfumeEntries: MetadataRoute.Sitemap = perfumes.map((p) => ({
    url: `${SITE_URL}/collection/${p.slug}`,
    lastModified: new Date(),
  }));

  const materialEntries: MetadataRoute.Sitemap = materials.map((m) => ({
    url: `${SITE_URL}/atelier-supply/${m.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...perfumeEntries, ...materialEntries];
}
