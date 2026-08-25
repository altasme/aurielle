"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";

// Wraps next/link so the click can fire "Studio Category Clicked"
// before the (unprevented) navigation carries the visitor to the
// prefilled quote form -- needs to be a Client Component since the
// Studio page itself is a Server Component and onClick handlers can't
// cross that boundary as inline props.
export function StudioChipLink({
  href,
  grouping,
  item,
  className,
  children,
}: {
  href: string;
  grouping: string;
  item?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() => track("Studio Category Clicked", { grouping, item: item ?? "" })}
      className={className}
    >
      {children}
    </Link>
  );
}
