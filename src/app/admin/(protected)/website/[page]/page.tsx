import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteContentForEdit } from "@/lib/admin/site-content";
import { SiteTextFieldRow } from "@/components/admin/site-text-field-row";
import { SiteImageSlotCard } from "@/components/admin/site-image-slot-card";

export default async function AdminWebsiteContentPage({ params }: PageProps<"/admin/website/[page]">) {
  const { page: slug } = await params;
  const page = await getSiteContentForEdit(slug);
  if (!page) notFound();

  return (
    <div>
      <Link href="/admin/website" className="text-xs uppercase tracking-wide text-burgundy underline">
        &larr; All Pages
      </Link>
      <h1 className="mt-3 font-serif text-2xl text-ink">{page.label}</h1>
      <p className="mt-1 text-sm text-ink/60">{page.description}</p>

      {page.imageSlots.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-lg text-ink">Photos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {page.imageSlots.map((slot) => (
              <SiteImageSlotCard
                key={slot.key}
                page={page.slug}
                slotKey={slot.key}
                label={slot.label}
                recommendedSize={slot.recommendedSize}
                aspectRatio={slot.aspectRatio}
                format={slot.format}
                maxSizeMb={slot.maxSizeMb}
                defaultValue={slot.default}
                initialValue={slot.value}
              />
            ))}
          </div>
        </section>
      )}

      {page.textFields.length > 0 && (
        <section className="mt-8">
          <h2 className="font-serif text-lg text-ink">Text</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {page.textFields.map((field) => (
              <SiteTextFieldRow
                key={field.key}
                page={page.slug}
                fieldKey={field.key}
                label={field.label}
                type={field.type}
                defaultValue={field.default}
                initialValue={field.value}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
