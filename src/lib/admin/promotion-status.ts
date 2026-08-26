// Display-only "is this currently live" check for the admin list
// pages -- the real, authoritative check (used at checkout) lives in
// src/lib/promotions/apply.ts's SQL filters. This just mirrors that
// logic client-visibly so admins can tell why something isn't applying
// without opening it.
export function promotionStatusLabel(params: {
  enabled: boolean;
  startsAt: string;
  endsAt: string;
  maxUses: number | null;
  usedCount: number;
}): "Active" | "Disabled" | "Scheduled" | "Expired" | "Used up" {
  if (!params.enabled) return "Disabled";
  const now = Date.now();
  if (now < new Date(params.startsAt).getTime()) return "Scheduled";
  if (now > new Date(params.endsAt).getTime()) return "Expired";
  if (params.maxUses !== null && params.usedCount >= params.maxUses) return "Used up";
  return "Active";
}

export function promotionStatusClasses(status: ReturnType<typeof promotionStatusLabel>): string {
  if (status === "Active") return "bg-burgundy/10 text-burgundy";
  if (status === "Scheduled") return "bg-beige text-ink/60";
  return "bg-taupe/20 text-ink/50";
}
