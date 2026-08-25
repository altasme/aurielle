# AURIELLE PARIS ATELIER
## STUDIO PAGE SPEC (standalone, self-contained)

> Scope: build and adjust the Studio page ONLY (route `/studio`). Every other page has already been updated by Claude Code and must not be touched. This file is self-contained: it carries the current page content, the target structure, brand tokens, image slots, data model, and constraints, so no other spec is needed to work on this page.
>
> Formatting: no em dashes anywhere.

---

## 1. WHAT THIS PAGE IS

The Customisation Studio is the UV-printing pillar of the Aurielle site. Every item is made to order. There is no fixed catalogue and no stock pricing. The page is a visual showcase that ends in a quote request. It is not a shop.

**Hard guardrails (do not cross):**
- No cart, no add-to-cart, no checkout on this page.
- No prices, no pricing engine, no currency.
- No product configurator, no live preview, no build-your-own tool, no real-time mockups.
- Interactive means imagery, hover and reveal states, clickable category cards that feed the quote form, a how-it-works flow, and a gallery. Nothing more.

The only write action on this page is a quote inquiry (section 9).

---

## 2. ARCHITECTURE CONSTRAINTS

- **Reads are static.** All page content (headings, groupings, chips, copy) is static, bundled at build time. No database reads on this page, including during the build.
- **Writes only, on submit.** The quote form writes one inquiry record to Supabase and uploads the optional artwork file to storage.
- **Lazy Supabase client.** Instantiate the Supabase client inside the submit handler only, never at module top level, so the build never fails on missing env vars.
- **Hosting:** Cloudflare Pages.
- **Stack:** Next.js, Tailwind, TypeScript, matching the rest of the site.

---

## 3. BRAND TOKENS

Reuse the existing tokens already in the codebase. Roles, with approximate values as a guide only (confirm against current CSS):

- Canvas background: ivory or cream (about `#FBF6EE`).
- Alternate section background: warm beige (about `#EDE4D3`).
- Headings ink: deep charcoal navy (about `#221D1A`).
- Primary accent, buttons, script eyebrow: burgundy or wine (about `#6E1023`).
- Gold or champagne accent: (about `#C9A24B`).
- Body text: warm taupe or brown (about `#6F5F52`).

Typography, matching the site: serif for headings (Playfair Display family), script for the small eyebrow labels, clean sans for body (Inter or Manrope family). Never bake text into images. All text is CSS.

---

## 4. ROUTE AND NAV

- Route: `/studio`.
- Nav label: `STUDIO`. Keep consistent with the existing header (COLLECTION, ATELIER SUPPLY, STUDIO, ABOUT, BUSINESS, CONTACT, CART, BE AN AFFILIATE). Do not change the header on this task.

---

## 5. CURRENT CONTENT (source of truth for copy)

The page already exists with the copy below. Keep this copy. The task adds structure, imagery, and interactivity around it.

**Hero**
- Eyebrow (script): The Customisation Studio
- Heading: Made-to-Order UV Printing
- Sub: Every piece the Studio produces is made to order. No fixed catalogue, no stock pricing. Browse what we print by category below, then request a quote for your own project.

**Groupings and chips** (exact):

| Grouping | Description | Chips (each is a quote prefill value) |
|---|---|---|
| Luxury Packaging & Branding | Perfume and beauty packaging, metal and mini labels, brand plates, acrylic awards and crystal UV stickers, finished with the same craftsmanship as the Aurielle Collection itself. | Perfume Bottle Printing; Cosmetic Packaging; Metal Labels; Mini Labels; Brand Plates; Acrylic Awards; Crystal / UV Luxury Stickers |
| Personal Gifts | Custom printing for the people and moments in your life: phone cases, home decor, wedding keepsakes, souvenirs and fashion accessories. | Phone & Electronics Cases; Home Decoration; Wedding & Event Keepsakes; Souvenirs; Fashion Accessories |
| Business Solutions | Branded materials for restaurants, offices and storefronts: corporate gifts, hospitality items, access cards, signage and name plates. | Corporate Gifts; Restaurant & Hospitality Items; PVC / Loyalty / Access Cards; Acrylic Signage; QR Displays; Name Plates |
| Industrial Printing | Small-batch and prototype production for manufacturers and private-label brands: metal printing, small plastics, labels and tags. | Metal Printing; Small Plastics; Custom Manufacturing (Prototype / Small-Batch / Private-Label); Labels & Tags |

**Quote form** (exact fields, already present):
- Heading: Request a Quote
- Sub: Tell us what you have in mind and, if you have one, attach your artwork or logo. The atelier will follow up with pricing and turnaround.
- Fields: Name (required), Email (required), Phone, Country, Grouping of Interest (dropdown, default "Not sure / other"), Specific Item, Approximate Quantity, Tell Us About Your Request (textarea), plus an artwork or logo upload.

---

## 6. TARGET PAGE STRUCTURE

The current page is correct but flat: four identical text-chip blocks and no imagery. Rebuild it to this structure, keeping all copy from section 5.

```
1. Visual hero
2. Finishes strip
3. Grouping: Luxury Packaging & Branding   (image left, text right)
4. Grouping: Personal Gifts                (text left, image right)
5. Grouping: Business Solutions            (image left, text right)
6. Grouping: Industrial Printing           (text left, image right = the printer)
7. How It Works (interactive stepper)
8. Recent Work (real gallery, gated)
9. Request a Quote (contextual)
10. Footer (existing)
```

---

## 7. SECTION DETAIL

**1. Visual hero.** Keep the eyebrow, heading, and sub from section 5. Set them over a real image of printed work with a dark scrim for legibility. Primary button: Request a Quote (smooth-scroll to section 9).

**2. Finishes strip.** A horizontal band of five finish tiles that show what the printer can do: Gold Foil, Metallic, Acrylic, Crystal / 3D, Full Colour. Hover or tap reveals a one-line description. This communicates capability without needing a portfolio.

**3 to 6. Four groupings.** Keep each grouping heading, description, and chips from section 5. Two changes:
- Add one representative image per grouping, alternating side (left, right, left, right) for rhythm.
- Make each chip clickable. Clicking a chip prefills the quote form (Grouping of Interest plus Specific Item) and smooth-scrolls to section 9. Keep the Request a Quote button per grouping as well.

**7. How It Works.** Four steps, icons only: 1 Upload your artwork, 2 We proof it, 3 We print, 4 Delivered. Reveal on scroll or click-through. This is honest (it is the real service flow) and needs no portfolio.

**8. Recent Work.** A carousel or grid of real finished pieces with a lightbox. Populate with real work only. If there is not enough real work at launch, omit this section entirely. Do not fill it with fabricated samples.

**9. Request a Quote.** Keep the exact fields from section 5. When the user arrived by clicking a chip, prefill Grouping of Interest and Specific Item. Submit writes one inquiry (section 10).

**10. Footer.** Use the existing site footer.

---

## 8. IMAGE SLOTS

Convention. Canvas is the on-screen box. Asset is the file to supply (about 2x for retina). Every slot lists size, aspect ratio, and type.

```
IMG: studio-hero
  Canvas : 1920 x 640 px  (full-bleed)
  Asset  : 2880 x 960 px
  Aspect : 3:1  (3.00:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center, dark scrim
  Brief  : composed from real printed work (labels, bottles, metal plates)
  Status : REAL exists, compose from existing print photos
```
```
IMG: finish-tile  (x5)
  Canvas : 240 x 240 px
  Asset  : 480 x 480 px
  Aspect : 1:1  (1.00:1)
  Type   : WebP
  Fill   : cover, focal center
  Brief  : macro of each finish (gold foil, metal, acrylic edge, crystal dome, full-colour print)
  Status : representative (material samples, not client work)
```
```
IMG: grouping-image  (x4, alternating side)
  Canvas : 640 x 520 px
  Asset  : 1280 x 1040 px
  Aspect : 11:9  (1.22:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center
  Briefs and status:
    Luxury Packaging & Branding : perfume packaging, metal labels.  Status: REAL exists.
    Personal Gifts              : phone case or keepsake.            Status: representative.
    Business Solutions          : signage, cards, name plates.       Status: representative.
    Industrial Printing         : the actual A3 UV DTF printer.      Status: REAL, recommended.
```
```
IMG: step-icon  (x4)
  Canvas : 64 x 64 px
  Asset  : n/a (vector)
  Aspect : 1:1  (1.00:1)
  Type   : SVG
  Brief  : upload, proof, printer, delivery box, brand stroke line icons
  Status : NEW placeholder
```
```
IMG: gallery-item  (x N)
  Canvas : 480 x 480 px
  Asset  : 960 x 960 px
  Aspect : 1:1  (1.00:1)
  Type   : WebP (JPEG fallback)
  Fill   : cover, focal center
  Brief  : real completed print pieces
  Status : REAL only, do not populate with placeholders
```

Placeholder rendering during development: use a solid brand-beige block that displays the slot name, canvas size, and aspect ratio, so empty slots are obvious and correctly sized.

---

## 9. INTERACTIVITY

- Chips and category cards: hover lift, click prefills quote (Grouping plus Specific Item), smooth-scroll to the form.
- Finishes strip: hover or tap reveals name plus one line.
- How It Works: stepper with reveal on scroll or click-through.
- Gallery: carousel plus lightbox.
- Sticky Request a Quote button on scroll, priority on mobile.
- Micro-interactions: subtle fade or slide reveal on scroll, hover states on cards.
- Not allowed: live preview, product builder, price calculator, real-time mockups.

---

## 10. DATA MODEL (quote inquiry)

Reuse the existing inquiries table (writes only). One record per submit.

```
inquiries
  id             : uuid
  inquiry_type   : "customisation_quote"
  name           : text (required)
  email          : text (required)
  phone          : text
  country        : text
  grouping       : text  (one of: Luxury Packaging & Branding,
                          Personal Gifts, Business Solutions,
                          Industrial Printing, Not sure / other)
  specific_item  : text  (prefilled from the clicked chip)
  approx_quantity: text
  message        : text
  attachment_url : text  (artwork or logo, uploaded to storage)
  source         : "website"
  created_at     : timestamp
```

- Artwork upload goes to a storage bucket, path stored in `attachment_url`.
- On success: show a confirmation state (received, the atelier will follow up with pricing and turnaround). Optional confirmation email via the existing email provider.

---

## 11. LAUNCH-INTEGRITY RULE

- Use real photos where they exist: the print work (hero and Luxury grouping) and the printer (Industrial grouping and How It Works).
- Representative imagery (material textures, generic mockups, the machine) is allowed for capability and finishes. It must not be presented as completed client jobs.
- No fabricated client samples, no fake testimonials, no invented brand logos on mockups.
- The gallery shows real finished pieces only and grows over time. Omit it if empty at launch.

---

## 12. ANALYTICS

Fire on this page:
- Studio Category Clicked (when a chip or category card is clicked; include grouping and item).
- Quote Requested (on form submit). Consistent with the site convention of firing on submission, since payment and fulfillment happen offline.

---

## 13. INPUTS NEEDED FROM CLIENT

1. Real photos of the A3 UV DTF printer, ideally mid-print. Highest-value visual for the hero, Industrial grouping, and How It Works.
2. Any completed real pieces, which unlock the hero composition and the gallery.
3. Finish macro shots (gold foil, metal, acrylic, crystal, full colour) for the finishes strip.
4. Confirmation that representative imagery is acceptable for groupings with no real work yet.

---

## 14. IN ONE SENTENCE

Rebuild `/studio` only, keeping all existing copy, into a visual and interactive quote-based page: a real-work hero, a finishes strip, four alternating image and text groupings whose chips prefill the quote form, an honest how-it-works stepper, and a real-work gallery, with every image slot specced by size, aspect ratio, and type, no commerce or pricing, and no fabricated samples.
