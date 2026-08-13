# AURIELLE PARIS ATELIER
## MVP WEBSITE SPECIFICATION — v4 (Phase-recalibrated)

---

## WHY v4 EXISTS

The v3 "MVP" had quietly grown into a full ecommerce platform: two live-DB carts, Stripe + GCash + bank transfer, an admin CMS, and order management. That is a Phase-2 body of work wearing an MVP label. The first production build confirmed it by failing on the heaviest, most fragile part — a dynamic route pulling Supabase **at build time**:

```
Error: Failed to collect page data for /atelier-supply/[slug]
[cause]: supabaseUrl is required.
  at module evaluation (src/lib/data/supply-materials.ts:1:1)
  > import { supabase } from "@/lib/supabase/client";
```

v4 draws a clean line. The catalogue is a few hundred near-static records that have no business hitting a live database — least of all during `next build`. So Phase 1 **splits reads from writes**: catalogue is static, the database only *receives* orders. This kills the entire error class, makes the site fast for mobile-social traffic, and cuts the Phase-1 surface area dramatically.

---

## DECISIONS LOCKED (v4)

Carries forward all v3 decisions; adds two.

1. **Merchant model** — client is seller & merchant of record. Commission is offline; website orders must be uniquely identifiable + exportable (`orders.source = "website"`).
2. **Supply = smell-alike oils; designer names are ALIAS-ONLY** — `search_aliases` indexed, never displayed anywhere.
3. **Currency = Option A** — perfumes (₱/€) and supplies (USD/KG) never share a cart or a transaction. Two separate flows. FX conversion is Phase 2.
4. **Hosting** — Cloudflare Pages.
5. **[v4] Reads are static, writes go to Supabase.** The perfume + supply catalogues ship as **build-time static data** generated from the approved CSV. No Supabase on any read path. Supabase is used **only** to write order and inquiry records at request time.
6. **[v4] Order path = manual order (Kolekta pattern).** No Stripe in Phase 1. Order record → payment instructions (GCash / bank transfer) → proof-of-payment upload → offline verification by the team. Real, trackable orders with zero checkout-engine complexity.

---

## PHASE SPLIT (this is the spine of v4)

### PHASE 1 — ACTIVE SCOPE: launch the brand, capture demand, prove the funnel

- Marketing pages: Home · About · Business/Wholesale · Contact
- **Aurielle Collection** — browsable display (image, scent profile, price)
- **Atelier Supply** — searchable catalogue (USD/KG, alias-only search)
- Catalogue served from **static bundled data** (no DB reads)
- Lightweight per-unit cart (B2C and B2B, kept separate)
- **Manual order flow (Kolekta):** GCash / bank transfer + proof upload + offline verification
- Order & inquiry writes to Supabase; proof files to storage
- Guest order-lookup (no customer accounts)
- Analytics + Meta Pixel (+ consent banner if EU traffic expected)
- Catalogue maintained by **re-import + redeploy** — no admin CMS

### PHASE 2 — DEFERRED (fully specified, not built)

- Automated **Stripe** checkout
- **Admin CMS** for client self-service product/price/image management
- Order dashboard beyond CSV export; payment reconciliation UI
- **Live DB-backed catalogue** (if/when the catalogue grows or needs frequent edits)
- Dynamic **FX conversion** (display layer, rate locked + stored on order)
- EU **VAT** / reverse charge · **shipping** calc + carrier rules · curated **category filters** · **MOQ** enforcement

### The seam between phases

A single config constant governs order behaviour so Phase 2 activation needs **no Phase 1 rebuild** (same approach as Vocalyze):

```ts
// src/config/commerce.ts
export const COMMERCE_MODE: "manual" | "stripe" = "manual"; // P1 = manual (Kolekta); P2 = stripe

export const CATALOGUE_SOURCE: "static" | "supabase" = "static"; // P1 = static; P2 = supabase
```

Checkout and catalogue-read code branch on these two constants only. Flipping them (plus wiring the Stripe/CMS modules) is the whole of the Phase-2 switch-on for these features.

---

## ARCHITECTURE (Phase 1)

```
                        ┌──────────────────────────────┐
   BUILD TIME           │  approved CSV (perfumes +     │
                        │  materials, incl. aliases)    │
                        └───────────────┬──────────────┘
                                        │ generate:catalogue script
                                        ▼
                        ┌──────────────────────────────┐
                        │  src/data/*.generated.ts      │  ← static, bundled
                        │  (typed perfume + material     │
                        │   records)                     │
                        └───────────────┬──────────────┘
                                        │ imported by pages,
                                        │ generateStaticParams,
                                        │ generateMetadata
                                        ▼
   REQUEST TIME (READ)  ┌──────────────────────────────┐
                        │  Static pages / search / PDPs │  ← NO Supabase
                        └──────────────────────────────┘

   REQUEST TIME (WRITE) ┌──────────────────────────────┐
                        │  Order + inquiry submission    │ ──► Supabase (write only)
                        │  Proof-of-payment upload       │ ──► Storage
                        └──────────────────────────────┘
```

**Rules that make this hold:**

- No module on a **read** path may import the Supabase client. Catalogue data comes only from `src/data/*.generated.ts`.
- `generateStaticParams` / `generateMetadata` read the **static** data, never a client. (This is the exact fix for the build failure.)
- The Supabase client is instantiated **lazily**, inside the write handlers only — never at module top-level — so importing a type never spins up a client:

```ts
// src/lib/supabase/server.ts  — write path only
let _client: SupabaseClient | null = null;
export function getSupabase() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // server-only
  if (!url || !key) throw new Error("Supabase env missing at request time");
  _client = createClient(url, key);
  return _client;
}
```

- Env vars for writes live in the Cloudflare **runtime** environment; **no** `NEXT_PUBLIC_SUPABASE_*` is needed at build, because nothing reads Supabase at build anymore.

---

## 1. BRAND DIRECTION

AURIELLE PARIS ATELIER — French-inspired luxury fragrance, craftsmanship, accessibility.

Keywords: Elegant · Feminine · Refined · Parisian · Premium · Soft luxury · Boutique · Editorial · Warm · Sophisticated.

Primary: Ivory / soft white · Warm beige · Champagne gold. Secondary: Deep burgundy · Soft taupe · Warm brown.
Avoid: corporate blue · heavy black ecommerce · excessive gradients · neon · generic Shopify look.

---

## 2. CORE BUSINESS STRUCTURE

Two commercial sides, deliberately separate.

**A. Aurielle Collection (B2C)** — finished perfumes for consumers/gift buyers. Names, prices, sizes, descriptions come from the client.

**B. Atelier Supply (B2B)** — smell-alike materials for perfumers/businesses, USD/KG. **Designer names are alias-only** (§10, §13a).

---

## 3. SITE MAP (Phase 1)

```
HOME
├── AURIELLE COLLECTION
│   ├── All Perfumes            [static]
│   ├── Product Detail          [static]
│   └── Order (B2C, manual)     [write → Supabase]
├── ATELIER SUPPLY
│   ├── All Materials + Search  [static]
│   ├── Material Detail         [static]
│   └── Order (B2B, manual)     [write → Supabase]
├── ABOUT
├── BUSINESS / WHOLESALE        [inquiry → Supabase]
├── CONTACT                     [inquiry → Supabase]
└── /order-lookup               [guest lookup: order # + email]
```

Header: LOGO · Collection · Atelier Supply · About · Business · Contact · [Cart]. Mobile: Logo — Menu.

Two independent carts; a perfume and a material never share a cart.

---

## 4. HOMEPAGE

HERO — editorial fragrance image. Headline **THE ART OF FRAGRANCE**. Copy: a fragrance house creating refined perfumes and supplying quality materials worldwide. CTAs: **EXPLORE THE COLLECTION** / **EXPLORE ATELIER SUPPLY**.

---

## 5. INTRODUCTION — A WORLD OF FRAGRANCE

Short brand story + the two sides.
**AURIELLE** → DISCOVER AURIELLE. **ATELIER** → EXPLORE SUPPLY.

---

## 6. AURIELLE COLLECTION SECTION

Heading **THE AURIELLE COLLECTION**; sub: *Fragrance oils crafted to become part of your signature.* Grid: desktop 3–4/row, mobile 2/row. Large imagery, minimal UI. Card: image · name · scent tags · VIEW FRAGRANCE.

---

## 7. PERFUME PRODUCT PAGE `[P1: static]`

Gallery (hero + bottle/lifestyle/packaging). Name, short description. Scent profile tags. Details: Size [client] · Perfume Oil · Alcohol-Free · Made in France (**only client-confirmed claims**). Price ₱/€. CTA **ADD TO CART** → B2C cart.

---

## 8. ATELIER SUPPLY PAGE

Hero **ATELIER SUPPLY** — materials for creators, perfumers, businesses. CTA **BROWSE MATERIALS**.

---

## 9. SUPPLY CATALOGUE `[P1: static + client search]`

Database-driven in principle, **served static** in Phase 1. Records carry serial number, production name, USD/KG price, and hidden aliases.

Search + filter + sort run **client-side over the bundled dataset** (a few hundred records — trivially fast, no API). Card: name · sub-label · `USD 71.22 / KG` · VIEW.

---

## 10. SUPPLY SEARCH `[P1]`

Client-side match against: English name · original name · alternative name · **`search_aliases` (matched, never displayed)** · product number.

Alias-only behaviour: query `Sauvage` → returns **Fast Break**; results/cards/PDP/URL/meta/alt-text **never echo** the designer name.

Do not auto-merge duplicates (§23).

---

## 11. SUPPLY FILTERS `[P1: All / Search / Sort]`

Category chips are **deferred** — no auto-categorisation from names. Ship **All / Search / Sort**; curated categories are Phase 2 once the client classifies.

---

## 12. SUPPLY PRODUCT DETAIL `[P1: static]`

Name · sub-label · `USD 71.22 / KG` · Product Type: Fragrance Material · Unit: Kilogram. CTA **REQUEST / ORDER** → B2B cart.

---

## 13. PRICING RULE

Display customer-facing price **with unit**: `USD 71.22 / KG`, never `$71.22`.

## 13a. ALIAS-ONLY DISPLAY RULE (hard rule)

Public name = neutral/original only. Designer names live **only** in `search_aliases`: indexed, searchable, never printed on any card, PDP, cart line, meta, slug, or alt text. No "inspired by" hints unless the client explicitly asks.

---

## 14. FLEXIBLE PRICING MODEL

`price` · `currency` · `pricing_unit` (e.g. `71.22 · USD · KG`; also LITER/UNIT). Carried in the static record and copied onto the order line at add-to-cart.

---

## 15. ORDER FLOW — MANUAL (KOLEKTA PATTERN) `[P1]` **[v4]**

Two independent flows (B2C ₱/€, B2B USD/KG). No Stripe. No currency mixing.

```
Browse → Product → Add to Cart → Cart → Checkout (details) →
Choose payment (GCash / Bank Transfer) → See instructions →
Upload proof of payment → Order submitted →
[team verifies offline] → status updated
```

- Order record is created on submission with status **`pending_verification`**.
- Cart/line values are snapshotted onto the order (name, price, currency, unit, qty, subtotal) so later catalogue edits never alter historical orders.
- Governed by `COMMERCE_MODE = "manual"`; Phase 2 flips to `"stripe"` behind the same checkout entry point.

---

## 16. PAYMENT METHODS (Phase 1)

- **GCash** (PH) — QR / send-to instructions → upload proof.
- **Bank Transfer** (EU/intl) — Bank · Account Name · Account No. · IBAN / SWIFT → upload confirmation.
- **Stripe** — Phase 2.

Method availability controlled by market. Exact GCash/bank details from the client.

---

## 17. PAYMENT MVP `[P1]`

Manual verification only. Payment instructions are static config (`src/config/payment.ts`) — QR image, bank block — no payment API. Proof upload → Supabase Storage (or Cloudflare Images), path stored on the order.

---

## 18. CHECKOUT INFORMATION

Customer: full name · email · phone · country. Billing: address · city · state/province · postal · country. Shipping: "same as billing" checkbox. Shipping **cost** = Phase 2.

---

## 19. ORDER CONFIRMATION

**THANK YOU FOR YOUR ORDER** — received; verifying payment. Show: order number, items, qty, total, currency, payment method, email, and **where to check status** (`/order-lookup`). Send confirmation email (Resend for testing; SES when live).

---

## 20. COMMISSION TRACKING `[P1]`

Client is merchant of record; commission reconciled offline. Order record:

Order ID · Customer · Email · Country · Products (snapshot) · Quantity · Subtotal · Shipping · Total · Currency · Payment Method · **Payment Status** · **Order Status** · **`source` = "website"** · **`proof_url`** · Created At.

Admin need for Phase 1 = **CSV export of orders by date range** (a simple authed route or a Supabase view export). No dashboard.

---

## 21. ADMIN / CMS `[P2 — NOT in Phase 1]`

No CMS in Phase 1. Catalogue changes = edit the source CSV → run `generate:catalogue` → redeploy (managed by the team). The full add/edit/price/image/alias CMS is Phase 2.

---

## 22. CATALOGUE IMPORT / GENERATION `[P1]` **[v4]**

Hundreds of entries → generated, not hand-coded. Build step:

```
CSV (approved)  ──►  scripts/generate-catalogue.ts  ──►  src/data/*.generated.ts
```

CSV columns:

```
name,description,price,currency,unit,serial_number,search_aliases
Fast Break,Fast Break fragrance,71.22,USD,KG,1,"Dior Sauvage"
Wild Bluebell Fragrance,,72.12,USD,KG,2,""
```

`search_aliases` is bundled for **search only**, never rendered. Runs as a `prebuild` step so a bad/missing CSV fails loudly and locally — never at deploy in a way that half-ships. Import from source only after client approval.

> Reality check: cleaning the messy PDF export (four name variants each, known duplicates, no categories) into this CSV is the real work — not a one-click step. It happens **before** the build, on your side.

---

## 23. DUPLICATE HANDLING

Preserve repeated/similar source records at their own prices. **Do not auto-consolidate** until the client confirms "these are duplicates; use this price."

---

## 24. ABOUT PAGE

Our Story · The Atelier · Our Philosophy · Craftsmanship · Made in France. Client-approved facts only.

## 25. BUSINESS / WHOLESALE `[P1: inquiry write]`

**FOR YOUR BUSINESS** — CTA **TALK TO THE ATELIER**. Form: Name · Business · Email · Country · Material interest · Est. quantity · Message → inquiry write to Supabase.

## 26. CONTACT `[P1: inquiry write]`

Luxury layout: Email · Social · Location · form (Name · Email · Country · Inquiry type · Message) → Supabase.

## 27. SOCIAL PROOF

Reuse existing marketing/photography (confirm rights). Sections like **THE AURIELLE EXPERIENCE**. Don't overload the homepage.

---

## 28. DESIGN SYSTEM

Headings — serif (Cormorant Garamond / Playfair Display / Libre Baskerville). Body — sans (Inter / Manrope / DM Sans). Script accent sparingly; never for body or nav.

## 29. COMPONENT STYLE

Thin-border buttons, minimal radius; no huge pills, heavy shadows, or SaaS cards. Editorial catalogue feel, not Amazon.

## 30. MOBILE-FIRST (priority #1)

Traffic from FB/IG/TikTok/messaging. Mobile home: Logo/Menu → HERO → Explore Collection → Atelier Supply → Featured Perfumes → Why Aurielle → Business CTA → Footer. PDP: Image → Name → Price → Scent → Description → CTA.

## 31. CART `[P1]`

Persistent icon. **Two independent carts** (B2C/B2B), never combined. Client-side state (localStorage). Supply line shows per-KG unit price, not line total:

```
Fast Break — 2 KG — USD 142.44
```

## 32. QUANTITY LOGIC

Supply quantity = pricing unit. `USD 71.22 / KG × 2 = USD 142.44`. **MOQ not invented**; enforce only if client sets one (Phase 2 for enforcement UI).

## 33. PERFUME VS SUPPLY UX

B2C: Emotion → Desire → Purchase. B2B: Need → Search → Evaluate → Order. The cart/checkout separation is the structural expression of this.

---

## 34. SEO `[P1: fully static — ideal]`

Static pages pre-render cleanly (no DB at build). URLs:

```
/  /collection  /collection/[slug]  /atelier-supply  /atelier-supply/[slug]
/about  /business  /contact  /order-lookup
```

Per product: SEO title · meta · clean URL · structured data. Supply slugs/metadata use the **neutral name only**.

## 35. PERFORMANCE

Static catalogue = fast first load, minimal JS, CDN-native on Cloudflare Pages. Optimised/responsive images, lazy loading. No animation-for-animation's-sake.

## 36. ANALYTICS `[P1]`

GA + Meta Pixel. Events: View Product · View Supply Material · Add To Cart · Begin Checkout · **Order Submitted** · Contact · Wholesale Inquiry.

> **Purchase-event note (consistent with Lean & Fit):** because payment is verified offline, the conversion event fires on **order submission**, not verified payment. Rationale documented here so pixel numbers are read correctly. A verified-payment event can be added in Phase 2 with Stripe.

EU consent banner required before pixels fire for EU visitors.

---

## 37. TECH STACK

Frontend Next.js · Tailwind · **catalogue static (build-generated)** · Supabase (**writes only** + Storage) · Supabase Auth (only if an authed export route is added) · **Stripe = Phase 2** · **Cloudflare Pages** · Images: Cloudflare Images / Supabase Storage.

## 38. PHASE 1 EXPLICITLY EXCLUDES

❌ Stripe / automated checkout · ❌ Admin CMS · ❌ Live DB catalogue reads · ❌ Order dashboard · ❌ FX conversion · ❌ VAT engine · ❌ shipping calc/carriers · ❌ customer accounts · ❌ curated category filters · ❌ MOQ enforcement UI · ❌ reviews/loyalty/subscriptions/recommendations/multi-language.

All → Phase 2.

---

## 39. PHASE 1 DELIVERABLE

Brand: premium identity, responsive, mobile-first. Commerce: static perfume + supply catalogues · alias-only search · two carts · two **manual** checkouts (GCash + bank transfer + proof upload) · order confirmation · guest order-lookup. Writes: orders + inquiries to Supabase, proof to storage. Tracking: GA + Pixel + documented events + consent banner. Maintenance: CSV → generate → redeploy.

## 40. PHASE 1 IN ONE SENTENCE

A fast, mobile-first luxury fragrance site that presents the Aurielle perfume collection and a searchable USD/KG smell-alike supply catalogue from **static data**, takes **manually-verified orders** (GCash / bank transfer + proof upload) written to Supabase, tags every order for commission, and hides all designer names as search-only aliases — with Stripe, a CMS, and a live-DB catalogue wired behind two config constants for a no-rebuild Phase 2.

---

## KEY ARCHITECTURAL DECISION (v4)

```
AURIELLE — PHASE 1
│
├── READS (static, no DB) ───────────────────────────────
│   ├── Perfume collection      (₱/€ display)
│   └── Atelier Supply          (USD/KG, alias-only search)
│         src/data/*.generated.ts  ← from approved CSV at build
│
├── WRITES (Supabase, request-time only) ────────────────
│   ├── Orders  (source="website", snapshotted lines, proof_url)
│   └── Inquiries (contact + wholesale)
│
├── ORDER MODE = "manual"  (Kolekta) ────────────────────
│   GCash / Bank Transfer → proof upload → offline verify
│
└── PHASE-2 SEAM (config only) ─────────────────────────
    COMMERCE_MODE  : "manual"  → "stripe"
    CATALOGUE_SOURCE: "static" → "supabase"
    + Admin CMS, FX, VAT, shipping, category filters
```

*Hosting: Cloudflare Pages · Catalogue: static · DB: Supabase (writes only) · Payments: manual (Stripe = P2)*
