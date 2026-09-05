import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";
import { getSiteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Contact | Aurielle Paris Atelier",
};

export default async function ContactPage() {
  const { text } = await getSiteContent("contact");

  return (
    <Reveal className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <p className="font-script text-2xl text-burgundy">{text.eyebrow}</p>
      <h1 className="mt-2 font-serif text-4xl text-ink">{text.heading}</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-ink/60">{text.body}</p>

      <ContactForm />
    </Reveal>
  );
}
