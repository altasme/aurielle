# AURIELLE PARIS ATELIER
## MVP WEBSITE SPECIFICATION — v3

---

## DECISIONS LOCKED (v3)

This version integrates four client/team decisions made after v2. Where they touch a section below, the section has been updated and marked **[v3]**.

1. **Merchant model — the client is the seller and merchant of record.**
   She fulfills orders and owns the Stripe account. Our commission is an *offline* business arrangement, not a payment-flow concern. The only technical requirement is that every website-originated order is uniquely identifiable and exportable. → New field `orders.source`, default `"website"`. No Stripe Connect, no payment splitting, no escrow.

2. **Supply catalogue is smell-alike oils — designer names are ALIAS-ONLY.**
   Designer/brand names (Dior Sauvage, Creed Aventus, Chanel Chance, etc.) are **never displayed** anywhere public. They exist only in a non-rendered, indexed `search_aliases` field to power search. Public display always uses the neutral/original product name (e.g. *Fast Break*). This protects the client and keeps Stripe compliant.

3. **Currency — Option A: separate B2C and B2B checkouts.**
   Perfumes (₱ / €, market-dependent) and supplies (USD/KG, fixed) **never share a cart**. Two carts, two checkout flows. Stripe transactions stay single-currency. This also reinforces the two-businesses-one-brand architecture. Dynamic FX conversion is **Phase 2** — and when built, it is a *display* layer only, with the rate locked and stored on the order (never live FX at checkout).

4. **Hosting — Cloudflare Pages.**
   Frontend deploys to Cloudflare Pages. Images via Cloudflare Images / Supabase Storage.

---

## OPEN ITEMS STILL WITH CLIENT (not blockers, but track)

These were flagged and are **not yet resolved**. They are deferred to Phase 2 or pending client input, but must not be forgotten:

- **EU B2B VAT / reverse charge** — supplies sold to EU business buyers carry VAT obligations. Excluded from MVP; flag as a known compliance gap.
- **Cookie consent / GDPR banner** — GA + Meta Pixel firing for EU visitors requires a consent banner. Not in v2; needed before EU traffic.
- **International shipping of fragrance concentrates** — flammable-goods / IATA rules apply. Shipping is Phase 2; not merely a rate-table problem.
- **Image rights** — confirm the client has rights to any customer/social imagery reused on the site.
- **Final commercial data** — perfume names, sizes, prices, descriptions, claims; GCash/bank details; MOQs; category classifications. All must come from the client. Do not invent.

---

## 1. BRAND DIRECTION

**Brand:** AURIELLE PARIS ATELIER

The website should communicate French-inspired luxury fragrance, craftsmanship and accessibility.

**Visual keywords:** Elegant · Feminine · Refined · Parisian · Premium · Soft luxury · Boutique · Editorial · Warm · Sophisticated

**Colour direction**

Primary: Ivory / soft white · Warm beige · Champagne gold
Secondary: Deep burgundy / wine red (from logo) · Soft taupe · Warm brown

Avoid: stark corporate blue · heavy black ecommerce styling · excessive gradients · neon colours · generic Shopify-looking layouts.

The marketing material consistently uses warm paper/beige backgrounds, burgundy typography, gold accents and editorial imagery. The website should translate that language into a cleaner luxury interface.

---

## 2. CORE BUSINESS STRUCTURE

The site must clearly separate the two commercial sides of the business.

### A. AURIELLE COLLECTION — finished perfumes
Target: consumers, gift buyers, fragrance enthusiasts, existing customers. Presented as branded Aurielle perfumes.

Example names from marketing material: Belle Eternelle, Fleur de Lumière, Ambre Sauvage, Bois Sacré, Visionnaire, Mystère XIII, Rose de Minuit, Cerise Noir, Noir Élixir, Donna Velours, Rosalie Élégance, Paris Nocturne, Rouge Royale, Satin Mystique.

> Final product names, prices, sizes and descriptions must come from the client. Do not invent commercial information.

### B. ATELIER SUPPLY — raw materials / fragrance oils **[v3]**
Target: perfumers, fragrance businesses, manufacturers, resellers, B2B and international buyers. Hundreds of entries, customer-facing pricing in **USD/KG**.

Not another consumer perfume collection — a professional fragrance supply catalogue presented through a luxury brand.

**[v3] These are smell-alike oils. Designer/brand names are alias-only** (see §10 and §13a). Public display uses the neutral name; the designer reference lives only in the searchable, non-rendered `search_aliases` field.

---

## 3. SITE MAP

```
HOME
│
├── AURIELLE COLLECTION
│   ├── All Perfumes
│   ├── Product Detail
│   └── Checkout / Order        ← B2C cart & checkout (₱ / €)
│
├── ATELIER SUPPLY
│   ├── All Materials
│   ├── Search / Filter
│   ├── Material Detail
│   └── Checkout / Order        ← B2B cart & checkout (USD/KG)   [v3]
│
├── ABOUT
├── BUSINESS / WHOLESALE
└── CONTACT
```

**[v3]** The two carts are independent. A perfume and a supply material can never occupy the same cart or the same Stripe transaction.

**Header:** AURIELLE LOGO · Collection · Atelier Supply · About · Business · Contact · [Cart]
**Mobile:** Logo — Menu

---

## 4. HOMEPAGE

Immediately communicate that this is more than a perfume shop.

**HERO** — large editorial fragrance image.
**Headline:** THE ART OF FRAGRANCE
**Copy:** Discover Aurielle Paris Atelier — a fragrance house creating refined perfumes and supplying quality fragrance materials to creators and businesses worldwide.
**Primary CTA:** EXPLORE THE COLLECTION
**Secondary CTA:** EXPLORE ATELIER SUPPLY

---

## 5. INTRODUCTION SECTION

**Heading:** A WORLD OF FRAGRANCE — short brand story introducing the two sides.

**AURIELLE** — Discover our signature collection of refined perfume oils created for everyday elegance and unforgettable moments. → CTA: DISCOVER AURIELLE

**ATELIER** — Explore our extensive fragrance supply catalogue for perfumers, businesses and fragrance creators. → CTA: EXPLORE SUPPLY

---

## 6. AURIELLE COLLECTION SECTION

Visually luxurious.

**Heading:** THE AURIELLE COLLECTION
**Subheading:** Fragrance oils crafted to become part of your signature.

Product grid — Desktop: 3–4 per row · Mobile: 2 per row. Large imagery, minimal UI.

```
[IMAGE]
Belle Eternelle
Floral · Sweet · Warm
[VIEW FRAGRANCE]
```

---

## 7. PERFUME PRODUCT PAGE

Each finished perfume gets its own page.

**Image gallery** — large hero + supporting images (bottle, lifestyle, packaging, application, brand).

**Product info** — name, short description.

**Scent Profile** (example): Sweet · Floral · Powdery · Warm

**Product details:** Size [client] · Type: Perfume Oil · Alcohol-Free · Made in France. *Only display claims confirmed by the client.*

**Pricing:** ₱ / € (market-dependent).
**CTA:** ADD TO CART / ORDER NOW → **B2C cart.**

---

## 8. ATELIER SUPPLY PAGE

**Hero:** ATELIER SUPPLY — Fragrance materials for creators, perfumers and businesses.
**Copy:** Explore our extensive fragrance catalogue and discover materials available for your next creation.
**CTA:** BROWSE MATERIALS

---

## 9. SUPPLY CATALOGUE

Large catalogue → **database-driven**, not a hand-built page. Source records have serial numbers, production names and USD/KG pricing.

```
Search fragrance materials...

[ All ] [ Floral ] [ Woody ] [ Fresh ] [ Sweet ] ...

------------------------------------------------
Fast Break
Fast Break Fragrance
USD 71.22 / KG
[VIEW]
------------------------------------------------
```

---

## 10. SUPPLY SEARCH **[v3]**

Search matches against:
- English name
- Original name
- Alternative name
- **`search_aliases`** (brand/reference names) — **matched but NEVER displayed**
- Product number

**[v3] Alias-only behaviour:** a query for `Sauvage` returns the neutral product (e.g. **Fast Break**). The results, cards, PDP, cart lines, URLs, meta tags and alt text **must not echo the designer name back.** The alias field is search-input only; it is never rendered in any surface.

Multiple entries may exist for similar fragrances — **do not auto-merge** duplicates unless the client confirms them (see §23).

---

## 11. SUPPLY FILTERS

MVP filters: **Category · Search · Sort.**

Potential categories (created only after client confirms classification): Floral, Fruity, Woody, Fresh, Musky, Amber, Sweet, Citrus, Oriental, Other.

> Do not auto-assign categories from product names. Until the client classifies, ship **All / Search / Sort** only; curated categories come later. (Practically, category chips are non-functional at launch — set that expectation.)

---

## 12. SUPPLY PRODUCT DETAIL

```
Fast Break
Fast Break Fragrance

Price: USD 71.22 / KG

Product Type: Fragrance Material
Unit: Kilogram
Price: USD 71.22 / KG

[REQUEST / ORDER]   → B2B cart
```

---

## 13. PRICING RULE

PDF prices are **customer-facing** and may be displayed publicly, but the **unit must be preserved**:

`USD 71.22 / KG` — **NOT** `$71.22`. The unit is commercially significant; the source column is labelled USD/KG.

---

## 13a. ALIAS-ONLY DISPLAY RULE **[v3]**

A hard rule that overrides any conflicting example in earlier drafts:

- **Public display name** = neutral/original name only (e.g. *Fast Break*).
- **Designer/brand names** = `search_aliases` only — indexed, searchable, **never printed** on any card, PDP, cart line, meta title/description, URL slug, image alt text, or search-result label.
- Default: **no inspiration hints either** (no "inspired by a popular designer fragrance") unless the client explicitly requests it. Let search do the matching silently.

---

## 14. FLEXIBLE PRICING MODEL

The database supports `price`, `currency`, `pricing_unit`:

```
71.22 · USD · KG
   X  · USD · LITER
   X  · USD · UNIT
```

Prevents hard-coding everything to KG if the client later confirms other units.

---

## 15. ORDER / CHECKOUT SYSTEM **[v3]**

The client earns commission on website orders, so the MVP has a real order flow with flexible payment architecture.

**[v3] Two independent flows** — B2C (perfumes, ₱/€) and B2B (supplies, USD/KG). Each has its own cart and checkout. They never merge, and no single Stripe transaction mixes currencies.

```
Browse → Product → Add to Cart → Cart → Checkout →
Select Payment Method → Order Confirmation
```

---

## 16. PAYMENT METHODS

- **International:** Stripe (client has an account)
- **Philippines:** GCash
- **Existing EU customers:** Bank Transfer

Checkout options:
```
○ Card / Stripe
○ GCash
○ Bank Transfer
```

Payment availability is controlled by market.

---

## 17. PAYMENT MVP

Don't build a multi-country payment engine from scratch.

- **Stripe** — Stripe Checkout / Stripe payment integration. Confirms payment automatically.
- **GCash** — QR / send-payment instructions, then **[Upload Proof of Payment]**. Manual verification.
- **Bank Transfer** — display Bank / Account Name / Account Number / IBAN / SWIFT, then **[Upload Payment Confirmation]**. Manual verification.

Exact GCash/bank details come from the client.

**Payment status vs. order status:** Only Stripe confirms at checkout. GCash and bank transfer create an order *before* payment is verified. Admin needs a reconciliation workflow, and since there are no customer accounts, provide a **guest order-lookup page**.

---

## 18. CHECKOUT INFORMATION

Collect:
- **Customer:** full name, email, phone, country
- **Billing:** address, city, state/province, postal code, country
- **Shipping:** "same as billing" checkbox

Shipping cost calculation is Phase 2.

---

## 19. ORDER CONFIRMATION

**THANK YOU FOR YOUR ORDER** — Your order has been received.

Display: order number, products, quantity, total, payment method, customer email. Send confirmation email.

---

## 20. COMMISSION TRACKING **[v3]**

The client is the **merchant of record**; commission to us is reconciled **offline**. The technical requirement is simply that every website order is uniquely identifiable and exportable.

**Order record fields:**
Order ID · Customer · Email · Country · Products · Quantity · Subtotal · Shipping · Total · Currency · Payment Method · Payment Status · Order Status · **`source` (default `"website"`) [v3]** · Created At

**[v3]** Admin must provide a **CSV export of orders by date range** — this is all commission reconciliation needs.

---

## 21. ADMIN / CMS

Client manages products without touching code.

**Perfumes:** add / edit / delete-archive · upload images · set price · set size · edit description · edit scent profile · mark featured · mark available/unavailable.

**Supply catalogue:** add / edit · update price · update unit · **edit `search_aliases` [v3]** · search · archive · bulk import/update.

---

## 22. BULK PRODUCT IMPORT

Hundreds of catalogue entries — do not hard-code. Importable structure (CSV/JSON):

```
name,description,price,currency,unit,serial_number,search_aliases
Fast Break,Fast Break fragrance,71.22,USD,KG,1,"Dior Sauvage"
Wild Bluebell Fragrance,,72.12,USD,KG,2,""
...
```

**[v3]** `search_aliases` carries designer references for search only; it is never displayed. Import from source only after client approval.

> Note: extracting hundreds of messy PDF entries (four name variants each, known duplicates, no categories) into clean structured records is the hidden bulk of the work — not a one-click CSV step. Scope accordingly.

---

## 23. DUPLICATE PRODUCT HANDLING

Source contains repeated/similar products (Pure Play, Miracle, and various references) at different prices. **Do not consolidate automatically.** Preserve source records until the client confirms: "These are duplicates; use this price."

---

## 24. ABOUT PAGE

Build trust and establish the brand story. Sections: Our Story · The Atelier · Our Philosophy · Fragrance Craftsmanship · Made in France. Only factual, client-approved claims.

---

## 25. BUSINESS / WHOLESALE PAGE

B2B-oriented, to match the supply catalogue.

**Heading:** FOR YOUR BUSINESS
**Copy:** Looking for fragrance materials for your own creations, products or business?
**CTA:** TALK TO THE ATELIER

Form: Name · Business name · Email · Country · Product/material interest · Estimated quantity · Message.

---

## 26. CONTACT PAGE

Simple luxury layout. *Let's create something beautiful.* — Email · Social Media · Location · [Contact Form].

Form: Name · Email · Country · Inquiry type · Message.

---

## 27. SOCIAL PROOF

Use existing marketing content. Sections like **AS SEEN / FEATURED** or **THE AURIELLE EXPERIENCE**, drawing on product/brand photography and social content. Confirm image rights (§Open Items). Don't overload the homepage.

---

## 28. DESIGN SYSTEM

**Headings** — elegant high-contrast serif: Cormorant Garamond / Playfair Display / Libre Baskerville.
**Body** — clean modern sans-serif: Inter / Manrope / DM Sans.
**Accent** — handwritten/script sparingly for small editorial labels, quotes, decorative headings. **Never** for body copy or navigation.

---

## 29. COMPONENT STYLE

Buttons: thin borders, minimal rounded corners. Avoid huge pill buttons, heavy shadows, generic SaaS cards. Product cards should feel like luxury editorial catalogues, not Amazon.

---

## 30. MOBILE-FIRST

Priority #1 — most traffic arrives via Facebook, Instagram, TikTok, messaging, direct links.

**Mobile homepage:** Logo/Menu → HERO → Explore Collection → Atelier Supply → Featured Perfumes → Why Aurielle → Business CTA → Footer.
**Product page:** Image → Name → Price → Scent Profile → Description → CTA.

---

## 31. CART **[v3]**

Persistent cart icon. **[v3] Two independent carts** (B2C perfumes, B2B supplies) — never combined.

Cart displays product, quantity, unit price, subtotal. For supply products the unit price is **per KG**, not the line total:

```
Fast Break
2 KG
USD 142.44
```

---

## 32. QUANTITY LOGIC

For supply products, quantity = the pricing unit.

```
Price:    USD 71.22 / KG
Quantity: [ - ] 2 [ + ]
Subtotal: USD 142.44
```

**MOQ is not invented.** If the client later sets a minimum (e.g. 5 KG), the selector enforces it.

---

## 33. PERFUME VS SUPPLY UX

The two catalogues should intentionally feel different — this is one of the most important parts of the MVP.

**Aurielle Perfumes (B2C):** Emotion → Desire → Purchase — image → story → scent → price → buy.
**Atelier Supply (B2B):** Need → Search → Evaluate → Order — search → product → price/KG → quantity → order.

**[v3]** The cart/checkout separation (§15, §31) is the structural expression of this distinction.

---

## 34. SEO

Basic SEO for MVP. URLs:

```
/
/collection
/collection/[product]
/atelier-supply
/atelier-supply/[product]
/about
/business
/contact
```

Each product: SEO title · meta description · clean URL · product structured data where applicable.

**[v3]** Supply slugs and metadata use the **neutral name only** — never a designer alias.

---

## 35. PERFORMANCE

Mobile-first · fast initial load · optimized/responsive images · lazy loading · minimal JS · CDN delivery. Don't sacrifice performance for excessive animation.

---

## 36. ANALYTICS

Install Google Analytics + Meta Pixel. Track: View Product · View Supply Material · Add To Cart · Begin Checkout · Purchase · Contact Form · Wholesale Inquiry.

**[v3]** EU consent banner required before pixels fire for EU visitors (§Open Items).

---

## 37. MVP TECH STACK **[v3]**

- **Frontend:** Next.js
- **Styling:** Tailwind CSS
- **Database:** Supabase
- **Auth:** Supabase Auth (admin only)
- **Payments:** Stripe
- **Hosting:** **Cloudflare Pages [v3]**
- **Images:** Cloudflare Images / Supabase Storage

---

## 38. MVP DOES NOT INCLUDE

❌ Advanced inventory · ❌ Warehouse management · ❌ Shipping carrier integrations · ❌ Automated international shipping calc · ❌ Complex tax/VAT engine · ❌ Customer accounts · ❌ Loyalty · ❌ Reviews · ❌ Subscriptions · ❌ Advanced recommendations · ❌ AI perfume finder · ❌ Advanced CRM · ❌ ERP · ❌ Multi-language · ❌ Automated currency conversion · ❌ Complex B2B pricing tiers

All → Phase 2.

---

## 39. MVP DELIVERABLE

**Brand:** premium Aurielle identity · responsive · mobile-first.
**Commerce:** perfume catalogue · supply catalogue · product pages · **two carts [v3]** · **two checkouts [v3]** · Stripe · GCash flow · bank-transfer flow · order confirmation.
**B2B:** supply catalogue · USD/KG pricing · search (with alias matching) · filtering foundation · business inquiry form.
**Admin:** product management · price management · image management · supply catalogue management (incl. aliases) · order management (incl. CSV export).
**Tracking:** analytics · Meta Pixel · conversion events.

---

## 40. THE MVP IN ONE SENTENCE

A luxury, editorial-style fragrance website that sells the Aurielle perfume collection through a B2C flow while providing a searchable, customer-priced USD/KG catalogue of smell-alike materials through a separate B2B flow — with designer names used only as hidden search aliases, and every website order trackable for commission reconciliation.

---

## KEY ARCHITECTURAL DECISION

```
AURIELLE WEBSITE
│
├── CONSUMER (B2C)
│   └── AURIELLE PERFUME COLLECTION
│       ├── Retail products (₱ / €)
│       └── B2C cart & checkout                    [v3]
│
├── B2B
│   └── ATELIER SUPPLY
│       ├── Smell-alike materials
│       ├── Customer-facing USD/KG pricing
│       ├── Designer names = search aliases only   [v3]
│       └── B2B cart & checkout (USD)              [v3]
│
├── COMMERCE
│   ├── Two independent carts (no currency mixing) [v3]
│   ├── Stripe · GCash · Bank Transfer
│   └── Orders tagged source="website"             [v3]
│
└── ADMIN
    ├── Perfumes
    ├── Supply Materials (+ aliases)
    ├── Pricing
    └── Orders (+ CSV export)
```

*Hosting: Cloudflare Pages · DB: Supabase · Payments: Stripe*
