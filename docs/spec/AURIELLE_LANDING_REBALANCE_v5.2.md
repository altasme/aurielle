# AURIELLE PARIS ATELIER
## LANDING PAGE — REBALANCE SPEC (v5.2)

> **Supersedes v5.1.** v5.1 reordered the existing sections; that wasn't enough — the homepage is still ~70% fragrance by *real estate*, so it still reads as a fragrance house. v5.2 fixes the **volume**, not the order: the homepage becomes a lean **equal-thirds gateway**, and the deep fragrance content moves to the pages where it belongs. Everything in the v5 frozen list (commerce, checkout, architecture) stays untouched.

---

## THE CORE SHIFT

**The homepage is a gateway, not the perfume store.** Today it's essentially the entire Collection site with two guest sections bolted on. v5.2 gives each pillar **one equal, parallel block** plus a strong door to its own page, and relocates destination-grade content (mood filter, philosophy, story bottles, founder story, community, factory, fragrance-dev process) off the homepage.

**Governing principle — parallel pillars.** The three pillar blocks are **identical in weight and structure**: heading → a taste (items/cards/photos) → one CTA to the dedicated page. Equal size is what kills the "fragrance house" feel; no reorder can do that while the volumes are lopsided.

**Honest trade (Jewel's call, ★1):** true equal-thirds softens the "luxury Paris fragrance house" identity on the front door. The Collection page still carries the full fragrance experience; the homepage just stops treating perfume as the whole business. Given the printer is where the investment went, this is the right trade — but it's a deliberate brand decision.

---

## IMAGE PLACEHOLDER CONVENTION

Every photo slot below uses this token. Dimensions are explicit so assets can be produced/cropped correctly. **Canvas** = on-screen display box (CSS px). **Asset** = file to supply (≈2× for retina). **Aspect** = width:height.

```
⟦IMG: slot-name⟧
  Canvas (display) : W × H px
  Asset  (upload)  : W × H px   (≈2×, retina)
  Aspect ratio     : X:Y  (decimal)
  Fill             : cover, focal center
  Brief            : subject / mood in one line
  Status           : NEW placeholder  |  REAL asset exists
```

All canvases are desktop reference sizes; they scale down responsively (mobile-first). Never bake text into generated images — text overlays in CSS (brand-lock rule).

---

## REBALANCED HOMEPAGE IA (the lean gateway)

```
1. HERO — the maison
2. THREE-PILLAR CHOOSER — equal cards
3. PILLAR BLOCK · The Collection      (equal)
4. PILLAR BLOCK · Atelier Supply      (equal)
5. PILLAR BLOCK · Customisation Studio(equal)
6. WHY AURIELLE — one standard, three crafts
7. CREATE SOMETHING OF YOUR OWN — final CTA
8. FOOTER
```

~7 lean sections, split evenly. Down from ~15 where 7 were perfume.

### 1. HERO — the maison

Keep the current hero design. Tagline pending ★2.

```
⟦IMG: hero-bg⟧
  Canvas (display) : 1920 × 800 px  (full-bleed)
  Asset  (upload)  : 2880 × 1200 px
  Aspect ratio     : 12:5  (2.40:1)
  Fill             : cover, focal center
  Brief            : warm Parisian editorial, brand-tinted; not perfume-specific
  Status           : REAL asset exists (current hero) — reuse
```

Copy: script eyebrow "Aurielle Paris Atelier" → headline "Fragrance · Craft · Customisation" → 1 short maison line → **two CTAs**, and make the secondary route to the pillar chooser so all three paths are reachable from the hero (fixes the "hero ignores Studio" gap).

### 2. THREE-PILLAR CHOOSER

Three **equal** cards: Collection · Atelier Supply · Studio. Each: name + one-line "what it is" + button. Give all three the *same* treatment (same copy length, same button) — the Studio card must not be the weak one. Order = ★1 (equal, or Studio-first if she wants it to lead).

Optional per-card thumbnail (skip if staying text-only, which is cleaner):

```
⟦IMG: pillar-thumb (×3, one per pillar)⟧
  Canvas (display) : 360 × 240 px
  Asset  (upload)  : 720 × 480 px
  Aspect ratio     : 3:2  (1.50:1)
  Fill             : cover, focal center
  Brief            : Collection = perfume still · Supply = materials/oils · Studio = printed label
  Status           : NEW placeholder (only if using thumbnails)
```

### 3. PILLAR BLOCK · The Collection  *(B2C perfume — the taste, not the whole store)*

Heading "The Collection" + short line → **3–4 featured perfumes** → CTA "Shop the Collection" → `/collection`. That's it — mood/philosophy/experience all move to the Collection page.

```
⟦IMG: collection-product (×3–4)⟧
  Canvas (display) : 300 × 400 px
  Asset  (upload)  : 600 × 800 px
  Aspect ratio     : 3:4  (0.75:1)
  Fill             : cover, focal center
  Brief            : Aurielle bottle, editorial styling
  Status           : REAL assets exist (Belle Eternelle, Fleur de Lumière, etc.) — reuse
```

### 4. PILLAR BLOCK · Atelier Supply  *(B2B fragrance — the scent & sourcing)*

Heading "Atelier Supply" + short line → **4 capability cards** (Fragrance Oils · Sourcing & Logistics · OEM/ODM fragrance development · Material profiles) → CTA "Explore Supply" → `/atelier-supply`. Factory photos + the concept-to-product process move to the Supply page.

Cards can stay text-only (clean) or take a small image each:

```
⟦IMG: supply-card (×4, optional)⟧
  Canvas (display) : 280 × 180 px
  Asset  (upload)  : 560 × 360 px
  Aspect ratio     : 14:9  (1.56:1)
  Fill             : cover, focal center
  Brief            : oils, raw materials, packaging components, logistics
  Status           : NEW placeholder (only if imaging the cards)
```

> Boundary rule (★5): **Supply owns the scent and sourcing; not physical printing.** Move "custom packaging" language out of Supply — packaging *printing* belongs to the Studio.

### 5. PILLAR BLOCK · Customisation Studio  *(UV printing — the print & branding)*

Heading "Customisation Studio" + short line → **luxury chips** (perfume bottle printing · cosmetic packaging · metal/mini labels · brand plates · acrylic awards · crystal/UV stickers) → **the two real print photos** → CTA "Explore the Studio" → `/studio`.

```
⟦IMG: studio-showcase (×2, side-by-side)⟧
  Canvas (display) : 580 × 460 px  (each)
  Asset  (upload)  : 1160 × 920 px
  Aspect ratio     : ~29:23  (1.26:1)
  Fill             : cover, focal center
  Brief            : real printed labels / bottles / metal plates (the "Your Brand, Your Bottle" shots)
  Status           : REAL assets exist — reuse (strongest proof for the printing business)
```

### 6. WHY AURIELLE — rewritten to cover all three crafts

The current four columns are all fragrance-framed. Replace with **three pillar columns + one house line** so the "why" isn't a perfume pitch:

| Column | Copy direction |
|---|---|
| **Refined fragrance** | Signature perfume oils, crafted to become part of your signature. |
| **Materials & supply** | Fragrance oils and sourcing for creators and businesses building their own line. |
| **Custom craftsmanship** | Made-to-order UV printing — packaging, labels and branding finished to a luxury standard. |
| *House line (below the three)* | "One atelier standard across everything we make." |

Text-only; no photos.

### 7. CREATE SOMETHING OF YOUR OWN — final CTA

Keep — it already speaks to both wearing a scent and building a brand. Two CTAs: "Explore the Collection" + "Talk to the Atelier."

```
⟦IMG: final-cta-bg⟧
  Canvas (display) : 1920 × 560 px  (full-bleed)
  Asset  (upload)  : 2880 × 840 px
  Aspect ratio     : 24:7  (3.43:1)
  Fill             : cover, focal center
  Brief            : soft editorial, brand-tinted
  Status           : REAL asset exists (current) — reuse
```

### 8. FOOTER — keep as built (logo + Explore / Company / Legal columns).

---

## NAV, NAMING, AFFILIATE (carried from v5.1)

- Nav: `COLLECTION · ATELIER SUPPLY · STUDIO · ABOUT · BUSINESS · CONTACT` — rename `ATELIER` → **`ATELIER SUPPLY`** to break the collision with `STUDIO`. If "STUDIO" still isn't clear enough that it means printing, consider "CUSTOM" (★3).
- **De-rank "BE AN AFFILIATE"** from solid burgundy to an outline/secondary style so Shop and Talk-to-the-Atelier win the visual hierarchy (★4).

---

## ★ BLOCKING INPUTS (Jewel sign-off)

1. **Pillar equality** — all three equal, or Studio leads (first/largest)?
2. **Hero tagline** — "Fragrance · Craft · Customisation" or "where personalisation meets craftsmanship."
3. **Nav clarity** — approve "ATELIER SUPPLY"; is "STUDIO" clear or rename to "CUSTOM"?
4. **Affiliate emphasis** — OK to de-rank "Be an Affiliate."
5. **Supply/Studio boundary** — confirm packaging *printing* = Studio, materials/formulation = Supply.

---

## WHAT MOVES OFF THE HOMEPAGE (appendix — nothing is deleted)

Relocated to the pages where they're destination content. Their real assets travel with them.

**→ Collection page** (`/collection`): "The Aurielle Experience" story bottles · "Find Your Scent" mood filter · "The Aurielle Philosophy."
```
⟦IMG: collection-story-bottle (×3)⟧  Canvas 380×520 · Asset 760×1040 · 19:26 (0.73) · cover · REAL exists
```

**→ Atelier Supply page** (`/atelier-supply`): "From Concept to Finished Product" process · "Behind the Supply" factory grid.
```
⟦IMG: supply-factory (×4)⟧  Canvas 560×460 · Asset 1120×920 · ~61:50 (1.22) · cover · REAL exists
```

**→ About page** (`/about`): "The Story Behind Aurielle" founder portrait · "Fragrance in the Real World" community.
```
⟦IMG: about-founder⟧     Canvas 520×640 · Asset 1040×1280 · 13:16 (0.81) · cover · REAL exists
⟦IMG: about-community⟧   Canvas 780×520 · Asset 1560×1040 · 3:2 (1.50) · cover · REAL exists
```

---

## FROZEN (do not touch)

The Collection/Supply/Studio internal pages' commerce, the cart, manual Kolekta checkout, the `customisation_quote` flow, order/inquiry schema, static-read/writes-only architecture, `generate:catalogue`, Cloudflare Pages, and the config seam. v5.2 is **homepage rebalance + relocation of homepage sections to existing pages** — no commerce or architecture change.

---

## IN ONE SENTENCE

Turn the homepage from a full perfume storefront with two guest sections into a lean gateway of three equal-weight pillar blocks — moving mood, philosophy, story, factory, and founder content to the Collection, Supply, and About pages — so a visitor sees one house with three genuinely equal crafts, with every photo slot specced by canvas size, asset size, and aspect ratio.
