# Aurielle Paris Atelier

MVP website for Aurielle Paris Atelier — a French-inspired luxury fragrance
brand with two commercial sides: the **Aurielle Collection** (B2C perfumes)
and **Atelier Supply** (B2B fragrance materials catalogue). Full product
requirements are in [`docs/spec/AURIELLE_SPEC_v3.md`](docs/spec/AURIELLE_SPEC_v3.md).

## Stack

Next.js (App Router) · Tailwind CSS v4 · Supabase (Postgres + Auth) · Stripe.
See spec §37.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The catalogue pages currently read from local seed JSON in
`src/lib/data/` rather than a live Supabase project — no
`NEXT_PUBLIC_SUPABASE_URL` / service role key exists yet. The data-access
functions in `src/lib/data/*.ts` are the seam to swap in real Supabase
queries once a project is provisioned; call sites won't need to change.

## Database

- `supabase/migrations/0001_init.sql` — schema: `perfumes`,
  `supply_materials` (with the alias-only `search_aliases` column, spec
  §13a), `orders` / `order_items` (with `source = 'website'` for commission
  reconciliation, spec §20), `wholesale_inquiries`, `contact_inquiries`.
- `supabase/seed/supply_materials_seed.sql` — 511 rows parsed from the
  client's Atelier Supply price list PDF. Rows whose source name was
  literally a designer/brand reference (e.g. "Dior Sauvage") are seeded
  with a placeholder `display_name` ("Atelier Supply No. NNN") and
  `available = false`, with the raw name preserved in `search_aliases`.
  They stay hidden from the storefront until a client-approved neutral
  name replaces the placeholder — see
  [`docs/atelier-supply-needs-review.csv`](docs/atelier-supply-needs-review.csv)
  (275 rows).
- `supabase/seed/perfumes_seed.sql` — placeholder rows using the perfume
  names from the client's own marketing material (spec §2). All rows are
  `available = false` until price, size and description are confirmed.

## What's scaffolded vs. not yet built

Done: routing per the sitemap (spec §3), design tokens/fonts (§28), header
+ mobile menu, homepage sections, Atelier Supply search/listing/detail
pages backed by the real (seeded) price list, Collection listing/detail
pages, About/Business/Contact forms (not yet wired to a backend), Supabase
schema and seed data.

Not yet built: live Supabase connection, cart/checkout state (two
independent carts per spec §15/§31), Stripe/GCash/bank-transfer payment
flows, admin CMS, CSV order export, analytics/consent banner.
