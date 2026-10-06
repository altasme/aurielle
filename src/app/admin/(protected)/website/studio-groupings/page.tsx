import Link from "next/link";
import Image from "next/image";
import { listGroupings } from "@/lib/admin/studio-content";
import { StudioGroupingCreateForm } from "@/components/admin/studio-grouping-create-form";

export default async function AdminStudioGroupingsPage() {
  const groupings = await listGroupings();

  return (
    <div>
      <Link href="/admin/website" className="text-xs uppercase tracking-wide text-burgundy underline">
        &larr; All Pages
      </Link>
      <h1 className="mt-3 font-serif text-2xl text-ink">Studio Groupings</h1>
      <p className="mt-1 text-sm text-ink/60">
        The Customisation Studio&rsquo;s service groupings on /studio, and the one marked &ldquo;spotlight&rdquo; is what shows on the
        homepage. Click a grouping to edit its text, photo, and item list.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groupings.map((grouping) => (
          <Link
            key={grouping.id}
            href={`/admin/website/studio-groupings/${grouping.id}`}
            className="border border-taupe/20 bg-white p-4 transition-colors hover:border-burgundy"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-beige/40">
              {grouping.imageUrl ? (
                <Image src={grouping.imageUrl} alt="" fill sizes="400px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-ink/30">No image</div>
              )}
            </div>
            <h2 className="mt-3 font-serif text-lg text-ink">
              {grouping.name}
              {grouping.spotlight && (
                <span className="ml-2 rounded-sm bg-burgundy px-1.5 py-0.5 align-middle text-[10px] uppercase tracking-wide text-ivory">
                  Spotlight
                </span>
              )}
            </h2>
            <p className="mt-1 line-clamp-2 text-xs text-ink/60">{grouping.intro}</p>
          </Link>
        ))}
        <StudioGroupingCreateForm />
      </div>
    </div>
  );
}
