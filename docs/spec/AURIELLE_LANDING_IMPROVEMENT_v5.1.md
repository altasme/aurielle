# AURIELLE PARIS ATELIER
## LANDING PAGE — IMPROVEMENT SPEC (v5.1, build review)

> Reviewed against v5 + Jewel's requirements. **The design quality is high and the real product photos respect the launch-integrity rule.** The problems are not visual — they're information architecture, labelling, and emphasis. Every fix below is reorder / rename / re-rank copy and layout. **No rebuild, no new commerce, no design-system change.**

---

## THE ONE-LINE VERDICT

The page contains all three pillars, but it **interleaves three audiences instead of giving each a clean run**, **blurs the line between Atelier Supply and Studio**, and **labels three nav items so similarly a customer can't tell them apart**. A visitor who came for UV printing (Jewel's new business) has to scroll through supply-chain, OEM, factory, and fragrance-story sections before the page clearly serves them.

---

## ★ GOVERNING DECISION (needed before final edits)

Whose priority wins the homepage? This sets how aggressively we rebalance.

- **Option A — Balanced three-pillar (recommended).** One maison, three clean runs, each pillar equal weight. Best fits "Studio visible *agad*" without abandoning the perfume brand.
- **Option B — Perfume-first.** Studio stays a strong secondary. Only do this if Jewel confirms perfume is the priority — which contradicts her "makikita agad" ask.
- **Option C — Studio-forward.** Studio leads. Highest brand risk on a "Paris Atelier."

Everything below assumes **Option A** unless Jewel says otherwise. Fixes 1–8 apply to all options; the *degree* of reordering is the only priority-dependent part.

---

## CORE PROBLEMS

**1. The page doesn't commit to an audience path.**
Current order interleaves: pillars → Supply detail → Studio detail → factory → fragrance-process → custom photos → *then finally* the shoppable perfumes → perfume experience → mood → philosophy → why → story → community. A shopper who wants to buy a ₱199 perfume scrolls past OEM/ODM and factory photos first. A UV-printing customer gets buried in fragrance copy. **Fix: group into three per-pillar runs.**

**2. The Supply ↔ Studio boundary is blurred.**
"Custom Packaging" sits under **Atelier Supply** (Fragrance Oils · Custom Packaging · OEM & ODM · Sourcing). "Perfume bottle printing / cosmetic packaging / metal labels" sits under **Studio**. Packaging and labels appear in *both* pillars — a customer cannot tell which one to use. **Fix: draw a hard boundary (below).**

**3. Nav labels collide.** `COLLECTION · ATELIER · STUDIO` — three of four items read as near-synonyms. "Atelier" and "Studio" both mean "custom workshop" to a normal shopper. This is exactly the ★3 collision v5 flagged, reintroduced by shortening the labels. **Fix: disambiguate the nav.**

**4. The Studio pillar card is the weakest** despite Jewel asking for it to stand out. In the "A World of Fragrance" band, Aurielle and Atelier each have a full description; the Studio has shorter copy, one button, and sits in the far-right (most-ignored) position. Right now it reads as the *least* prominent pillar — the opposite of the requirement. **Fix: bring to parity or better.**

**5. Repetitive "fragrance" headings re-narrow the brand.** "A World of Fragrance," "More Than Fragrance," "A Fragrance for Every Mood," "Fragrance in the Real World." The hero widens the brand to three crafts; these headings keep collapsing it back to perfume. Grouping (Fix 1) mostly solves this — the fragrance headings become fine once they cluster inside the perfume run.

**6. "BE AN AFFILIATE" is the loudest button on the page.** Solid burgundy, top-right — visually outranking Shop and Request-a-Quote. Affiliate recruitment is a real goal, but it shouldn't beat the primary commerce actions on the homepage. **Fix: de-rank to secondary.**

**7. Shoppable perfumes are buried** below the B2B/Studio detail (they first appear ~7 sections down). **Fix: in Option A, the perfume run starts high, right after the pillar band.**

**8. Hero CTAs ignore the Studio.** "Discover Aurielle" (perfume) + "Explore the Atelier" (supply) — neither points to the Studio. The pillar band below covers it, but the hero itself under-serves the new business.

---

## RECOMMENDED REORDERED IA (Option A)

Reorganise the existing sections into three clean runs. **Nothing is deleted — sections are grouped and re-headed.**

```
1. HERO — the maison (3 crafts, 3 CTAs or a "choose your path" secondary)
2. THREE PILLARS — equal weight, "choose your path"

── PERFUME RUN (B2C — emotion → buy) ──────────────
3. The Aurielle Collection — featured perfumes (SHOP, pull up from deep)
4. The Aurielle Experience — story bottles
5. Find Your Scent — mood filter + Philosophy

── SUPPLY RUN (B2B fragrance — source / develop) ──
6. Atelier Supply — supply partner + 4 cards
7. From Concept to Finished Product — the fragrance-development process
8. Behind the Supply — factory / capability photos

── STUDIO RUN (UV printing — custom) ──────────────
9. The Customisation Studio — luxury face + chips
10. Your Brand. Your Bottle. — real custom-print photos
11. (Studio process: upload → product → proof → produce)  [see boundary note]

── BRAND + CLOSE (shared) ─────────────────────────
12. Why Aurielle + The Story Behind Aurielle
13. Fragrance in the Real World — community
14. Create Something of Your Own — final CTA
15. Footer
```

Each visitor now gets an uninterrupted run for their intent, and the fragrance-titled sections sit together where "fragrance" is the right word.

---

## SECTION-BY-SECTION PUNCH LIST

| Built section | Action |
|---|---|
| **Nav** | Rename `ATELIER` → **`ATELIER SUPPLY`**; keep `STUDIO` but see naming note. De-rank **BE AN AFFILIATE** to ghost/secondary style (outline, not solid burgundy). |
| **Hero** ("Fragrance · Craft · Customisation") | Keep. Confirm tagline (★). Consider making the secondary CTA route to the pillar chooser so all three paths are reachable from the hero. |
| **"A World of Fragrance"** (pillars) | Rename → something maison/path-choosing, e.g. **"One House, Three Crafts"** or **"Where Would You Like to Begin?"** Give the **Studio card full parity**: same description length, same button treatment as the other two. Reconsider its position (center or first if Studio priority). |
| **"More Than Fragrance / A Supply Partner"** + 4 cards | Keep as the **Supply run** header. Remove packaging overlap with Studio (boundary note). |
| **"From Concept to Finished Product"** (Develop Scent → Market) | This is a *fragrance-development* journey = **Supply**, not Studio. Keep it in the Supply run; do not let it read as the Studio's process. |
| **"Behind the Supply"** (factory) | Keep in Supply run. Good real-photo use. |
| **"The Customisation Studio / Luxury Packaging & Branding"** + chips | Keep — this is the Studio run header. Strong section. |
| **"Your Brand. Your Bottle."** (real print photos) | Keep in Studio run. Best asset for the printing business — real, on-brand. |
| **"The Aurielle Collection / Fragrance Made Personal"** (₱199 products) | **Move UP** to start the perfume run (right after pillars). This is the actual shoppable content; it's currently buried. |
| **"The Aurielle Experience"** (story bottles) | Keep in perfume run. |
| **"Find Your Scent" + "Aurielle Philosophy"** | Keep in perfume run. "A Fragrance for Every Mood" heading is fine once clustered here. |
| **"Why Aurielle" + "The Story Behind Aurielle"** | Keep as brand/close. Founder photo is real — good. |
| **"Fragrance in the Real World"** (event) | Keep as community/close. |
| **Final CTA "Create Something of Your Own"** | Keep — it already speaks to both perfume and "build your own brand," which is the right closing note. |

---

## NAMING & BOUNDARY RESOLUTION (★ — Jewel sign-off)

**Nav (disambiguate the three near-synonyms):**
- `COLLECTION` — shop finished Aurielle perfumes
- `ATELIER SUPPLY` — source fragrance materials / develop a fragrance (two words fixes the collision)
- `STUDIO` — custom UV printing. *If a customer still can't tell what "Studio" sells, consider a clearer word (e.g. "CUSTOM" or "CUSTOM PRINTING"). Jewel's call — brand elegance vs. clarity.*

**The hard boundary (this is the important one):**

| Pillar | Owns | Does NOT own |
|---|---|---|
| **Atelier Supply** | Fragrance oils, materials, scent profiles, OEM/ODM *fragrance formulation*, sourcing & logistics | Physical printing of packaging/labels |
| **Studio** | UV printing of bottles, cosmetic packaging, metal/mini labels, brand plates, acrylic awards, gifts, branding | Fragrance formulation or materials |

Rule of thumb for copy: **Supply = the scent and the sourcing. Studio = the print and the physical branding.** Move "Custom Packaging" language out of the Supply cards (or reframe it as "sourcing packaging components") so packaging *printing* clearly belongs to the Studio. Without this, both Jewel and customers stay confused about which pillar handles labels.

---

## WHAT NOT TO TOUCH

- The visual design system, palette, typography, spacing — all strong, leave it.
- The real photography (custom-print shots, factory, founder, event) — keep; it's the launch-integrity win.
- Per-pillar internal pages (Collection, Atelier Supply, Studio) — out of scope here; this is the homepage only.
- Cart, checkout, Kolekta flow, quote inquiry — untouched (v5 frozen list still holds).

---

## ★ BLOCKING INPUTS FOR JEWEL

1. **Homepage priority** — perfume-first, studio-forward, or balanced three-pillar (governs reorder aggressiveness).
2. **Hero tagline** — confirm "Fragrance · Craft · Customisation" or her "where personalisation meets craftsmanship."
3. **Nav clarity vs. elegance** — is "STUDIO" clear enough, or rename to "CUSTOM"? Approve "ATELIER SUPPLY."
4. **Affiliate emphasis** — confirm it's OK to de-rank "Be an Affiliate" below Shop / Request-a-Quote.
5. **Supply/Studio boundary** — confirm packaging *printing* belongs to Studio, materials/formulation to Supply.

---

## IN ONE SENTENCE

Keep the beautiful build, but regroup the homepage into three clean per-pillar runs, draw a hard line between Atelier Supply (the scent) and the Studio (the print), disambiguate three look-alike nav labels, bring the Studio pillar card up to parity, and de-rank the affiliate button — turning a page that *contains* three businesses into one a customer can actually navigate.
