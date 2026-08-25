// Spec v5 addendum: the Customisation Studio's 14 raw UV-printing
// categories, collapsed into 4 curated groupings so the page reads as
// a luxury house, not a hardware catalogue. Static content, no DB
// read and no CSV generator (that pipeline predates the admin-panel
// pivot and is otherwise unused now) -- same "plain data file" pattern
// as the About page's SECTIONS. Edit this file + redeploy to change
// copy; no CMS, per spec.
//
// spotlight: true groupings are the only ones allowed on the
// homepage (luxury face only -- fridge magnets etc. stay inside the
// Studio page, never the front door).
export type StudioGrouping = {
  slug: string;
  name: string;
  spotlight: boolean;
  intro: string;
  items: string[];
  // Real print-work photo path, or undefined when none exists yet --
  // the page renders the spec's labeled placeholder block instead of
  // a fabricated stock photo (launch-integrity rule). Shown by default
  // and whenever the selected item below has no photo of its own.
  image?: string;
  imageBrief: string;
  // Per-item real photos, keyed by the exact string in `items`. Not
  // every item needs an entry -- StudioGroupingGallery falls back to
  // `image` (or a placeholder) for items without one yet.
  itemImages?: Record<string, string>;
};

export const STUDIO_GROUPINGS: StudioGrouping[] = [
  {
    slug: "luxury-packaging-branding",
    name: "Luxury Packaging & Branding",
    spotlight: true,
    intro:
      "Perfume and beauty packaging, metal and mini labels, brand plates, acrylic awards and crystal UV stickers -- finished with the same craftsmanship as the Aurielle Collection itself.",
    image: "/images/studio/luxury-packaging-branding/perfume-bottle-printing.jpg",
    imageBrief: "Perfume packaging, metal labels",
    items: [
      "Perfume Bottle Printing",
      "Cosmetic Packaging",
      "Metal Labels",
      "Mini Labels",
      "Brand Plates",
      "Acrylic Awards",
      "Crystal / UV Luxury Stickers",
    ],
    itemImages: {
      "Perfume Bottle Printing": "/images/studio/luxury-packaging-branding/perfume-bottle-printing.jpg",
      "Cosmetic Packaging": "/images/studio/luxury-packaging-branding/cosmetic-packaging.jpg",
      "Metal Labels": "/images/studio/luxury-packaging-branding/metal-labels.jpg",
      "Mini Labels": "/images/studio/luxury-packaging-branding/mini-labels.jpg",
      "Brand Plates": "/images/studio/luxury-packaging-branding/brand-plates.jpg",
      "Acrylic Awards": "/images/studio/luxury-packaging-branding/acrylic-awards.jpg",
      "Crystal / UV Luxury Stickers": "/images/studio/luxury-packaging-branding/crystal-uv-sticker.jpg",
    },
  },
  {
    slug: "personal-gifts",
    name: "Personal Gifts",
    spotlight: false,
    intro:
      "Custom printing for the people and moments in your life -- phone cases, home decor, wedding keepsakes, souvenirs and fashion accessories.",
    image: "/images/studio/personal-gifts/phone-cases.jpg",
    imageBrief: "Phone case or keepsake",
    items: [
      "Phone & Electronics Cases",
      "Home Decoration",
      "Wedding & Event Keepsakes",
      "Souvenirs",
      "Fashion Accessories",
    ],
    itemImages: {
      "Phone & Electronics Cases": "/images/studio/personal-gifts/phone-cases.jpg",
      "Home Decoration": "/images/studio/personal-gifts/home-decoration.jpg",
      "Wedding & Event Keepsakes": "/images/studio/personal-gifts/wedding-event-keepsakes.jpg",
      "Souvenirs": "/images/studio/personal-gifts/souvenirs.jpg",
      "Fashion Accessories": "/images/studio/personal-gifts/fashion-accessories.jpg",
    },
  },
  {
    slug: "business-solutions",
    name: "Business Solutions",
    spotlight: false,
    intro:
      "Branded materials for restaurants, offices and storefronts -- corporate gifts, hospitality items, access cards, signage and name plates.",
    image: "/images/studio/business-solutions/corporate-gifts.jpg",
    imageBrief: "Signage, cards, name plates",
    items: [
      "Corporate Gifts",
      "Restaurant & Hospitality Items",
      "PVC / Loyalty / Access Cards",
      "Acrylic Signage",
      "QR Displays",
      "Name Plates",
    ],
    itemImages: {
      "Corporate Gifts": "/images/studio/business-solutions/corporate-gifts.jpg",
      "Restaurant & Hospitality Items": "/images/studio/business-solutions/restaurant-hospitality-items.jpg",
      "PVC / Loyalty / Access Cards": "/images/studio/business-solutions/pvc-loyalty-access-cards.jpg",
      "Acrylic Signage": "/images/studio/business-solutions/acrylic-signage.jpg",
      "QR Displays": "/images/studio/business-solutions/qr-displays.jpg",
      "Name Plates": "/images/studio/business-solutions/name-plates.jpg",
    },
  },
  {
    slug: "industrial-printing",
    name: "Industrial Printing",
    spotlight: false,
    intro:
      "Small-batch and prototype production for manufacturers and private-label brands -- metal printing, small plastics, labels and tags.",
    image: "/images/studio/industrial-printing/metal-printing.jpg",
    imageBrief: "The A3 UV DTF printer",
    items: [
      "Metal Printing",
      "Small Plastics",
      "Custom Manufacturing (Prototype / Small-Batch / Private-Label)",
      "Labels & Tags",
    ],
    itemImages: {
      "Metal Printing": "/images/studio/industrial-printing/metal-printing.jpg",
      "Small Plastics": "/images/studio/industrial-printing/small-plastics.jpg",
      "Custom Manufacturing (Prototype / Small-Batch / Private-Label)":
        "/images/studio/industrial-printing/custom-manufacturing.jpg",
      "Labels & Tags": "/images/studio/industrial-printing/labels-tags.jpg",
    },
  },
];
