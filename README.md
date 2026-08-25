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

A third pillar was added on top of this per
[`docs/spec/AURIELLE_SPEC_v5_ADDENDUM.md`](docs/spec/AURIELLE_SPEC_v5_ADDENDUM.md):
the **Customisation Studio** (UV-printing/custom branding), a quote-based
showcase with no cart or pricing. See "Customisation Studio" below. The
homepage went through two further IA passes:
[`docs/spec/AURIELLE_LANDING_IMPROVEMENT_v5.1.md`](docs/spec/AURIELLE_LANDING_IMPROVEMENT_v5.1.md)
regrouped the same sections into three uninterrupted per-pillar runs
instead of interleaving all three audiences; then
[`docs/spec/AURIELLE_LANDING_REBALANCE_v5.2.md`](docs/spec/AURIELLE_LANDING_REBALANCE_v5.2.md)
(supersedes v5.1) found the reorder wasn't enough -- the page was still
~70% fragrance by real estate -- and cut it down to a **lean, equal-thirds
gateway**: one parallel block per pillar (heading → a taste → one CTA to
its own page), with the destination-grade content (mood filter,
philosophy, story bottles, founder story, community, factory, fragrance-
dev process) relocated to `/collection`, `/atelier-supply` and `/about`
rather than deleted. Both passes also fixed the hard Supply/Studio copy
boundary (Supply sources materials, Studio prints/brands them) and
nav/affiliate emphasis.
[`docs/spec/AURIELLE_INTERNAL_PAGES_v5.4.md`](docs/spec/AURIELLE_INTERNAL_PAGES_v5.4.md)
then completed the three receiving pages into full page structures
(hero, then their relocated content, then a close CTA) rather than
loose blocks: `/collection` is now the full fragrance experience
(hero, product grid, mood filter, story bottles, philosophy, close
CTA); `/atelier-supply` now also carries the capability cards
(previously homepage-only) plus the fragrance-development process and
factory grid before its catalogue browser; `/about` was restructured
into the maison story for all three crafts (hero, Our Story, founder,
a lean "What We Do" three-pillar summary replacing the previous
long-form per-pillar essays, community, close CTA).

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
- `0007_admin_refinements.sql`: client feedback after first live use.
  Seeds Atelier Supply's five sub-menu product types (Fragrances /
  Bottles / Pouches / Boxes / Labels) and backfills every pre-admin-panel
  product (all fragrances) onto "Fragrances"; drops the fixed 5-value
  CHECK constraint on `products.mood` so mood becomes free-text/
  admin-extensible, same pattern as Scent Tags, instead of a closed enum.
- `0010_affiliate_order_updates.sql`: client feedback round 3. Adds
  `affiliate_applications` (public "Be an Affiliate" nav button/form);
  `orders.viewed_at` for the admin unviewed-order counter badge;
  replaces the order status pipeline (`received`/`processing`/
  `fulfilled` → `to_pack`/`to_ship`/`shipped_out`, `pending_verification`
  and `cancelled` unchanged) and migrates existing rows onto the closest
  new value; adds `orders.courier_name`/`tracking_number`, captured when
  an order moves to Shipped Out.
- `0011_affiliate_approval.sql`: affiliate applications become subject
  to admin approval. Adds `affiliate_applications.status` (`pending` /
  `approved` / `rejected`, default `pending`); the admin Affiliates
  page's New/Approved/Rejected tabs and the nav "new applications"
  counter badge both key off this.
- `0012_customisation_studio.sql`: spec v5 addendum. Adds
  `customisation_quotes` (public Customisation Studio quote-request
  form: name/email/phone/country/grouping/item/quantity/message +
  optional artwork upload) and the private `customisation-artwork`
  Storage bucket, mirroring `payment-proofs` (0004).
- `supabase/seed/*.sql`: the old v3 live-catalogue seed data, superseded
  by 0006 above. Not used.
- Run migrations **0001 → 0002 → 0003 → 0004 → 0005 → 0006 → 0007 → 0010
  → 0011 → 0012** in order in the Supabase SQL Editor (all manual; there
  is no migration runner).
- After 0005/0006 are applied, create the first admin login:
  `ADMIN_USERNAME=... ADMIN_PASSWORD=... node scripts/seed-admin-user.mjs`
  prints an `insert into admin_users ...` statement (password scrypt-
  hashed locally, never touches the network) to run in the SQL Editor.
  Re-run with the same username to reset a forgotten password.

## Admin panel

- `/admin` is a page like any other, not a separate deployment -- it
  works on **any** custom domain routed to the `aurielle` Worker
  (Cloudflare dashboard → Workers & Pages → aurielle → Settings →
  Domains & Routes). Live on `auriellefragrancestudio.com` (the
  commercial domain) and `aurielle.altasme.com` (kept working
  alongside it); `admin-aurielle.altasme.com` additionally exists as a
  convenience second custom domain, purely so visiting its bare root
  ("/") with no path lands directly on the admin panel instead of the
  public homepage -- `middleware.ts` rewrites only that one specific
  hostname's "/"; `/admin/login` works on every domain regardless.
  Same code, same database everywhere.
- `/admin/login` → `/admin` (dashboard: Product & Pricing, Order
  Management, Affiliate Management, and Customisation Quotes are active
  modules; Promotion and Reports & Analytics remain disabled "Coming
  Soon" placeholders).
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

## Customisation Studio (spec v5 addendum)

- A third pillar alongside Aurielle Collection and Atelier Supply:
  made-to-order UV DTF printing. **Quote-based, not commerce** -- no
  cart, no Stripe, no SKUs, no prices. Gated behind
  `CUSTOMISATION_STUDIO_ENABLED` in `src/config/studio.ts`, which turns
  off the pillar's nav link, `/studio` page, and homepage
  band/spotlight together; every other pillar is unaffected either way.
- `/studio`: static content (same pattern as `/about`/`/business`, no
  DB read) built per
  [`docs/spec/AURIELLE_STUDIO_PAGE_SPEC.md`](docs/spec/AURIELLE_STUDIO_PAGE_SPEC.md)
  into a full visual page: hero, a finishes strip (`FinishTile`, hover/
  tap reveal), then the 4 curated groupings
  (`src/lib/data/studio-groupings.ts`) -- Luxury Packaging & Branding,
  Personal Gifts, Business Solutions, Industrial Printing -- each
  rendered by `StudioGroupingGallery`: an alternating-side image that
  swaps to a per-item real photo (`itemImages`) when you click an item
  chip, like a product gallery, and a "Request a Quote" button that
  carries whichever item is currently selected to prefill the quote
  form. A "How It Works" stepper (`StudioStepIcon`, line-art only, no
  photos needed) follows, then the quote form and a sticky "Request a
  Quote" button on scroll. Editing the groupings/items/finishes means
  editing those data files and redeploying -- no CMS, per spec.
  **Recent Work (a standalone real-photo gallery) is intentionally
  omitted** even though real photos now exist for two groupings (Luxury
  Packaging & Branding, Personal Gifts): the per-item gallery above
  already shows that work in context, and Business Solutions /
  Industrial Printing don't have per-item photos yet, so a separate
  gallery would be uneven. Image slots without a real photo yet (the
  Business Solutions grouping image and its items) render as a labeled
  placeholder block (`StudioImageSlot`) naming the slot, canvas size
  and aspect ratio, per the spec's own placeholder convention, so
  what's still needed from the client is obvious at a glance rather
  than silently missing.
- `src/lib/analytics.ts`: a `track()` stub (no provider wired up yet,
  same as the rest of the site -- see "What's scaffolded vs. not yet
  built"). Fires `Studio Category Clicked` on chip click and `Quote
  Requested` on submit, ready to report the moment a real provider
  (GA4, Meta Pixel, etc.) is dropped in.
- The homepage's two-door pillar band ("A World of Fragrance") becomes
  a three-door band with a Studio card when the flag is on; a new
  "Studio Spotlight" section (luxury face only -- the other three
  groupings stay inside `/studio`, never the homepage) sits right
  after the Atelier introduction section.
- Quote requests write to `customisation_quotes`
  (`0012_customisation_studio.sql`) via `POST /api/studio-quote`, same
  shape as the order/inquiry write routes: validates name/email,
  uploads an optional artwork/logo file to the private
  `customisation-artwork` Storage bucket (mirrors `payment-proofs`),
  everything wrapped in `withErrorHandling`.
- Admin: `/admin/customisation-quotes`, a plain list view (same table
  pattern as Affiliate Management) showing contact details, grouping/
  item of interest, quantity, message, and the artwork file via a
  300-second signed URL (same on-demand-signing pattern as order
  proof-of-payment), never a persistent public link.

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

`.github/workflows/deploy.yml` runs the same `npm run cf:deploy` from
GitHub Actions on every push to this branch (plus a manual
`workflow_dispatch` trigger), so a deploy doesn't need anyone's terminal
or a live Codespace. Needs six repository secrets set once (GitHub →
repo → Settings → Secrets and variables → Actions): the same five above
plus `CLOUDFLARE_API_TOKEN` (dashboard → profile icon → My Profile →
API Tokens → Create Token → "Edit Cloudflare Workers" template). The
workflow passes the five Supabase/Cloudinary secrets as real `env:`
vars on the build step (not just a written `.dev.vars` file) because
`initOpenNextCloudflareForDev()` only loads `.dev.vars` inside `next
dev` -- it's a no-op during `next build`, and the catalogue pages'
`generateStaticParams()` calls Supabase at build time via
`process.env` directly. It also sets `NEXT_PUBLIC_SITE_URL` (a literal
in the workflow file, not a secret -- it ends up in the client bundle
either way) to the commercial domain, used only for `metadataBase`
(OG image / canonical URL resolution) in `src/app/layout.tsx`.

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
