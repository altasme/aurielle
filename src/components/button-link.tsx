import Link from "next/link";
import type { ReactNode } from "react";

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex items-center justify-center border px-8 py-3 text-xs uppercase tracking-[0.2em] transition-colors rounded-sm";
  const styles =
    variant === "primary"
      ? "border-burgundy bg-burgundy text-ivory hover:bg-burgundy-dark"
      : "border-burgundy text-burgundy hover:bg-burgundy hover:text-ivory";

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
