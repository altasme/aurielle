import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Lookup | Aurielle Paris Atelier",
};

export default function OrderLookupPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center lg:px-10">
      <h1 className="font-serif text-4xl text-ink">Order Lookup</h1>
      <p className="mt-4 text-sm text-ink/60">
        Since there are no customer accounts, look up your order status here
        using your order number and email.
      </p>

      <form className="mt-10 space-y-5 text-left">
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">
            Order Number
          </label>
          <input
            type="text"
            name="orderNumber"
            className="mt-2 w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm outline-none focus:border-burgundy"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-ink/60">
            Email
          </label>
          <input
            type="email"
            name="email"
            className="mt-2 w-full border border-taupe/40 bg-ivory px-4 py-3 text-sm outline-none focus:border-burgundy"
          />
        </div>
        <button
          type="submit"
          className="w-full border border-burgundy bg-burgundy px-8 py-3 text-xs uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-burgundy-dark"
        >
          Find Order
        </button>
      </form>
    </div>
  );
}
