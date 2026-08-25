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
};

export const STUDIO_GROUPINGS: StudioGrouping[] = [
  {
    slug: "luxury-packaging-branding",
    name: "Luxury Packaging & Branding",
    spotlight: true,
    intro:
      "Perfume and beauty packaging, metal and mini labels, brand plates, acrylic awards and crystal UV stickers -- finished with the same craftsmanship as the Aurielle Collection itself.",
    items: [
      "Perfume Bottle Printing",
      "Cosmetic Packaging",
      "Metal Labels",
      "Mini Labels",
      "Brand Plates",
      "Acrylic Awards",
      "Crystal / UV Luxury Stickers",
    ],
  },
  {
    slug: "personal-gifts",
    name: "Personal Gifts",
    spotlight: false,
    intro:
      "Custom printing for the people and moments in your life -- phone cases, home decor, wedding keepsakes, souvenirs and fashion accessories.",
    items: [
      "Phone & Electronics Cases",
      "Home Decoration",
      "Wedding & Event Keepsakes",
      "Souvenirs",
      "Fashion Accessories",
    ],
  },
  {
    slug: "business-solutions",
    name: "Business Solutions",
    spotlight: false,
    intro:
      "Branded materials for restaurants, offices and storefronts -- corporate gifts, hospitality items, access cards, signage and name plates.",
    items: [
      "Corporate Gifts",
      "Restaurant & Hospitality Items",
      "PVC / Loyalty / Access Cards",
      "Acrylic Signage",
      "QR Displays",
      "Name Plates",
    ],
  },
  {
    slug: "industrial-printing",
    name: "Industrial Printing",
    spotlight: false,
    intro:
      "Small-batch and prototype production for manufacturers and private-label brands -- metal printing, small plastics, labels and tags.",
    items: [
      "Metal Printing",
      "Small Plastics",
      "Custom Manufacturing (Prototype / Small-Batch / Private-Label)",
      "Labels & Tags",
    ],
  },
];
