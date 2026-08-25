# AURIELLE PARIS ATELIER
## INTERNAL PAGES SPEC (v5.4): COLLECTION, ATELIER SUPPLY, ABOUT

> Continues v5.2. When the homepage became a lean three-pillar gateway, deep content moved off it. v5.4 gives that relocated content a proper home and completes each of the three receiving pages, so nothing is orphaned. Commerce, checkout, and architecture stay frozen (v5 frozen list still holds). This is content structure and presentation only.
>
> Formatting: no em dashes anywhere, per standing preference.

---

## WHAT MOVED HERE (from v5.2)

- To **Collection**: the mood filter, the philosophy section, and the story bottles ("The Aurielle Experience").
- To **Atelier Supply**: the fragrance-development process ("From Concept to Finished Product") and the factory grid ("Behind the Supply").
- To **About**: the founder story ("The Story Behind Aurielle") and the community section ("Fragrance in the Real World").

v5.4 places each of these inside a full page structure rather than leaving them as loose blocks.

---

## IMAGE PLACEHOLDER CONVENTION

Every photo slot carries size, aspect ratio, and type.

```
IMG: slot-name
  Canvas (display) : W x H px
  Asset  (upload)  : W x H px    (about 2x, retina)
  Aspect ratio     : X:Y  (decimal)
  Type             : WebP (JPEG fallback) | SVG | PNG
  Fill             : cover, focal center
  Brief            : subject or mood
  Status           : REAL exists | representative (not client work) | NEW placeholder
```

Type rule: photos use WebP with a JPEG fallback, icons and line art use SVG, flat raster with transparency uses PNG. Text is never baked into images (CSS overlay only, brand-lock rule).

---

## 1. COLLECTION PAGE  (`/collection`)  B2C fragrance, the full experience

This is where the perfume brand lives in full. The homepage only teases it, so this page carries the emotional depth.

### IA

```
1. Page hero (fragrance editorial)
2. Product grid (all perfumes, ADD TO CART)
3. Find Your Scent (mood filter)
4. The Aurielle Experience (story bottles)
5. The Aurielle Philosophy (brand belief)
6. Close CTA (Shop, or Talk to the Atelier)
```

### Sections

**Page hero.** Script eyebrow plus "The Aurielle Collection" plus a short line.
```
IMG: collection-hero
  Canvas : 1920 x 640 px  (full-bleed)
  Asset  : 2880 x 960 px
  Aspect : 3:1  (3.00:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center, scrim for legibility
  Brief  : warm editorial fragrance styling
  Status : REAL exists (reuse existing fragrance imagery)
```

**Product grid.** All perfumes, desktop 3 to 4 per row, mobile 2 per row, each with image, name, scent tags, price, ADD TO CART. Commerce unchanged.
```
IMG: collection-product (one per perfume)
  Canvas : 300 x 400 px
  Asset  : 600 x 800 px
  Aspect : 3:4  (0.75:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center
  Brief  : Aurielle bottle, editorial styling
  Status : REAL exists (Belle Eternelle, Fleur de Lumiere, and so on)
```

**Find Your Scent (moved here).** Mood chips (Feminine, Mysterious, Elegant, Warm, Alluring) that filter the grid above. Text and chips, no image.

**The Aurielle Experience (moved here).** Three story bottles with a one-line mood each (Paris Nocturne, Donna Velours, Rouge Royale).
```
IMG: collection-story-bottle (x3)
  Canvas : 380 x 520 px
  Asset  : 760 x 1040 px
  Aspect : 19:26  (0.73:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center
  Brief  : dramatic editorial bottle scenes
  Status : REAL exists
```

**The Aurielle Philosophy (moved here).** "A Scent Becomes Part of You" belief copy. Text, optional single atmospheric image.
```
IMG: collection-philosophy (optional)
  Canvas : 780 x 520 px
  Asset  : 1560 x 1040 px
  Aspect : 3:2  (1.50:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center
  Brief  : soft, quiet, atmospheric
  Status : REAL exists or representative
```

**Close CTA.** Shop All Perfumes, plus a soft link to the Atelier for people who want to build their own.

---

## 2. ATELIER SUPPLY PAGE  (`/atelier-supply`)  B2B fragrance, source and develop

This page owns the scent and the sourcing. It does not own physical printing (that is the Studio, per the v5.2 boundary rule).

### IA

```
1. Page hero (supply and materials)
2. Capability cards (what the Atelier supplies)
3. From Concept to Finished Product (process)
4. Behind the Supply (factory and capability photos)
5. The Catalogue (USD/KG, alias-only search, order)
6. Close CTA (Talk to the Atelier)
```

### Sections

**Page hero.** "Atelier Supply" plus a line for creators and businesses.
```
IMG: supply-hero
  Canvas : 1920 x 640 px  (full-bleed)
  Asset  : 2880 x 960 px
  Aspect : 3:1  (3.00:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center, scrim for legibility
  Brief  : oils, raw materials, or lab setting
  Status : REAL exists or representative
```

**Capability cards.** Four cards: Fragrance Oils, Sourcing and Logistics, OEM and ODM fragrance development, Material profiles. Text is fine, optional small image each.
```
IMG: supply-card (x4, optional)
  Canvas : 280 x 180 px
  Asset  : 560 x 360 px
  Aspect : 14:9  (1.56:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center
  Brief  : oils, materials, sourcing, logistics
  Status : NEW placeholder (only if imaging the cards)
```

**From Concept to Finished Product (moved here).** The fragrance-development journey: Develop Your Scent, Choose Your Packaging, Make It Yours, Bring It to Market. Present as a stepped process. Icons only.
```
IMG: supply-step-icon (x4)
  Canvas : 64 x 64 px
  Asset  : n/a (vector)
  Aspect : 1:1  (1.00:1)
  Type   : SVG
  Brief  : scent, packaging, branding, market, brand stroke
  Status : NEW placeholder
```

**Behind the Supply (moved here).** Factory and capability photo grid.
```
IMG: supply-factory (x4)
  Canvas : 560 x 460 px
  Asset  : 1120 x 920 px
  Aspect : 61:50  (1.22:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center
  Brief  : production, lab, warehouse, retail wall
  Status : REAL exists
```

**The Catalogue.** USD/KG materials, client-side search with alias-only matching (designer names matched, never displayed), sort, order into the B2B cart. Commerce and alias rules unchanged. Static-read, no per-item hero images required.

**Close CTA.** Talk to the Atelier for a project.

---

## 3. ABOUT PAGE  (`/about`)  the maison story

This carries the brand narrative for all three pillars, not just fragrance.

### IA

```
1. Page hero (the maison)
2. Our Story (the house origin)
3. The Story Behind Aurielle (founder)
4. What We Do (three crafts in brief)
5. Fragrance in the Real World (community)
6. Close CTA
```

### Sections

**Page hero.** "The Aurielle Paris Atelier" plus a one-line maison statement.
```
IMG: about-hero
  Canvas : 1920 x 600 px  (full-bleed)
  Asset  : 2880 x 900 px
  Aspect : 16:5  (3.20:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center, scrim for legibility
  Brief  : brand-tinted, house feeling, not perfume-only
  Status : REAL exists or representative
```

**Our Story.** House origin and philosophy across the three crafts. Text.

**The Story Behind Aurielle (moved here).** Founder narrative with portrait.
```
IMG: about-founder
  Canvas : 520 x 640 px
  Asset  : 1040 x 1280 px
  Aspect : 13:16  (0.81:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center
  Brief  : founder portrait, warm neutral background
  Status : REAL exists
```

**What We Do.** Three short blocks, one per pillar (Collection, Atelier Supply, Studio), each linking to its page. Keeps the maison framing consistent with the homepage.

**Fragrance in the Real World (moved here).** Community and events.
```
IMG: about-community
  Canvas : 780 x 520 px
  Asset  : 1560 x 1040 px
  Aspect : 3:2  (1.50:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center
  Brief  : real event or market scene
  Status : REAL exists
```

**Close CTA.** Explore the Collection, or Talk to the Atelier.

---

## FROZEN (unchanged by v5.4)

Commerce and checkout on Collection and Atelier Supply, the alias-only search behaviour, USD/KG pricing and units, the manual Kolekta order flow, the order and inquiry schema, the customisation quote flow, the static-read and writes-only architecture, the generate:catalogue pipeline, Cloudflare Pages, and the config seam. v5.4 places relocated sections and completes page structure. It does not touch commerce or architecture.

---

## INPUTS AND NOTES

1. Most images here already exist as real assets (product shots, story bottles, factory grid, founder portrait, community). Reuse, do not regenerate.
2. Only new or optional slots: supply capability-card images, step icons, and the optional philosophy atmospheric image.
3. Keep the Supply and Studio boundary clean: fragrance-development process lives on Supply, physical printing lives on the Studio.

---

## IN ONE SENTENCE

Give the content that left the homepage a proper home by completing three pages: Collection as the full fragrance experience (grid, mood filter, story bottles, philosophy), Atelier Supply as the source-and-develop pillar (capability cards, development process, factory, catalogue), and About as the maison story (origin, founder, three crafts, community), with every image slot specced by size, aspect ratio, and type, and no commerce or architecture touched.
