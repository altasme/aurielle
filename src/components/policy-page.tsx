import Link from "next/link";
import { Reveal } from "@/components/reveal";

export function PolicyPage({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <Reveal>
        <h1 className="font-serif text-4xl text-ink">{title}</h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-ink/60">
          This policy is being finalized and will be published here before
          launch. For questions in the meantime, please{" "}
          <Link href="/contact" className="text-burgundy underline">
            contact us
          </Link>
          .
        </p>
      </Reveal>
    </div>
  );
}
