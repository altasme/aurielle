import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Aurielle Paris Atelier",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <p className="font-script text-2xl text-burgundy">
        Let&apos;s create something beautiful.
      </p>
      <h1 className="mt-2 font-serif text-4xl text-ink">Contact</h1>

      <div className="mt-8 space-y-1 text-sm text-ink/60">
        <p>Email — pending client details</p>
        <p>Social Media — pending client details</p>
        <p>Location — pending client details</p>
      </div>

      <form className="mt-12 space-y-5 text-left">
        <Field label="Name" name="name" />
        <Field label="Email" name="email" type="email" />
        <Field label="Country" name="country" />
        <Field label="Inquiry Type" name="inquiryType" />
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">
            Message
          </label>
          <textarea
            name="message"
            rows={5}
            className="mt-2 w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm outline-none focus:border-burgundy"
          />
        </div>
        <button
          type="submit"
          className="w-full border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide text-ink/60">
        {label}
      </label>
      <input
        type={type}
        name={name}
        className="mt-2 w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm outline-none focus:border-burgundy"
      />
    </div>
  );
}
