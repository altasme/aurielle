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
- `/admin/login` → `/admin` (dashboard: Website Management, Product &
  Pricing, Order Management, Affiliate Management, Quotes and
  Inquiries, Aurielle Mail, Promotion and Reports & Analytics are all
  active modules).
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

## Website Management (admin)

`/admin/website` lets the client edit the wording and photos on every
marketing page herself, organized one page at a time (Homepage, About,
Aurielle Collection, Atelier Supply, Customisation Studio, For Your
Business, Be an Affiliate, Contact) -- no code change, no developer,
per edit.

- `src/lib/site-content.ts` is the single source of truth for what's
  editable: one schema entry per page, each text field or photo slot
  carrying the site's current hardcoded copy as its default. Only
  **overrides** are ever written to the database
  (`site_text_fields`/`site_image_slots`, `0018_site_content.sql`) --
  a page is rendered as `override ?? default`
  (`resolvePageContent()`), so there's no migration seeded with
  hand-escaped SQL string literals for every headline on the site, and
  a field that's never been touched still renders correctly.
- The admin editor (`src/lib/admin/site-content.ts` +
  `/admin/website/[page]`) shows the exact same resolved value,
  pre-filled, whether or not it's ever been edited -- text fields as
  labeled inputs/textareas with a per-field Save and a "Reset to
  original" link, photo slots as a thumbnail plus an explicit guide
  (recommended pixel size, aspect ratio, file type, max size) so a
  non-technical client knows what to upload *before* she picks a file,
  with the same Cloudinary upload flow as Product & Pricing
  (`src/lib/admin/cloudinary.ts`).
- Every save calls `revalidatePath()` on the affected public page(s)
  immediately (the Atelier Supply capability cards are also shown on
  the Homepage, so editing them from the Atelier Supply page
  revalidates both -- see `EXTRA_REVALIDATE_PATHS`).
- Deliberately **not** covered here (kept as plain code, unchanged):
  the product catalogue itself (already its own Product & Pricing
  module), the Customisation Studio's four print-category galleries
  and finish tiles (each item there carries its own photos and is
  closer to a second catalogue than a page of copy), and a couple of
  short feature-flag-conditional sentences that embed an inline link.

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
- Admin: `/admin/quotes-and-inquiries/studio` (one of three tabs under
  the "Quotes and Inquiries" nav group, see below), a plain list view
  (same table pattern as Affiliate Management) showing contact
  details, grouping/item of interest, quantity, message, and the
  artwork file via a 300-second signed URL (same on-demand-signing
  pattern as order proof-of-payment), never a persistent public link.

## Quotes and Inquiries (admin)

Every message/quote submitted from the public site, grouped by source,
under one nav item (`/admin/quotes-and-inquiries`, three sub-pages):

- **Contact Page Inquiries** (`/contact`): writes to `contact_inquiries`
  (existed since `0001_init.sql`, had no admin view until now).
- **Business Inquiries** (`/business`): writes to `wholesale_inquiries`
  (same table, same gap).
- **Customisation Studio Inquiries** (`/studio`): the quote requests
  described above, moved from the old standalone
  `/admin/customisation-quotes` route into this group.

All three tables share `viewed_at timestamptz`
(`0013_quotes_and_inquiries.sql`), same unviewed-badge pattern as
orders (`0010`): null until an admin explicitly marks a row read via
`InquiryRowActions`, badge counts surface on the nav item (per sub-page
and summed on the parent), the dashboard module card, and the section
hub page.

### Reply via Aurielle Email

Each row has a "Reply via Aurielle Email" button (`InquiryReplyComposer`)
that opens a conversation view: the full back-and-forth for that
inquiry (`inquiry_messages`, `0014_inquiry_messages.sql`) above a
subject/message/attachments composer. Sending goes out over SMTP
through the project's z.com mailbox (`hello@auriellefragrancestudio.com`),
wrapped in a branded HTML template (`src/lib/email/reply-template.ts`),
and marks the row read.

- **`worker-mailer`** is the SMTP client (`src/lib/email/send-reply.ts`)
  -- the only one that works here, since Cloudflare Workers can't use
  Node's `net`/`tls` modules that libraries like `nodemailer` assume;
  `worker-mailer` speaks SMTP directly over `cloudflare:sockets`. It's
  imported dynamically inside the send function, not at module top
  level: a static import resolves `cloudflare:sockets` at Next's build
  time (plain Node, pre-deploy), which fails outside the real Workers
  runtime -- this bit `next build` once already (see git history).
- **Required secrets** (GitHub repo Settings -> Secrets and variables ->
  Actions), also added to `.github/workflows/deploy.yml`'s env block:
  `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`,
  `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`. Until these are set,
  `sendReplyEmail()` throws a clear "Email sending is not configured"
  error instead of failing silently -- the composer surfaces it in the
  modal.
- Every outbound reply's `Reply-To` is set to a per-inquiry address,
  `hello+<source>-<id>@auriellefragrancestudio.com`
  (`buildReplyToAddress` in `src/lib/admin/inquiry-messages.ts`) --
  that's how a customer's reply gets matched back to the right thread
  (see below), instead of guessing from the subject line or sender
  address.
- `POST /api/admin/messages/reply`: multipart form (source, id, toEmail,
  toName, subject, body, attachments[]), admin-auth gated. `source` is
  `"contact" | "business" | "studio" | "mail"` -- shared with Aurielle
  Mail (below), not just Quotes and Inquiries. Each attached file is
  read once and used two ways: base64 straight into the outgoing SMTP
  message, and a copy uploaded to the private `inquiry-attachments`
  Storage bucket so it stays visible in the thread afterward. On
  success, inserts an `inquiry_messages` row (`direction: "outbound"`)
  so the reply shows up in the conversation view immediately.
- `GET /api/admin/messages/thread?source=&id=`: returns the full thread
  for one inquiry (or Aurielle Mail message), with a short-lived signed
  URL minted per attachment (`getMessageAttachmentSignedUrl`).
- `ThreadMessages`/`ThreadReplyForm` (`src/components/admin/`): the
  avatar'd chat-bubble renderer and the subject/body/attachments
  compose box are both shared components, used by
  `InquiryThreadModal` (Quotes and Inquiries) and
  `AurielleMailClient` (below) so the two inboxes read as one
  consistent mail client rather than two designs.

### Receiving customer replies (email-worker/)

When a customer hits "reply" on an email from the admin panel, that
reply needs to land back in `inquiry_messages` as an inbound row --
not just disappear into whatever mailbox it happened to land in. This
runs on **Cloudflare Email Routing**, not on the main Next.js Worker:

- **`email-worker/`** is a small, separate Cloudflare Worker (own
  `package.json`/`wrangler.jsonc`, own `npm ci` + `npx wrangler deploy`,
  its own job in `.github/workflows/deploy.yml`) that exports an
  `email()` handler. It parses the raw MIME message with `postal-mime`,
  matches the recipient address back to `hello+<source>-<id>@...`, and
  writes straight to Supabase's REST API (`fetch`, no `@supabase/
  supabase-js` client -- keeps this Worker dependency-light) --
  inserting the `inquiry_messages` row, uploading any attachments to
  `inquiry-attachments`, and clearing `viewed_at` on the parent inquiry
  so it reopens the unread badge. A reply that doesn't match any known
  reply address (e.g. someone emailing `hello@` directly) is kept in
  `general_mail` instead of being silently dropped -- see "Aurielle
  Mail" below.
- It's a standalone Worker rather than a second entry point on the main
  Worker because the main Worker's `main` file
  (`.open-next/worker.js`) is generated by the OpenNext build on every
  deploy -- there's no stable place to hang a second `email()` export
  on it without patching the build output the same way
  `patches/@opennextjs+cloudflare+*.patch` already does for
  `cloudflare:sockets`. A separate Worker avoids that entirely.
- **Required secrets**, same idempotent `wrangler secret put` sync
  pattern as the main Worker's SMTP secrets: `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY` (reused from the existing GitHub secrets
  -- no new ones to add).
- **One-time Cloudflare dashboard setup this depends on** (not
  expressible in `wrangler.jsonc` or this repo -- do this once, by
  hand, in the Cloudflare dashboard for the zone):
  1. Deploy `email-worker` at least once (the CI job above does this
     automatically) so it exists as a Worker to route to.
  2. Cloudflare dashboard -> the zone (`auriellefragrancestudio.com`)
     -> **Compute** -> **Email Service** -> **Email Routing** -> enable
     it. Cloudflare will offer to add its own MX + related DNS records
     for the zone.
  3. **This replaces the MX record previously set up for the z.com
     webmail** -- once Email Routing owns the zone's MX, inbound mail
     to `hello@auriellefragrancestudio.com` stops reaching the z.com
     webmail inbox and is only visible in the admin panel's inquiry
     threads from then on. (Outbound sending is unaffected -- that
     still goes out through z.com via `worker-mailer`/SMTP.)
  4. Still under Email Routing -> **Settings**, turn on
     **Subaddressing** (RFC 5233 plus-addressing, opt-in, off by
     default -- see [Cloudflare's changelog](https://developers.cloudflare.com/changelog/post/2025-07-21-subaddressing/)).
     With it on, a routing rule for `hello@...` also matches
     `hello+contact-<uuid>@...`, `hello+business-<uuid>@...`, etc. --
     the full address (including the `+...` part) is preserved in
     `message.to`, which is exactly what the Worker reads to know which
     inquiry a reply belongs to. Without this setting, per-inquiry
     reply addresses wouldn't route anywhere at all.
  5. Under **Routing rules** -> **Create routing rule**: local part
     `hello`, this domain, Action **Send to a Worker** ->
     `aurielle-email-worker` -> Save. (No destination-address
     verification step needed -- that's only required for the "Send to
     an email" forwarding action, which isn't used here.)

### Aurielle Mail (admin)

A proper inbox (`/admin/aurielle-mail`) for anything sent to `hello@`
that isn't a Quotes and Inquiries reply -- direct mail from a customer,
someone replying to a person rather than a form submission, etc.
Separate nav item, separate unread badge; Quotes and Inquiries is
untouched.

- `general_mail` (`0015_aurielle_mail.sql`, renamed from `0014`'s
  `unmatched_inbound_emails`) is both the "first message" of a mail
  thread and the unread-tracking row, mirroring how `contact_inquiries`
  /`wholesale_inquiries`/`customisation_quotes` each hold their own
  original submission. `src/lib/admin/general-mail.ts`: `listGeneralMail`,
  `countUnviewedGeneralMail`, `markGeneralMailViewed`, and
  `deleteGeneralMail` (permanent -- also deletes any `inquiry_messages`
  rows recorded against it, since there's no FK to cascade through).
- Replying from Aurielle Mail reuses the exact same
  `hello+mail-<uuid>@...` reply-to / `inquiry_messages` thread
  mechanism as Quotes and Inquiries (`source: "mail"` is just a fourth
  value alongside `contact`/`business`/`studio` everywhere that
  mattered: the source check constraint, `SOURCE_TABLES` in
  `email-worker/`, and the shared `/api/admin/messages/*` routes) --
  no separate reply pipeline to maintain.
- `AurielleMailClient` (`src/components/admin/aurielle-mail-client.tsx`):
  a list + reading-pane layout (collapses to one pane at a time below
  `md`) -- clicking a message marks it read (`PATCH
  /api/admin/general-mail/[id]`) and loads its thread, "Delete" calls
  `DELETE /api/admin/general-mail/[id]` after a confirm, and a manual
  "Refresh" button re-fetches the list (there's no push/websocket path
  from the email-worker into an open browser tab, so new inbound mail
  only appears after a refresh).

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
- Not yet built: analytics/consent banner.

### Order confirmation email

On a successful `POST /api/orders`, the customer gets a branded order
confirmation (order number, line items, discounts, total, shipping
address, payment method) sent via
[Resend](https://resend.com)'s HTTP API
(`src/lib/email/send-order-confirmation.ts`,
`src/lib/email/order-confirmation-template.ts`).

- Plain `fetch` to `https://api.resend.com/emails`, no SDK -- it's a
  single JSON POST, and this avoids adding a dependency plus the
  `worker-mailer`-style Workers-runtime import headaches SMTP needed
  (see "Reply via Aurielle Email" above).
- Sender: `order@auriellefragrancestudio.com` / "Aurielle Order
  Confirmation" by default, overridable via `RESEND_FROM_EMAIL`/
  `RESEND_FROM_NAME`.
- **Required secret** (GitHub repo Settings -> Secrets and variables ->
  Actions), also added to `.github/workflows/deploy.yml`'s env block
  and synced to the Worker via `wrangler secret put`: `RESEND_API_KEY`
  (get one from the Resend dashboard). `RESEND_FROM_EMAIL`/
  `RESEND_FROM_NAME` are optional overrides. Until `RESEND_API_KEY` is
  set, order creation still succeeds -- the email send just fails
  silently from the customer's perspective and logs a "not configured"
  error server-side, same fail-open behavior as the rest of this
  project's non-critical email sends.
- Sending never blocks or fails order creation: the order is already
  committed to the database by the time the email is attempted, so a
  Resend error is only logged, not surfaced to the customer.

## Promotions (admin)

Two independent mechanisms per business line (`/admin/promotions`),
never both applied to the same order:

- **Product Promotions** (`promotions` + `promotion_products` +
  `promotion_product_types`, `0016_promotions.sql`): admin picks fixed
  or percent off, specific products, and (Atelier Supply only) whole
  item groups (`product_types`) too. Applies automatically at
  checkout, no code needed. A product matching more than one active
  promotion (direct match and/or via its group) gets whichever gives
  the larger discount -- never both at once.
- **Discount codes** (`discount_codes`): a short (<=6 character) code
  the customer types in at checkout, fixed or percent off the whole
  order. Scoped per category (`unique (category, code)`) so the same
  code text can exist independently for Collection and Atelier Supply.
  A valid code always overrides any auto-applied Product Promotions
  for that order -- the two never stack.
- Both share the same "is this currently usable" shape: an `enabled`
  toggle on top of a `starts_at`/`ends_at` range and an optional
  `max_uses` cap (checked against `used_count`, incremented atomically
  via the `increment_promotion_usage`/`increment_discount_code_usage`
  Postgres functions once per order -- reserved at order creation, not
  released if the order is later cancelled), plus an optional
  `min_spend` and admin-only `internal_notes`.
- `src/lib/promotions/apply.ts` (server-only) is the single source of
  truth for pricing a cart: `applyProductPromotions()` picks the
  best-matching promotion per line, `validateDiscountCode()` checks a
  code against a subtotal. Used by both `POST /api/checkout/quote`
  (public, live pricing preview as the checkout page renders) and
  `POST /api/orders` (re-validates and applies for real -- never
  trusts a client-submitted discount amount, same principle as
  re-deriving price/name from the catalogue by slug).
- `orders.promotion_discount_total`/`discount_code_id`/
  `discount_code_amount` and `order_items.promotion_id`/
  `promotion_discount_amount` record what actually applied, surfaced
  on the admin order detail page, the customer's order-lookup, and the
  checkout confirmation screen.

## Reports & Analytics (admin)

`/admin/reports` -- one dashboard per business line (Aurielle Collection /
Atelier Supply, since they trade in different currencies and should
never be summed together), filterable by a date-range preset (Last 7/30/90
Days, Month to Date, Year to Date, All Time). Built entirely from the
existing `orders`/`order_items`/`promotions`/`discount_codes` tables --
no new schema.

- `src/lib/admin/report-ranges.ts`: resolves a preset into a
  `{from, to}` window plus an equal-length `{previousFrom, previousTo}`
  window immediately before it, so KPI tiles can show a vs-last-period
  delta rather than just a snapshot number.
- `src/lib/admin/reports.ts`: `getBusinessLineReport()` fetches one
  business line's orders (current + previous period, one query) and
  aggregates in application code -- **Confirmed Revenue** (paid,
  non-cancelled orders only, not just placed -- this is the number that
  reflects money actually collected), Orders Placed, Average Order
  Value, Pending Verification value (cash awaiting proof-of-payment
  confirmation), Discounts Given (as a % of gross sales -- the real
  cost of running promotions), Cancelled orders, a revenue trend chart,
  order/payment status breakdown, Top Products by net revenue,
  **Product Promotions and Discount Codes performance** (usage count +
  discount given per promotion/code within the selected range --
  whether a campaign is actually worth running), and orders by country.
  `getCustomerInsights()` is deliberately all-time, not range-scoped --
  repeat-purchase rate needs the full order history to mean anything
  for a boutique's order volume. `getLeadsSnapshot()` counts Contact/
  Business/Studio inquiries and affiliate applications in range as a
  top-of-funnel demand signal alongside the sales numbers.
- Every order set is scoped to its **dominant currency** (the currency
  most of that range's orders were placed in); anything in a different
  currency is called out separately rather than silently summed in.
- `src/components/admin/revenue-trend-chart.tsx`: a dependency-free
  inline-SVG column chart (no charting library -- consistent with this
  project's minimal-dependency, Workers-compatible approach elsewhere)
  with a hover/focus tooltip.

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
