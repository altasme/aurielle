import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// "Website Management": lets the client edit the copy and photos of
// every marketing page herself from the admin panel, without a code
// change per edit. This file is the single source of truth for what's
// editable -- one schema entry per page, each field/slot carrying the
// site's current hardcoded copy as its default. A page is rendered as
// `override ?? default` (resolvePageContent()); the admin editor shows
// the exact same resolved value, pre-filled, so the client always sees
// the live text whether or not it's ever been touched.
//
// Deliberately NOT covered here (kept as plain code): the product
// catalogue (already its own "Product & Pricing" admin module), the
// Customisation Studio's four print-category galleries and finish
// tiles (STUDIO_GROUPINGS/STUDIO_FINISHES -- each item carries its own
// photos and is closer to a second catalogue than a page of copy), and
// short feature-flag-conditional sentences that embed an inline link.

export type TextFieldType = "text" | "textarea";

export type TextFieldDef = {
  key: string;
  label: string;
  type: TextFieldType;
  default: string;
};

export type ImageSlotDef = {
  key: string;
  label: string;
  default: string;
  recommendedSize: string;
  aspectRatio: string;
  format: string;
  maxSizeMb: number;
};

export type PageSchema = {
  slug: string;
  label: string;
  description: string;
  textFields: TextFieldDef[];
  imageSlots: ImageSlotDef[];
};

// Every full-bleed page-hero/banner image on this site is rendered
// with object-cover, so the exact crop tolerates some variance -- one
// consistent recommendation is easier for a non-technical client to
// follow than a slightly different number per page.
function heroImageSlot(key: string, label: string, defaultSrc: string): ImageSlotDef {
  return {
    key,
    label,
    default: defaultSrc,
    recommendedSize: "1920x1080px or larger",
    aspectRatio: "16:9 (landscape)",
    format: "JPG or WebP",
    maxSizeMb: 5,
  };
}

export const SITE_CONTENT_PAGES: PageSchema[] = [
  {
    slug: "home",
    label: "Homepage",
    description: "The front door: hero, the three-craft overview, and the closing call to action.",
    textFields: [
      { key: "hero_eyebrow", label: "Hero — small script line", type: "text", default: "Aurielle Paris Atelier" },
      { key: "hero_headline", label: "Hero — headline", type: "text", default: "THE ART OF FRAGRANCE" },
      {
        key: "hero_body",
        label: "Hero — supporting paragraph",
        type: "textarea",
        default:
          "From signature scents to fragrance supply and private-label creation, Aurielle Paris brings together refined fragrances, quality fragrance materials, custom packaging and product development support for individuals, creators and businesses.",
      },
      { key: "hero_cta_primary", label: "Hero — first button label", type: "text", default: "Discover Aurielle" },
      { key: "hero_cta_secondary", label: "Hero — second button label", type: "text", default: "Explore the Atelier" },

      { key: "studio_teaser_heading", label: "Studio teaser — heading", type: "text", default: "Customisation Studio" },
      {
        key: "studio_teaser_body",
        label: "Studio teaser — description",
        type: "textarea",
        default: "Made-to-order UV printing -- packaging, labels and branding finished to a luxury standard.",
      },
      { key: "studio_teaser_cta", label: "Studio teaser — button label", type: "text", default: "Explore the Studio" },

      { key: "pillar_collection_heading", label: "Collection card — heading", type: "text", default: "Collection" },
      { key: "pillar_collection_eyebrow", label: "Collection card — small line", type: "text", default: "The Fragrance Collection" },
      {
        key: "pillar_collection_body",
        label: "Collection card — description",
        type: "textarea",
        default: "Refined perfume oils crafted to become part of your signature.",
      },
      { key: "pillar_collection_cta", label: "Collection card — button label", type: "text", default: "Shop the Collection" },

      { key: "pillar_atelier_heading", label: "Atelier Supply card — heading", type: "text", default: "Atelier Supply" },
      { key: "pillar_atelier_eyebrow", label: "Atelier Supply card — small line", type: "text", default: "Fragrance Supply & Creation" },
      {
        key: "pillar_atelier_body",
        label: "Atelier Supply card — description",
        type: "textarea",
        default: "Fragrance oils and sourcing for creators and businesses building their own line.",
      },
      { key: "pillar_atelier_cta", label: "Atelier Supply card — button label", type: "text", default: "Explore Supply" },

      { key: "pillar_studio_heading", label: "Studio card — heading", type: "text", default: "Studio" },
      { key: "pillar_studio_eyebrow", label: "Studio card — small line", type: "text", default: "Customisation Studio" },
      {
        key: "pillar_studio_body",
        label: "Studio card — description",
        type: "textarea",
        default: "Made-to-order UV printing -- packaging, labels and branding finished to a luxury standard.",
      },
      { key: "pillar_studio_cta", label: "Studio card — button label", type: "text", default: "Explore the Studio" },

      { key: "collection_heading", label: "\"The Collection\" section — heading", type: "text", default: "The Collection" },
      {
        key: "collection_body",
        label: "\"The Collection\" section — description",
        type: "textarea",
        default: "Refined perfume oils crafted to become part of your signature.",
      },

      { key: "atelier_heading", label: "\"Atelier Supply\" section — heading", type: "text", default: "Atelier Supply" },
      {
        key: "atelier_body",
        label: "\"Atelier Supply\" section — description",
        type: "textarea",
        default: "Fragrance oils and sourcing for creators and businesses building their own line.",
      },

      { key: "why_heading", label: "\"Why Aurielle\" — heading", type: "text", default: "Why Aurielle" },
      { key: "why_1_title", label: "\"Why Aurielle\" — card 1 title", type: "text", default: "Refined Fragrance" },
      {
        key: "why_1_body",
        label: "\"Why Aurielle\" — card 1 description",
        type: "textarea",
        default: "Signature perfume oils, crafted to become part of your signature.",
      },
      { key: "why_2_title", label: "\"Why Aurielle\" — card 2 title", type: "text", default: "Materials & Supply" },
      {
        key: "why_2_body",
        label: "\"Why Aurielle\" — card 2 description",
        type: "textarea",
        default: "Fragrance oils and sourcing for creators and businesses building their own line.",
      },
      { key: "why_3_title", label: "\"Why Aurielle\" — card 3 title", type: "text", default: "Custom Craftsmanship" },
      {
        key: "why_3_body",
        label: "\"Why Aurielle\" — card 3 description",
        type: "textarea",
        default: "Made-to-order UV printing -- packaging, labels and branding finished to a luxury standard.",
      },
      {
        key: "why_closing_line",
        label: "\"Why Aurielle\" — closing script line",
        type: "text",
        default: "One atelier standard across everything we make.",
      },

      {
        key: "final_cta_eyebrow",
        label: "Closing section — small script line",
        type: "text",
        default: "From the scent you wear to the brand you build.",
      },
      { key: "final_cta_heading", label: "Closing section — heading", type: "text", default: "Create Something of Your Own" },
      {
        key: "final_cta_body",
        label: "Closing section — description",
        type: "textarea",
        default:
          "Whether you're looking for your next personal fragrance or developing something for your own brand, Aurielle Paris Atelier brings together refined fragrance, quality materials, and the freedom to create something uniquely yours.",
      },
      { key: "final_cta_primary", label: "Closing section — first button label", type: "text", default: "Explore the Collection" },
      { key: "final_cta_secondary", label: "Closing section — second button label", type: "text", default: "Talk to the Atelier" },
    ],
    imageSlots: [
      heroImageSlot("hero_image", "Hero background photo", "/images/hero.jpg"),
      {
        key: "studio_teaser_image",
        label: "Studio teaser photo",
        default: "/images/atelier/custom-label.jpg",
        recommendedSize: "2100x900px or larger",
        aspectRatio: "21:9 (wide banner)",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
      heroImageSlot("final_cta_image", "Closing section background photo", "/images/perfumes/main/satin-mystique.jpg"),
    ],
  },

  {
    slug: "about",
    label: "About",
    description: "The brand story, the founder, and the community section.",
    textFields: [
      { key: "hero_eyebrow", label: "Hero — small script line", type: "text", default: "Let's begin" },
      { key: "hero_headline", label: "Hero — headline", type: "text", default: "The Aurielle Paris Atelier" },
      {
        key: "hero_body",
        label: "Hero — supporting line",
        type: "textarea",
        default: "One house, three crafts, one atelier standard across everything we make.",
      },
      { key: "story_heading", label: "Story section — heading", type: "text", default: "The Story Behind Aurielle" },
      {
        key: "story_body_1",
        label: "Story — paragraph 1",
        type: "textarea",
        default: "A fragrance is more than a scent. It is a memory, an emotion, a presence.",
      },
      {
        key: "story_body_2",
        label: "Story — paragraph 2",
        type: "textarea",
        default:
          "Inspired by the timeless elegance of Paris and the artistry of French perfumery, Aurielle Paris Atelier was created to make fragrance feel personal.",
      },
      {
        key: "story_body_3",
        label: "Story — paragraph 3",
        type: "textarea",
        default:
          "As the atelier grew, so did its craft. What began with perfume oils and fragrance materials has expanded into a full house of craft: refined perfumes, professional fragrance supply and made-to-order custom printing, each held to the same atelier standard.",
      },
      {
        key: "story_body_4",
        label: "Story — closing line",
        type: "textarea",
        default: "A world of craft, created to be discovered.",
      },
      { key: "whatwedo_heading", label: "\"What We Do\" — heading", type: "text", default: "What We Do" },
      {
        key: "whatwedo_body",
        label: "\"What We Do\" — subheading",
        type: "textarea",
        default: "One atelier standard across three crafts.",
      },
      { key: "whatwedo_1_title", label: "\"What We Do\" — card 1 title", type: "text", default: "The Collection" },
      {
        key: "whatwedo_1_body",
        label: "\"What We Do\" — card 1 description",
        type: "textarea",
        default: "Refined perfume oils crafted to become part of your signature.",
      },
      { key: "whatwedo_2_title", label: "\"What We Do\" — card 2 title", type: "text", default: "Atelier Supply" },
      {
        key: "whatwedo_2_body",
        label: "\"What We Do\" — card 2 description",
        type: "textarea",
        default: "Fragrance oils and sourcing for creators and businesses building their own line.",
      },
      { key: "whatwedo_3_title", label: "\"What We Do\" — card 3 title", type: "text", default: "Customisation Studio" },
      {
        key: "whatwedo_3_body",
        label: "\"What We Do\" — card 3 description",
        type: "textarea",
        default: "Made-to-order UV printing, packaging, labels and branding finished to a luxury standard.",
      },
      { key: "community_heading", label: "Community section — heading", type: "text", default: "Fragrance in the Real World" },
      {
        key: "community_body",
        label: "Community section — description",
        type: "textarea",
        default:
          "From personal signatures to growing fragrance businesses, Aurielle is part of a community of people creating, discovering and sharing their craft.",
      },
    ],
    imageSlots: [
      heroImageSlot("hero_image", "Hero background photo", "/images/hero.jpg"),
      {
        key: "founder_image",
        label: "Founder portrait",
        default: "/images/atelier/founder.jpg",
        recommendedSize: "1600x1200px or larger",
        aspectRatio: "4:3",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
      {
        key: "community_image",
        label: "Community event photo",
        default: "/images/atelier/community-event.jpg",
        recommendedSize: "1920x1080px or larger",
        aspectRatio: "16:9",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
    ],
  },

  {
    slug: "collection",
    label: "Aurielle Collection",
    description: "The perfume catalogue's landing page -- hero, mood finder and brand storytelling around it.",
    textFields: [
      { key: "hero_eyebrow", label: "Hero — small script line", type: "text", default: "Fragrance, in full" },
      { key: "hero_headline", label: "Hero — headline", type: "text", default: "The Aurielle Collection" },
      {
        key: "hero_body",
        label: "Hero — supporting line",
        type: "textarea",
        default: "Refined perfume oils crafted to become part of your signature.",
      },
      { key: "moods_eyebrow", label: "Mood finder — small script line", type: "text", default: "Find Your Scent" },
      { key: "moods_heading", label: "Mood finder — heading", type: "text", default: "A Fragrance for Every Mood" },
      {
        key: "moods_body",
        label: "Mood finder — description",
        type: "textarea",
        default: "Discover scents inspired by femininity, mystery, elegance, warmth and allure.",
      },
      { key: "experience_eyebrow", label: "Experience section — small script line", type: "text", default: "Every Bottle, a Story" },
      { key: "experience_heading", label: "Experience section — heading", type: "text", default: "The Aurielle Experience" },
      { key: "experience_1_name", label: "Experience photo 1 — caption", type: "text", default: "Paris Nocturne" },
      {
        key: "experience_1_descriptor",
        label: "Experience photo 1 — description",
        type: "text",
        default: "Midnight Paris, candlelight and quiet sophistication.",
      },
      { key: "experience_2_name", label: "Experience photo 2 — caption", type: "text", default: "Donna Velours" },
      {
        key: "experience_2_descriptor",
        label: "Experience photo 2 — description",
        type: "text",
        default: "Deep plum, velvet and dark florals.",
      },
      { key: "experience_3_name", label: "Experience photo 3 — caption", type: "text", default: "Rouge Royale" },
      {
        key: "experience_3_descriptor",
        label: "Experience photo 3 — description",
        type: "text",
        default: "Crimson, burgundy, roses and polished gold.",
      },
      { key: "philosophy_eyebrow", label: "Philosophy section — small script line", type: "text", default: "The Aurielle Philosophy" },
      { key: "philosophy_heading", label: "Philosophy section — heading", type: "text", default: "A Scent Becomes Part of You" },
      {
        key: "philosophy_body_1",
        label: "Philosophy — paragraph 1",
        type: "textarea",
        default: "Fragrance is more than something you wear. It becomes a memory, a mood, a presence.",
      },
      {
        key: "philosophy_body_2",
        label: "Philosophy — paragraph 2",
        type: "textarea",
        default:
          "Aurielle was created around the belief that the right scent should feel personal, something that accompanies you, reflects you and eventually becomes part of how you are remembered.",
      },
    ],
    imageSlots: [
      heroImageSlot("hero_image", "Hero background photo", "/images/headers/collection-hero.jpg"),
      {
        key: "experience_image_1",
        label: "Experience photo 1",
        default: "/images/perfumes/main/paris-nocturne.jpg",
        recommendedSize: "1200x1600px or larger",
        aspectRatio: "3:4 (portrait)",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
      {
        key: "experience_image_2",
        label: "Experience photo 2",
        default: "/images/perfumes/main/donna-velours.jpg",
        recommendedSize: "1200x1600px or larger",
        aspectRatio: "3:4 (portrait)",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
      {
        key: "experience_image_3",
        label: "Experience photo 3",
        default: "/images/perfumes/main/rouge-royale.jpg",
        recommendedSize: "1200x1600px or larger",
        aspectRatio: "3:4 (portrait)",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
    ],
  },

  {
    slug: "atelier-supply",
    label: "Atelier Supply",
    description: "The materials catalogue's landing page -- hero, capabilities, process and facility photos.",
    textFields: [
      { key: "hero_headline", label: "Hero — headline", type: "text", default: "Atelier Supply" },
      {
        key: "hero_body",
        label: "Hero — supporting line",
        type: "textarea",
        default: "Fragrance materials and sourcing for creators and businesses building their own line.",
      },
      {
        key: "capability_1_title",
        label: "Capability card 1 — title (also shown on the Homepage)",
        type: "text",
        default: "Fragrance Oils",
      },
      {
        key: "capability_1_body",
        label: "Capability card 1 — description",
        type: "textarea",
        default: "Source fragrance oils and profiles for personal, creative or commercial applications.",
      },
      {
        key: "capability_2_title",
        label: "Capability card 2 — title (also shown on the Homepage)",
        type: "text",
        default: "Material Profiles",
      },
      {
        key: "capability_2_body",
        label: "Capability card 2 — description",
        type: "textarea",
        default: "Explore documented fragrance material profiles to guide your next project.",
      },
      { key: "capability_3_title", label: "Capability card 3 — title (also shown on the Homepage)", type: "text", default: "OEM & ODM" },
      {
        key: "capability_3_body",
        label: "Capability card 3 — description",
        type: "textarea",
        default: "Develop your own fragrance products with support from concept through finished product.",
      },
      {
        key: "capability_4_title",
        label: "Capability card 4 — title (also shown on the Homepage)",
        type: "text",
        default: "Sourcing & Logistics",
      },
      {
        key: "capability_4_body",
        label: "Capability card 4 — description",
        type: "textarea",
        default: "Access supply and international shipping support for commercial fragrance projects.",
      },
      { key: "concept_heading", label: "Process section — heading", type: "text", default: "From Concept to Finished Product" },
      {
        key: "concept_body",
        label: "Process section — description",
        type: "textarea",
        default: "Bring your fragrance idea to life through a process designed around your brand, your product and your goals.",
      },
      { key: "concept_1_title", label: "Process step 1 — title", type: "text", default: "Develop Your Scent" },
      {
        key: "concept_1_body",
        label: "Process step 1 — description",
        type: "textarea",
        default: "Select from available fragrance profiles or work toward a scent identity suited to your product and brand.",
      },
      { key: "concept_2_title", label: "Process step 2 — title", type: "text", default: "Choose Your Packaging" },
      {
        key: "concept_2_body",
        label: "Process step 2 — description",
        type: "textarea",
        default: "Explore bottles, caps, boxes, pouches and other packaging components.",
      },
      { key: "concept_3_title", label: "Process step 3 — title", type: "text", default: "Make It Yours" },
      {
        key: "concept_3_body",
        label: "Process step 3 — description",
        type: "textarea",
        default: "Bring your labels, branding and finishes to life through the Customisation Studio.",
      },
      { key: "concept_4_title", label: "Process step 4 — title", type: "text", default: "Bring It to Market" },
      {
        key: "concept_4_body",
        label: "Process step 4 — description",
        type: "textarea",
        default: "Coordinate production, sourcing and supply for your finished fragrance products.",
      },
      { key: "behind_eyebrow", label: "Facility section — small script line", type: "text", default: "Behind the Supply" },
      { key: "behind_heading", label: "Facility section — heading", type: "text", default: "Built for Ideas That Need to Scale" },
      {
        key: "behind_body",
        label: "Facility section — description",
        type: "textarea",
        default:
          "Whether you're developing a signature scent, launching a fragrance collection or sourcing products for an established business, Atelier Supply connects fragrance, materials and supply into one process.",
      },
      { key: "catalogue_heading", label: "Catalogue section — heading", type: "text", default: "The Catalogue" },
      {
        key: "catalogue_body",
        label: "Catalogue section — description",
        type: "textarea",
        default:
          "Fragrance materials, bottles, pouches, boxes and labels, priced in USD per kilogram. Browse by category or search the full catalogue.",
      },
    ],
    imageSlots: [
      heroImageSlot("hero_image", "Hero background photo", "/images/headers/atelier-supply-hero.jpg"),
      {
        key: "behind_warehouse",
        label: "Facility photo — Warehouse",
        default: "/images/atelier/warehouse.jpg",
        recommendedSize: "1600x1000px or larger",
        aspectRatio: "16:10",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
      {
        key: "behind_production",
        label: "Facility photo — Production",
        default: "/images/atelier/production.jpg",
        recommendedSize: "1600x1000px or larger",
        aspectRatio: "16:10",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
      {
        key: "behind_packaging",
        label: "Facility photo — Packaging",
        default: "/images/atelier/packaging.jpg",
        recommendedSize: "1600x1000px or larger",
        aspectRatio: "16:10",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
      {
        key: "behind_finished",
        label: "Facility photo — Finished Product",
        default: "/images/atelier/finished-product.jpg",
        recommendedSize: "1600x1000px or larger",
        aspectRatio: "16:10",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
    ],
  },

  {
    slug: "studio",
    label: "Customisation Studio",
    description: "The print-on-demand studio's landing page -- hero, how-it-works and the quote request intro.",
    textFields: [
      { key: "hero_eyebrow", label: "Hero — small script line", type: "text", default: "The Customisation Studio" },
      { key: "hero_headline", label: "Hero — headline", type: "text", default: "Made-to-Order UV Printing" },
      {
        key: "hero_body",
        label: "Hero — supporting paragraph",
        type: "textarea",
        default:
          "Every piece the Studio produces is made to order, no fixed catalogue, no stock pricing. Browse what we print by category below, then request a quote for your own project.",
      },
      { key: "hero_cta", label: "Hero — button label", type: "text", default: "Request a Quote" },
      { key: "finishes_heading", label: "Finishes strip — heading", type: "text", default: "What the Studio Can Do" },
      {
        key: "finishes_body",
        label: "Finishes strip — description",
        type: "textarea",
        default: "Hover or tap a finish to learn more.",
      },
      { key: "howitworks_heading", label: "\"How It Works\" — heading", type: "text", default: "How It Works" },
      { key: "howitworks_1_title", label: "Step 1 — title", type: "text", default: "Upload Your Artwork" },
      {
        key: "howitworks_1_body",
        label: "Step 1 — description",
        type: "textarea",
        default: "Send your design, logo or reference file with your quote request.",
      },
      { key: "howitworks_2_title", label: "Step 2 — title", type: "text", default: "We Proof It" },
      {
        key: "howitworks_2_body",
        label: "Step 2 — description",
        type: "textarea",
        default: "The atelier reviews your file and confirms sizing, placement and finish.",
      },
      { key: "howitworks_3_title", label: "Step 3 — title", type: "text", default: "We Print" },
      {
        key: "howitworks_3_body",
        label: "Step 3 — description",
        type: "textarea",
        default: "Your piece is printed to order on our UV DTF printer.",
      },
      { key: "howitworks_4_title", label: "Step 4 — title", type: "text", default: "Delivered" },
      {
        key: "howitworks_4_body",
        label: "Step 4 — description",
        type: "textarea",
        default: "Your finished piece is packed and sent to you.",
      },
      { key: "quote_heading", label: "Quote request — heading", type: "text", default: "Request a Quote" },
      {
        key: "quote_body",
        label: "Quote request — description",
        type: "textarea",
        default:
          "Tell us what you have in mind and, if you have one, attach your artwork or logo. The atelier will follow up with pricing and turnaround.",
      },
    ],
    imageSlots: [
      {
        key: "hero_image",
        label: "Hero background photo",
        default: "/images/headers/studio-hero.jpg",
        recommendedSize: "1920x640px or larger",
        aspectRatio: "3:1 (wide banner)",
        format: "JPG or WebP",
        maxSizeMb: 5,
      },
    ],
  },

  {
    slug: "business",
    label: "For Your Business",
    description: "The wholesale/business inquiry page.",
    textFields: [
      { key: "eyebrow", label: "Small script line", type: "text", default: "Let's build something together." },
      { key: "heading", label: "Headline", type: "text", default: "For Your Business" },
      {
        key: "body",
        label: "Description",
        type: "textarea",
        default:
          "Looking for fragrance materials for your own creations, products or business? Tell us what you need and the atelier will follow up with pricing, availability and next steps.",
      },
    ],
    imageSlots: [],
  },

  {
    slug: "affiliate",
    label: "Be an Affiliate",
    description: "The affiliate program application page.",
    textFields: [
      { key: "eyebrow", label: "Small script line", type: "text", default: "Share the house you love." },
      { key: "heading", label: "Headline", type: "text", default: "Be an Affiliate" },
      {
        key: "body",
        label: "Description",
        type: "textarea",
        default:
          "Share Aurielle with your audience. Tell us a bit about yourself and where you sell or post, and we'll review your application and follow up with the details.",
      },
    ],
    imageSlots: [],
  },

  {
    slug: "contact",
    label: "Contact",
    description: "The general contact page.",
    textFields: [
      { key: "eyebrow", label: "Small script line", type: "text", default: "Let's create something beautiful." },
      { key: "heading", label: "Headline", type: "text", default: "Contact" },
      {
        key: "body",
        label: "Description",
        type: "textarea",
        default: "Send us a message and the atelier will get back to you directly.",
      },
    ],
    imageSlots: [],
  },
];

export function getPageSchema(page: string): PageSchema | undefined {
  return SITE_CONTENT_PAGES.find((p) => p.slug === page);
}

export type ResolvedPageContent = {
  schema: PageSchema | undefined;
  text: Record<string, string>;
  images: Record<string, string>;
};

// Every public page and the admin editor both go through this: fetch
// this page's saved overrides, then fill in the schema default for
// anything never edited. The two rows tables are read separately
// (rather than one combined query) since a page can have zero rows in
// either -- that's the normal, expected state before any edit is made.
export async function resolvePageContent(page: string): Promise<ResolvedPageContent> {
  const schema = getPageSchema(page);
  const supabase = getSupabaseAdminClient();

  const [{ data: textRows, error: textError }, { data: imageRows, error: imageError }] = await Promise.all([
    supabase.from("site_text_fields").select("field_key, value").eq("page", page),
    supabase.from("site_image_slots").select("slot_key, image_url").eq("page", page),
  ]);
  if (textError) throw new Error(`Failed to load site text for ${page}: ${textError.message}`);
  if (imageError) throw new Error(`Failed to load site images for ${page}: ${imageError.message}`);

  const text: Record<string, string> = {};
  for (const field of schema?.textFields ?? []) text[field.key] = field.default;
  for (const row of textRows ?? []) text[row.field_key as string] = row.value as string;

  const images: Record<string, string> = {};
  for (const slot of schema?.imageSlots ?? []) images[slot.key] = slot.default;
  for (const row of imageRows ?? []) images[row.slot_key as string] = row.image_url as string;

  return { schema, text, images };
}

// The plain accessor every public page component calls -- just the
// resolved values, no schema metadata (that's only needed by the admin
// editor, via src/lib/admin/site-content.ts).
export async function getSiteContent(page: string): Promise<{ text: Record<string, string>; images: Record<string, string> }> {
  const { text, images } = await resolvePageContent(page);
  return { text, images };
}
