import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "About | Aurielle Paris Atelier",
};

const SECTIONS = [
  {
    title: "Our Story",
    body: "Content pending: client-approved brand story to be added here.",
  },
  {
    title: "The Atelier",
    body: "Content pending: client-approved description of the atelier to be added here.",
  },
  {
    title: "Our Philosophy",
    body: "Content pending: client-approved philosophy statement to be added here.",
  },
  {
    title: "Fragrance Craftsmanship",
    body: "Content pending: client-approved craftsmanship details to be added here.",
  },
  {
    title: "Made in France",
    body: "Content pending: confirmed factual claims only.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 lg:px-10">
      <Reveal className="text-center">
        <p className="font-script text-2xl text-burgundy">Let&apos;s begin</p>
        <h1 className="mt-2 font-serif text-4xl text-ink">About Aurielle</h1>
      </Reveal>

      <div className="mt-16 space-y-14">
        {SECTIONS.map((section) => (
          <Reveal key={section.title} className="border-t border-taupe/20 pt-8">
            <h2 className="font-serif text-2xl text-ink">{section.title}</h2>
            <p className="mt-3 text-sm text-ink/60">{section.body}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
