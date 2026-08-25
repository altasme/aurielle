// The Studio's finishes strip: what the printer can do, shown as
// representative material samples (not client work). No macro shots
// exist yet, so each tile renders as a labeled placeholder until real
// photos come in (see docs/spec/AURIELLE_STUDIO_PAGE_SPEC.md §13).
export type StudioFinish = {
  name: string;
  description: string;
};

export const STUDIO_FINISHES: StudioFinish[] = [
  { name: "Gold Foil", description: "Warm metallic gold accents and detailing." },
  { name: "Metallic", description: "Reflective silver, chrome and brushed-metal finishes." },
  { name: "Acrylic", description: "Clear or tinted acrylic with a polished edge." },
  { name: "Crystal / 3D", description: "Raised, dimensional UV printing with depth." },
  { name: "Full Colour", description: "Vivid, photo-quality full-colour prints." },
];
