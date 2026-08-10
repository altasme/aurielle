# Aurielle Paris Atelier

MVP website for Aurielle Paris Atelier — a French-inspired luxury fragrance
brand with two commercial sides: the **Aurielle Collection** (B2C perfumes)
and **Atelier Supply** (B2B fragrance materials catalogue). Full product
requirements are in [`docs/spec/AURIELLE_SPEC_v3.md`](docs/spec/AURIELLE_SPEC_v3.md).

## Stack

Next.js (App Router) · Tailwind CSS v4 · Supabase (Postgres + Auth) · Stripe ·
Cloudflare Workers (via the OpenNext adapter). See spec §37.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL / anon key / service role key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Catalogue pages
(`/collection`, `/atelier-supply`, and their detail pages) read live from
Supabase and are rendered per-request (`force-dynamic`) since the admin CMS
will be editing that data directly in the database.

## Database

- `supabase/migrations/0001_init.sql` — schema: `perfumes`,
  `supply_materials` (with the alias-only `search_aliases` column, spec
  §13a), `orders` / `order_items` (with `source = 'website'` for commission
  reconciliation, spec §20), `wholesale_inquiries`, `contact_inquiries`.
- `supabase/migrations/0002_perfumes_public_read.sql` — relaxes the
  perfumes RLS policy to public-read (names are already public via the
  client's marketing material, unlike supply materials which stay gated
  behind `available = true` for alias-only compliance).
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

Run the migrations (in order) then the seed files in the Supabase SQL
Editor.

## Deploying to Cloudflare

Hosting uses [OpenNext's Cloudflare adapter](https://opennext.js.org/cloudflare)
(`@opennextjs/cloudflare`), which compiles this Next.js app to a Cloudflare
Worker with static assets — this is what actually supports the
force-dynamic, DB-backed pages; a plain static Cloudflare Pages export
cannot run server code per request.

```bash
npm run cf:build     # opennextjs-cloudflare build — produces .open-next/
npm run cf:preview   # build + run locally against workerd
npm run cf:deploy    # build + wrangler deploy (needs `wrangler login` or CLOUDFLARE_API_TOKEN)
```

Config lives in `wrangler.jsonc` (worker name, assets binding) and
`open-next.config.ts`. Environment variables for local Worker
preview/dev go in `.dev.vars` (gitignored, mirrors `.env.local` — see
`.dev.vars.example`). For the deployed Worker, set the same three vars
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`) as Cloudflare secrets/vars in the dashboard
or via `wrangler secret put <NAME>` — never commit them.

Two ways to actually deploy:
1. **Cloudflare dashboard git integration** — connect this repo, set the
   build command to `npm run cf:build` and let Cloudflare's "Workers"
   deploy target pick up `wrangler.jsonc`. No CLI credentials needed from
   whoever sets this up.
2. **CLI** — `wrangler login` (or set `CLOUDFLARE_API_TOKEN`), then
   `npm run cf:deploy`.

This MVP doesn't yet use ISR or `next/image` optimization, so the R2
incremental-cache and Images bindings from OpenNext's default template are
intentionally omitted from `wrangler.jsonc` — add them per the OpenNext
caching docs if that changes.

## What's scaffolded vs. not yet built

Done: routing per the sitemap (spec §3), design tokens/fonts (§28), header
+ mobile menu, homepage sections, Atelier Supply search/listing/detail
pages backed by live Supabase data, Collection listing/detail pages,
About/Business/Contact forms (not yet wired to a backend), Supabase schema
+ seed data, Cloudflare Worker deployment config.

Not yet built: cart/checkout state (two independent carts per spec
§15/§31), Stripe/GCash/bank-transfer payment flows, admin CMS, CSV order
export, analytics/consent banner.
