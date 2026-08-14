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
  variant?: "primary" | "secondary";
}) {
  return (
    <Link href={href} className={buttonClassName(variant)}>
      {children}
    </Link>
  );
}
