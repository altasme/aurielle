// The Studio's finishes strip: what the printer can do, shown as
// representative material samples (not client work).
export type StudioFinish = {
  name: string;
  description: string;
  image?: string;
};

export const STUDIO_FINISHES: StudioFinish[] = [
  {
    name: "Direct 3D Embossed Bottle Print",
    description: "Raised, tactile 3D printing straight onto the bottle surface.",
    image: "/images/studio/finishes/direct-3d-embossed-bottle-print.jpg",
  },
  {
    name: "Direct Mirror Bottle Print",
    description: "Vivid full-colour printing onto a mirrored bottle finish.",
    image: "/images/studio/finishes/direct-mirror-bottle-print.jpg",
  },
  {
    name: "UV DTF Crystal Label",
    description: "Crystal-clear UV DTF labels with dimensional sparkle.",
    image: "/images/studio/finishes/uv-dtf-crystal-label.jpg",
  },
  {
    name: "Colored Metal Label",
    description: "Full-colour printing on durable metal labels.",
    image: "/images/studio/finishes/colored-metal-label.jpg",
  },
  {
    name: "Direct Bottle Print",
    description: "Full-colour printing applied directly onto the bottle.",
    image: "/images/studio/finishes/direct-bottle-print.jpg",
  },
  {
    name: "3D Printed Metal Labels",
    description: "Raised, dimensional 3D printing on metal labels.",
    image: "/images/studio/finishes/3d-printed-metal-labels.jpg",
  },
];
