import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClassName } from "./button-styles";

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "inverse";
}) {
  return (
    <Link href={href} className={buttonClassName(variant)}>
      {children}
    </Link>
  );
}
