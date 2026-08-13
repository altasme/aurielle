// Static payment instructions for the manual (Kolekta-pattern) order flow
// (spec v4 §16/§17). No payment API — the customer sees these
// instructions, pays out-of-band, and uploads proof; the team verifies
// manually. Exact GCash/bank details must come from the client — the
// placeholders below are intentionally not real account details.

export const GCASH_INSTRUCTIONS = {
  accountName: "TBD — pending client details",
  accountNumber: "TBD — pending client details",
  qrImageUrl: null as string | null,
};

export const BANK_TRANSFER_INSTRUCTIONS = {
  bankName: "TBD — pending client details",
  accountName: "TBD — pending client details",
  accountNumber: "TBD — pending client details",
  iban: "TBD — pending client details",
  swift: "TBD — pending client details",
};

export type PaymentMethod = "gcash" | "bank_transfer" | "stripe";

export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  available: boolean;
  note?: string;
}[] = [
  { id: "gcash", label: "GCash", available: true },
  { id: "bank_transfer", label: "Bank Transfer", available: true },
  {
    id: "stripe",
    label: "Card (Stripe)",
    available: false,
    note: "Coming soon",
  },
];
