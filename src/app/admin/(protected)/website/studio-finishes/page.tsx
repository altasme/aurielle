import Link from "next/link";
import { listFinishes } from "@/lib/admin/studio-content";
import { StudioFinishesManager } from "@/components/admin/studio-finishes-manager";

export default async function AdminStudioFinishesPage() {
  const finishes = await listFinishes();

  return (
    <div>
      <Link href="/admin/website" className="text-xs uppercase tracking-wide text-burgundy underline">
        &larr; All Pages
      </Link>
      <h1 className="mt-3 font-serif text-2xl text-ink">Studio Finishes</h1>
      <p className="mt-1 text-sm text-ink/60">
        The &ldquo;What the Studio Can Do&rdquo; tiles on the /studio page. Changes go live as soon as you save.
      </p>

      <div className="mt-8">
        <StudioFinishesManager initialFinishes={finishes} />
      </div>
    </div>
  );
}
