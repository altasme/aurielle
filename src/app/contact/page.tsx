import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Contact | Aurielle Paris Atelier",
};

export default function ContactPage() {
  return (
    <Reveal className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <p className="font-script text-2xl text-burgundy">
        Let&apos;s create something beautiful.
      </p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Contact</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-ink/60">
        Send us a message and the atelier will get back to you directly.
      </p>

      <ContactForm />
    </Reveal>
  );
}
