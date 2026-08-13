# Aurielle Paris Atelier

MVP website for Aurielle Paris Atelier — a French-inspired luxury fragrance
brand with two commercial sides: the **Aurielle Collection** (B2C perfumes)
and **Atelier Supply** (B2B fragrance materials catalogue).

Current source of truth: [`docs/spec/AURIELLE_SPEC_v4.md`](docs/spec/AURIELLE_SPEC_v4.md)
("Phase-recalibrated" — supersedes v3). The core decision: **reads are
static, writes go to Supabase.** The catalogue is a few hundred near-static
records generated at build time from CSV; nothing on a read path touches a
database. Supabase is used only to write orders/inquiries at request time,
via a manual (GCash / bank-transfer + proof-of-payment) order flow — no
Stripe, no admin CMS, no live-DB catalogue in Phase 1. See v4 §"WHY v4
EXISTS" for why (a Supabase-at-build-time read crashed the first production
deploy — this line was drawn to kill that entire error class, not just
patch the one crash).

## Stack

Next.js (App Router, fully static in Phase 1) · Tailwind CSS v4 · Supabase
(Postgres, writes-only + Storage) · Cloudflare Workers via the OpenNext
adapter.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `npm run dev` and
`npm run build` both run `scripts/generate-catalogue.mjs` first (as a
`predev`/`prebuild` step) to compile `data/*.csv` into
`src/data/*.generated.ts` — gitignored build output, regenerated every
time. No Supabase env vars are needed to build or run the site; catalogue
pages don't read from the database at all.

## Catalogue (static, Phase 1)

- `data/atelier-supply.csv` — the **236 client-approved, already-neutral**
  rows from the source price list (name, price, unit, serial number).
  Designer/brand-named rows are intentionally excluded from this file.
- `data/perfumes.csv` — the 14 placeholder perfume names from the client's
  marketing material; price/size/description are blank pending client
  input.
- `docs/atelier-supply-needs-review.csv` — the other **275 rows** whose
  only name in the source PDF was literally a designer/brand reference
  (e.g. "Dior Sauvage"). These need a client-approved neutral name before
  they can be added to `atelier-supply.csv` — once approved, add rows
  there (with the designer name moved to `search_aliases`) and redeploy.
- `scripts/generate-catalogue.mjs` — compiles both CSVs into typed
  `src/data/*.generated.ts`. Fails loudly (exit 1) on a missing file,
  duplicate serial number, or bad price — on purpose, so a broken CSV
  can't ship silently.
- `search_aliases` is bundled into the client JS so search can match
  against it (client-side search over ~250 records, spec §9/§10) — but no
  component ever renders that field. That's a deliberate Phase 1
  tradeoff, not a leak: alias-only means "never displayed," not "never
  shipped."

To update the catalogue: edit the CSV, `npm run generate:catalogue` (or
just rebuild), redeploy. No CMS in Phase 1 — that's Phase 2 (spec §21).

## Database (writes only)

- `supabase/migrations/0001_init.sql`, `0002_perfumes_public_read.sql` —
  from the v3 (live-DB-catalogue) build. Superseded by
  `0003_phase1_writes_only.sql`, which removes the now-pointless public
  read policies (no anon client exists in the app anymore) and reshapes
  `order_items` to snapshot fields (name/price/unit at order time) instead
  of foreign-keying to `perfumes`/`supply_materials` — those tables aren't
  the catalogue's source of truth anymore, git/CSV is, so a hard FK
  doesn't hold.
- `supabase/seed/*.sql` — the old v3 live-catalogue seed data. Not used by
  the Phase 1 app (nothing reads these tables), kept for the eventual
  Phase 2 `CATALOGUE_SOURCE: "supabase"` flip.
- Run migrations **0001 → 0002 → 0003** in order in the Supabase SQL
  Editor.

## Phase 2 seam

`src/config/commerce.ts` holds the two constants that gate Phase 2:

```ts
export const COMMERCE_MODE: "manual" | "stripe" = "manual";
export const CATALOGUE_SOURCE: "static" | "supabase" = "static";
```

Checkout and catalogue-read code should branch on these only, so flipping
them (plus wiring the Stripe/CMS modules) is the whole of the Phase 2
switch-on.

## Deploying to Cloudflare

Same OpenNext-adapter Worker deployment as before — see
`wrangler.jsonc` / `open-next.config.ts`. `npm run cf:build` /
`cf:preview` / `cf:deploy`. Now that reads are fully static, the deployed
Worker mostly serves prerendered HTML; it'll only need Supabase env vars
once the order/inquiry write endpoints (next up) land. Env var names
changed from the v3 build: `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`
(no more `NEXT_PUBLIC_*` — nothing client-side reads Supabase now).

## What's scaffolded vs. not yet built

Done: routing, design tokens/fonts, header/mobile menu, homepage, fully
static Collection + Atelier Supply catalogues (client-side search/sort),
About/Business/Contact page shells, Cloudflare Worker deployment,
CSV → static-catalogue build pipeline.

Not yet built (Phase 1 remaining): cart (two independent, localStorage),
manual checkout (GCash/bank-transfer instructions + proof-of-payment
upload), order + inquiry writes to Supabase, order confirmation, guest
order-lookup, analytics/consent banner. All deferred to Phase 2: Stripe,
admin CMS, live-DB catalogue, FX, VAT, shipping calc, category filters,
MOQ enforcement.
