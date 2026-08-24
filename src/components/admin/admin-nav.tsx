"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Order Management" },
  { href: "/admin/products", label: "Product & Pricing" },
];

export function AdminNav({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-taupe/20 bg-white">
      <div className="border-b border-taupe/20 px-6 py-5">
        <p className="font-serif text-lg tracking-[0.15em] text-burgundy">AURIELLE</p>
        <p className="text-xs text-ink/50">Admin Panel</p>
      </div>
      <nav className="flex-1 px-3 py-4">
        {NAV_LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-sm px-3 py-2 text-sm transition-colors ${
                active ? "bg-beige text-burgundy" : "text-ink/70 hover:bg-beige/60"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-taupe/20 px-6 py-4">
        <p className="truncate text-xs text-ink/50">Signed in as {username}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 text-xs uppercase tracking-wide text-burgundy underline"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}
