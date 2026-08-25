# AURIELLE PARIS ATELIER
## SPEC v5 — CUSTOMISATION STUDIO ADDENDUM

> **This is an addendum to v4, not a rewrite.** v4 remains the base spec. v5 adds a **third pillar** (the Customisation Studio) onto the architecture v4 was built to extend. The perfume Collection, Atelier Supply, the cart, the manual Kolekta checkout, the static-read/DB-write split, hosting, and the admin panel are **unchanged**. Read this as "what we add + the one page we reframe," nothing more.

---

## WHY v5 EXISTS

The client (Jewel) bought an **A3 UV DTF printer** and wants to launch a full **custom UV-printing business** under the Aurielle brand — ~14 raw categories, 100+ item types. She chose **Idea #2**: keep the same site design/structure, reorganise to add the services, one admin panel — with the Customisation Studio **visible up front** (*"mas makikita agad ang luxury customisation studio"*).

The correct build is a **quote-based showcase**, not a priced product catalogue with a cart. Every item is made-to-order UV printing: no SKUs, no fixed prices, no inventory, and no finished products yet (printer just acquired). So the Studio rides the **inquiry write-path already built for Contact + Wholesale** — it adds one page, one inquiry type, one nav entry, and one admin view. It touches none of the commerce layer.

---

## SCOPE MATRIX — what changes, what's frozen

| Area | v5 status |
|---|---|
| Homepage hero + a new three-pillar band | **REFRAMED** (content/layout, one page) |
| New Customisation Studio page | **ADDED** (static content) |
| New inquiry type `customisation_quote` + artwork upload | **ADDED** (rides existing write-path) |
| Nav: one new item | **ADDED** |
| Admin: one new "Customisation Quotes" list view | **ADDED** |
| Pillar/section naming pass | **RESOLVED** (pending client sign-off) |
| `CUSTOMISATION_STUDIO_ENABLED` config flag | **ADDED** |
| Perfume Collection (pages, PDP, cart, checkout) | **FROZEN** |
| Atelier Supply (catalogue, alias search, cart, checkout) | **FROZEN** |
| Manual Kolekta order flow, order schema, `orders.source` | **FROZEN** |
| Static-read / writes-only-Supabase architecture | **FROZEN** |
| `generate:catalogue` pipeline, Cloudflare Pages, config seam | **FROZEN** |
| Stripe, admin CMS, live-DB catalogue | **STILL Phase 2** |

**The line to hold:** if the ask ever drifts to "give the Studio its own priced catalogue and cart," that is a *real* restructure (rebuilding commerce a third time) and belongs in a separate scoped decision — not this addendum.

---

## DECISIONS LOCKED (v5)

1. **Idea #2 confirmed** — one site, same structure, reorganised; one admin panel; Studio prominent.
2. **Studio = quote-based showcase, not commerce.** No cart, no Stripe, no SKUs, no prices. "Request a quote" → inquiry.
3. **Homepage reframed to the maison.** Hero shifts from "fragrance" identity to the *house of craft* with three pillars; fragrance is one expression, not the whole brand. (`atelier` = workshop, which is the bridge.)
4. **Studio surfaces its luxury face on the homepage only.** Premium items (perfume packaging, metal labels, acrylic awards, cosmetic branding) appear on the front door; downmarket items (fridge magnets, PVC cards, laptop stickers) live *inside* the Studio page, never on the homepage.

---

## ★ BLOCKING INPUTS (need client sign-off before build)

- **★1 — Hero tagline.** Moving the identity off "fragrance" is a brand decision. Placeholder: *"Fragrance · Craft · Customisation."* Alternative anchored in her own words: *"Where personalisation meets craftsmanship."* Client picks.
- **★2 — Pillar order.** Default is Collection → Supply → Studio (perfume-first, protects the established luxury brand). Leading with the Studio pushes the "Paris Atelier prints laptop stickers" brand risk harder. Client confirms order.
- **★3 — Naming.** Resolve the two-"Atelier" collision and the "Luxury Collection" clash (see Naming below). Client approves final labels.
- **★4 — Real assets.** No portfolio exists for Studio categories yet. Launch with brand-styled category cards + representative iconography + the quote form — **no fabricated sample photos** presented as her work (launch-integrity rule). Real gallery added as pieces are produced.
- **★5 — Brand containment.** Confirm the Studio stays a clearly-branded sub-section under the maison rather than overtaking the perfume front door.

---

## NAMING RESOLUTION (pending ★3 sign-off)

**Three pillars:**

| Pillar | Public label | Audience | Flow |
|---|---|---|---|
| Perfumes | **The Collection** | B2C | buy (cart, manual checkout) |
| Materials | **Atelier Supply** | B2B | search → order (cart, manual checkout) |
| UV printing | **Customisation Studio** | B2B/B2C | request a quote (inquiry) |

- Only **one** "Atelier" survives in the nav (Atelier Supply). The UV pillar is **"Customisation Studio"**, not "Aurielle Atelier," to avoid collision.
- Jewel's suggested internal grouping **"Luxury Collection"** collides with "The Collection." Rename to **"Luxury Packaging & Branding."**

---

## HOMEPAGE RESTRUCTURE (one page — the only reframed surface)

New mobile stack (top → bottom):

1. **Nav** — Logo · Menu (+ one new item: Customisation Studio)
2. **HERO — the maison** — brand-level headline (★1 tagline), two CTAs. *No longer "THE ART OF FRAGRANCE."*
3. **THREE PILLARS band** (`sa unahan`, before featured perfumes) — three doors: The Collection · Atelier Supply · Customisation Studio, each routing to its own world/UX.
4. **Featured perfumes** — 2-up grid (unchanged content).
5. **Studio spotlight** — curated **luxury face only**: perfume bottle printing, metal labels, acrylic awards, cosmetic packaging. (Not fridge magnets.)
6. **Why Aurielle** — craftsmanship story; the through-line tying fragrance + custom printing into one house.
7. **Business / quote CTA** — "Talk to the atelier."
8. **Footer.**

Everything below the hero that already existed keeps working; the two additions are the **three-pillar band** and the **Studio spotlight** section.

---

## CUSTOMISATION STUDIO PAGE `[P1: static + quote]` — ADDED

Route: `/studio` (or `/customisation` — ★3). Static content, no DB reads, same page pattern as About/Business.

### Information architecture — four groupings (Jewel's own, renamed per ★3)

The 14 raw categories collapse into four curated groupings so it reads as a luxury house, not a hardware catalogue:

| Grouping | Surfaces on homepage? | Maps from raw categories |
|---|---|---|
| **Luxury Packaging & Branding** | ✅ yes (spotlight) | Perfume & Beauty (bottles, cosmetic packaging, metal/mini labels, brand plates), Acrylic awards, Crystal/UV luxury stickers |
| **Personal Gifts** | ➖ inside page only | Phone/electronics cases, Home decoration, Wedding & event, Souvenirs, Fashion accessories |
| **Business Solutions** | ➖ inside page only | Corporate gifts, Restaurant & hospitality, Cards (PVC/loyalty/access), Acrylic signage, QR displays, name plates |
| **Industrial Printing** | ➖ inside page only | Metal printing, Small plastics, Custom manufacturing (prototype/small-batch/private-label), labels, tags |

Each grouping = a section with a short intro + representative item chips (text/iconography, ★4 no fake photos) + a **"Request a quote"** CTA. The full item list per grouping is static content, editable via CSV re-import + redeploy (no CMS — consistent with v4).

> Content maintenance: grouping/item content ships from a `studio-services.csv` through the same `generate:catalogue` prebuild step. Same pipeline, new data file.

---

## QUOTE INQUIRY FLOW `[P1: write]` — ADDED

Reuses the Contact/Wholesale write-path. No cart.

```
Studio page → pick grouping/item → "Request a quote" →
Quote form → submit → inquiry record (type="customisation_quote") → Supabase
                                    ↓
                     artwork/logo file → Storage (proof-of-artwork)
                                    ↓
              confirmation + /order-lookup-style acknowledgement
```

**Quote form fields:** name · email · phone · country · grouping/item of interest (prefilled from context) · description of request · approx. quantity · message · **artwork/logo upload** (client needs the customer's file to quote).

**Schema (extends existing `inquiries`, no new table):**

- `inquiry_type` — add value `"customisation_quote"` (alongside `contact`, `wholesale`)
- `attachment_url` — artwork/logo upload path (reuse if wholesale already has it; else add once, shared)
- `context` — grouping/item the request came from (string or small JSON)
- existing fields: name, email, phone, country, message, created_at, `source="website"`

Analytics: fire **`Quote Requested`** on submission (consistent with the submission-not-verified convention documented in v4 §36).

---

## CONFIG / PHASE SEAM — ADDED

```ts
// src/config/studio.ts
export const CUSTOMISATION_STUDIO_ENABLED = true;   // pillar + page + nav + homepage band
export const STUDIO_MODE: "quote" = "quote";        // P1 = quote-only; a future "commerce" mode is a separate scoped decision, NOT implied
```

Consistent with v4's `COMMERCE_MODE` / `CATALOGUE_SOURCE`. The flag gates the whole pillar; existing pillars are untouched whether it's on or off.

---

## ADMIN ADDITION — ADDED

One new authed list view: **Customisation Quotes** — the existing inquiries list filtered to `inquiry_type = "customisation_quote"`, showing customer, grouping/item, quantity, message, and the artwork attachment link. Same **CSV export by date range** as orders/inquiries. No new admin infrastructure; no CMS.

---

## ASSET & BRAND INTEGRITY (launch-integrity rule)

- No fabricated Studio portfolio. Category cards use brand-styled iconography + representative language until real work exists (★4).
- Homepage shows the Studio's premium face only; downmarket items stay inside the page (Decision 4).
- Craftsmanship framing is the through-line that keeps fragrance + UV printing coherent as one maison (★5).

---

## WHAT STAYS FROZEN (explicit)

Do not modify while building v5:

- `The Collection` pages, PDP, B2C cart, B2C checkout
- `Atelier Supply` catalogue, `search_aliases` behaviour, B2B cart, B2B checkout
- Manual Kolekta order flow, `orders` schema, `orders.source`, guest `/order-lookup`
- Static-read architecture, lazy writes-only Supabase client, `src/data/*.generated.ts`
- `generate:catalogue` prebuild, Cloudflare Pages config, `COMMERCE_MODE` / `CATALOGUE_SOURCE`

New code lives alongside these: `/studio` page, `studio-services.csv` + generator entry, the `customisation_quote` inquiry branch, `src/config/studio.ts`, the homepage three-pillar band + Studio spotlight section, and the admin quotes view.

---

## v5 IN ONE SENTENCE

Add a third pillar — a **Customisation Studio** — as a static, quote-based showcase riding the existing inquiry write-path, reframe only the homepage from a fragrance brand into a maison of craft with three visible doors, surface the Studio's luxury face up front, and gate it all behind one config flag — leaving the perfume Collection, Atelier Supply, the cart, the manual checkout, and the admin panel completely untouched.

---

## UPDATED HOUSE ARCHITECTURE (v4 + v5)

```
AURIELLE PARIS ATELIER — the maison
│
├── THE COLLECTION            (B2C perfumes, ₱/€)        ── FROZEN
│     buy → cart → manual checkout
│
├── ATELIER SUPPLY            (B2B materials, USD/KG)     ── FROZEN
│     search (alias-only) → cart → manual checkout
│
├── CUSTOMISATION STUDIO      (UV printing, quote)        ── NEW [v5]
│     showcase (4 groupings) → request a quote → inquiry
│     • Luxury Packaging & Branding   (homepage face)
│     • Personal Gifts
│     • Business Solutions
│     • Industrial Printing
│
├── READS  static (src/data/*.generated.ts)              ── FROZEN + studio-services.csv
├── WRITES  Supabase (orders, inquiries incl. quotes)    ── FROZEN + customisation_quote
│
└── ADMIN   one panel: perfumes · materials · orders ·
             inquiries · [NEW] customisation quotes
```

*Hosting: Cloudflare Pages · Catalogue: static · DB: Supabase (writes only) · Commerce: manual (Stripe = P2) · Studio: quote-only*
