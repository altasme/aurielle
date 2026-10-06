import Link from "next/link";
import { redirect } from "next/navigation";
import { getGrouping, listGroupingItems } from "@/lib/admin/studio-content";
import { StudioGroupingEditor } from "@/components/admin/studio-grouping-editor";

export default async function AdminStudioGroupingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const grouping = await getGrouping(id);
  // Also reached right after DeleteConfirmButton's router.refresh() on
  // this same page -- redirect back to the list rather than a 404.
  if (!grouping) redirect("/admin/website/studio-groupings");

  const items = await listGroupingItems(id);

  return (
    <div>
      <Link href="/admin/website/studio-groupings" className="text-xs uppercase tracking-wide text-burgundy underline">
        &larr; All Groupings
      </Link>
      <h1 className="mt-3 font-serif text-2xl text-ink">{grouping.name}</h1>

      <div className="mt-8">
        <StudioGroupingEditor grouping={grouping} initialItems={items} />
      </div>
    </div>
  );
}
