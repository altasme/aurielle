import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Business & Wholesale | Aurielle Paris Atelier",
};

export default function BusinessPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center lg:px-10">
      <h1 className="font-serif text-4xl text-ink">For Your Business</h1>
      <p className="mt-4 text-sm text-ink/70">
        Looking for fragrance materials for your own creations, products or
        business?
      </p>

      <form className="mt-12 space-y-5 text-left">
        <Field label="Name" name="name" />
        <Field label="Business Name" name="businessName" />
        <Field label="Email" name="email" type="email" />
        <Field label="Country" name="country" />
        <Field label="Product / Material Interest" name="interest" />
        <Field label="Estimated Quantity" name="quantity" />
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
          Talk to the Atelier
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
