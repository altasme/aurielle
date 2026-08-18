// Split out from src/lib/data/perfumes.ts (which is server-only, since
// it now reads from Supabase) so client components can still import
// this plain constant, e.g. the homepage's mood chips and the
// collection page's mood filter.
export const MOODS = ["Feminine", "Mysterious", "Elegant", "Warm", "Alluring"] as const;
export type Mood = (typeof MOODS)[number];
