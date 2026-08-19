# Aurielle Paris Atelier

MVP website for Aurielle Paris Atelier, a French-inspired luxury fragrance
brand with two commercial sides: the **Aurielle Collection** (B2C perfumes)
and **Atelier Supply** (B2B fragrance materials catalogue).

Current source of truth: [`docs/spec/AURIELLE_SPEC_v4.md`](docs/spec/AURIELLE_SPEC_v4.md)
("Phase-recalibrated," supersedes v3), **superseded again** for the
catalogue's read path by the admin panel spec (client-supplied
"AURIELLE ADMIN PANEL — MVP Product & Pricing Specification"). v4's core
decision was "reads are static, writes go to Supabase"; the admin panel
requires the client to manage products/pricing themselves without a
developer, which needs a live, editable catalogue. The pivot: the
Aurielle Collection and Atelier Supply catalogue pages are now **DB-backed
with ISR** (`export const revalidate` + `revalidatePath()` on every admin
save), not static-from-CSV. See "Admin panel" below. Everything else v4
decided (manual GCash/bank-transfer order flow, no Stripe, order/inquiry
writes) is unchanged.

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
`src/data/*.generated.ts`; that generated output is no longer read by any
page (see "Catalogue" below) but the script is left in place since
`scripts/generate-backfill-sql.mjs` reads the same source CSVs. **Supabase
env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are now required to
build the site**, not just to run it: `generateStaticParams()` on the
catalogue detail pages calls Supabase at build time.

## Catalogue (DB-backed, admin-managed)

- The catalogue now lives in Supabase's `products` table (migration
  `0005_admin_panel.sql`), one shared table for both categories
  (`category = 'aurielle_collection' | 'atelier_supply'`), edited through
  the admin panel at `/admin` (see "Admin panel" below). `src/lib/data/
  perfumes.ts` and `supply-materials.ts` read only `status = 'active'`
  rows, server-only.
- `data/atelier-supply.csv` and `data/perfumes.csv` are no longer the
  live source of truth; they're kept only as the input to
  `scripts/generate-backfill-sql.mjs` (see "Database" below), which
  backfilled the original catalogue into `products` so the site didn't go
  blank when this pivot shipped. Edit products through `/admin` from now
  on, not these CSVs.
- `docs/atelier-supply-needs-review.csv`: the **275 rows** whose only name
  in the source PDF was a designer/brand reference (e.g. "Dior Sauvage").
  Still unresolved; add client-approved neutral names as new Atelier
  Supply products via the admin panel once approved.
- `search_aliases`/Product Tags: the admin's optional "Product Tags" field
  on Atelier Supply products feeds client-side search the same way the
  old CSV's `search_aliases` column did (spec §13a: matched, never
  rendered on a card/PDP/meta tag).

## Images

Real photography is wired in under `public/images/`:

- `hero.jpg`: homepage hero background. `og-share.jpg`: social share
  preview (wired into `layout.tsx` metadata).
- `logo.png`: the AP monogram, rasterized from the client's source SVG
  (kept out of the repo; ask for it again if it needs re-exporting).
  Used in the header and footer. `src/app/icon.png`,
  `apple-icon.png`, and `favicon.ico` are generated from the same mark.
- `perfumes/cards/<slug>.jpg` (1200×1600) and `perfumes/main/<slug>.jpg`
  (1600×1600): one of each per perfume in `data/perfumes.csv`, matched
  by slug. `PerfumeCard` (used on the homepage and `/collection`) and
  the PDP (`/collection/[slug]`) reference these paths directly by
  convention, no image field in the CSV/data model. Adding a new
  perfume means dropping in matching image files with the same slug.
- The client also sent a "Bleu Royale" product photo with no matching
  catalogue entry; left out of `data/perfumes.csv` on request. Revisit
  if that's meant to become a 15th product.
- `next.config.ts` sets `images.unoptimized: true`, skipping Next's
  image-optimization loader (would need an extra Cloudflare Images
  binding) since these files already ship pre-sized to spec.
- Atelier Supply materials still have no photography (per the earlier
  decision to wait for real per-SKU images before adding any).

## Database

- `supabase/migrations/0001_init.sql`, `0002_perfumes_public_read.sql`:
  from the v3 (live-DB-catalogue) build. Superseded by
  `0003_phase1_writes_only.sql`, which removed the (at the time)
  pointless public read policies and reshaped `order_items` to snapshot
  fields (name/price/unit at order time) instead of foreign-keying to
  `perfumes`/`supply_materials`.
- `0004_manual_order_flow.sql`: creates the private `payment-proofs`
  Storage bucket and updates `orders.order_status` to allow
  `pending_verification` (the status every order starts in, spec §15).
- `0005_admin_panel.sql`: the admin panel pivot. Adds `admin_users`,
  `admin_sessions`, `product_types`, `products`, `product_tags`,
  `product_images`, with RLS (public reads only `status = 'active'`
  products; `admin_users`/`admin_sessions` have no public policy at all).
  The legacy `perfumes`/`supply_materials` tables from 0001-0002 are left
  in place, unused, not dropped.
- `0006_backfill_catalogue.sql`: generated by
  `scripts/generate-backfill-sql.mjs` from `data/*.csv`, inserts the
  original 14 perfumes + 236 supply materials into `products` as
  `status = 'active'` rows (idempotent, `on conflict (slug) do nothing`)
  so the live site doesn't go blank the moment reads switch over. **Must
  run after 0005.** Backfilled rows have no `perfume_type` /
  `product_type_id` / `mood` set (the old CSVs never carried that data);
  an admin should fill those in via the edit form when convenient, the
  public pages tolerate a null Type gracefully in the meantime.
- `supabase/seed/*.sql`: the old v3 live-catalogue seed data, superseded
  by 0006 above. Not used.
- Run migrations **0001 → 0002 → 0003 → 0004 → 0005 → 0006** in order in
  the Supabase SQL Editor (all manual; there is no migration runner).
- After 0005/0006 are applied, create the first admin login:
  `ADMIN_USERNAME=... ADMIN_PASSWORD=... node scripts/seed-admin-user.mjs`
  prints an `insert into admin_users ...` statement (password scrypt-
  hashed locally, never touches the network) to run in the SQL Editor.
  Re-run with the same username to reset a forgotten password.

## Admin panel

- Lives at `admin-aurielle.altasme.com` -- a second custom domain routed
  at the same `aurielle` Worker (Cloudflare dashboard → Workers & Pages
  → aurielle → Settings → Domains & Routes), not a separate deployment.
  Same code, same database as the public site at `aurielle.altasme.com`;
  `/admin/login` also still works on the public domain, `middleware.ts`
  only rewrites that one domain's bare root ("/") to "/admin" so visiting
  `admin-aurielle.altasme.com` with no path lands on the admin panel
  instead of the public homepage. Everything else (including `/admin/*`
  itself) is untouched by the rewrite.
- `/admin/login` → `/admin` (dashboard: Product & Pricing is the only
  active MVP module; Order Management, Promotion, and Reports &
  Analytics are disabled "Coming Soon" placeholders per spec).
- Auth: a dedicated `admin_users` table (not Supabase Auth), scrypt
  password hashing (`node:crypto`, Workers-compatible), session cookies
  (httpOnly/secure/sameSite=lax, 7-day expiry, only the session token's
  SHA-256 hash stored server-side). `src/lib/admin/auth.ts`. Every admin
  API route checks the session itself (`getSessionAdminUser()`), not just
  the page-level layout guard, per the spec's "protected server-side, not
  only frontend" requirement.
- Product & Pricing (`/admin/products`): category tabs (Aurielle
  Collection / Atelier Supply), search, add/edit/delete, Draft/Active
  status. One shared `products` table for both categories (spec §18:
  "do not create separate completely unrelated product systems"),
  differentiated by nullable category-specific columns.
- Images: Cloudinary via signed REST calls (`src/lib/admin/cloudinary.ts`,
  direct `fetch`, not the `cloudinary` npm SDK, which isn't reliably
  Workers-safe). The DB stores only the Cloudinary public ID + URL, never
  the binary. Needs `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET` env vars; upload/reorder/set-primary/delete all
  no-op with a clear error until those are set.
- Every create/update/delete (product or image) calls `revalidatePath()`
  (`src/lib/admin/revalidate.ts`) on the affected category's listing
  page, the product's detail page, and the homepage (which features
  Aurielle Collection products) so changes go live immediately, without
  waiting for the `revalidate = 3600` fallback on those pages.

## Orders (manual / Kolekta pattern)

- `src/lib/cart/cart-context.tsx`: two independent carts (`collection`,
  `supply`), backed by a module-level store synced to `localStorage` via
  `useSyncExternalStore` (no cart Provider needed; it's already a
  singleton). Never combined into one order, per spec §31.
- `/checkout/collection` and `/checkout/atelier-supply`: customer +
  billing/shipping form, payment method (GCash / Bank Transfer / **Card
  via Stripe, disabled, "Coming soon"**, per spec's Phase-2 seam),
  payment instructions from `src/config/payment.ts` (placeholder GCash/
  bank details; real ones must come from the client), proof-of-payment
  upload.
- `POST /api/orders`: the only place that touches Supabase on the order
  path. Re-derives every line's name/price from the authoritative static
  catalogue by slug (never trusts client-submitted price, the request
  body is just a hint), uploads the proof file to the `payment-proofs`
  bucket, writes `orders` + `order_items` with `order_status =
  "pending_verification"`. Order number: `AUR-YYYYMMDD-XXXXXX`, retried
  on collision.
- `POST /api/inquiries`: contact + wholesale inquiry writes.
- `GET /api/orders/lookup?orderNumber=&email=`: guest order-lookup
  (`/order-lookup`), matches on order number + email since there are no
  customer accounts.
- Not yet built: confirmation email (spec suggests Resend for
  testing; needs an API key from you), analytics/consent banner.

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

Same OpenNext-adapter Worker deployment as before, see
`wrangler.jsonc` / `open-next.config.ts`. `npm run cf:build` /
`cf:preview` / `cf:deploy`. The Worker needs five runtime
variables/secrets set (dashboard → Settings → Variables and Secrets, or
`wrangler secret put <NAME>`) that `.dev.vars` covers locally:
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_CLOUD_NAME`,
`CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. No `NEXT_PUBLIC_*`,
nothing client-side reads any of these.

`open-next.config.ts` doesn't configure an R2/KV incremental cache, so
`export const revalidate` on the catalogue pages doesn't get a durable
cache to write to on Workers -- each request just renders fresh from
Supabase instead of serving a cached copy (correct output, no ISR
performance/cost benefit yet). `revalidatePath()` calls from the admin
routes are effectively no-ops until that's wired up. Fine for now given
catalogue size; revisit via
https://opennext.js.org/cloudflare/caching if traffic or Supabase
read volume becomes a concern.

## What's scaffolded vs. not yet built

Done: routing, design tokens/fonts, header/mobile menu, homepage, fully
static Collection + Atelier Supply catalogues (client-side search/sort),
About/Business/Contact forms, Cloudflare Worker deployment, CSV →
static-catalogue build pipeline, two independent carts, manual
GCash/bank-transfer checkout with proof-of-payment upload (Card/Stripe
shown but disabled, "Coming soon"), order + inquiry writes to Supabase,
order confirmation, guest order-lookup.

Not yet built: confirmation email, analytics + Meta Pixel + consent
banner. All deferred to Phase 2: Stripe, admin CMS, live-DB catalogue,
FX, VAT, shipping calc, category filters, MOQ enforcement.
