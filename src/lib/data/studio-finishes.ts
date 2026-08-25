// The Studio's finishes strip: what the printer can do, shown as
// representative material samples (not client work).
export type StudioFinish = {
  name: string;
  description: string;
  image?: string;
};

export const STUDIO_FINISHES: StudioFinish[] = [
  {
    name: "Gold Foil",
    description: "Warm metallic gold accents and detailing.",
    image: "/images/studio/finishes/gold-foil.jpg",
  },
  {
    name: "Metallic",
    description: "Reflective silver, chrome and brushed-metal finishes.",
    image: "/images/studio/finishes/metallic.jpg",
  },
  {
    name: "Acrylic",
    description: "Clear or tinted acrylic with a polished edge.",
    image: "/images/studio/finishes/acrylic.jpg",
  },
  {
    name: "Crystal / 3D",
    description: "Raised, dimensional UV printing with depth.",
    image: "/images/studio/finishes/crystal-3d.jpg",
  },
  {
    name: "Full Colour",
    description: "Vivid, photo-quality full-colour prints.",
    image: "/images/studio/finishes/full-colour.jpg",
  },
];
