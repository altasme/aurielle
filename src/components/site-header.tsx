"use client";

import Link from "next/link";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/collection", label: "Collection" },
  { href: "/atelier-supply", label: "Atelier Supply" },
  { href: "/about", label: "About" },
  { href: "/business", label: "Business" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-taupe/20 bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <Link
          href="/"
          className="font-serif text-xl tracking-[0.15em] text-burgundy"
        >
          AURIELLE
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm uppercase tracking-wide text-ink/80 transition-colors hover:text-burgundy"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            aria-label="Cart"
            className="text-sm uppercase tracking-wide text-ink/80 transition-colors hover:text-burgundy"
          >
            Cart
          </Link>
        </nav>

        <button
          type="button"
          className="flex items-center gap-2 text-sm uppercase tracking-wide md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          className="flex flex-col gap-1 border-t border-taupe/20 bg-ivory px-6 pb-6 pt-2 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-3 text-sm uppercase tracking-wide text-ink/80"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className="py-3 text-sm uppercase tracking-wide text-ink/80"
            onClick={() => setMenuOpen(false)}
          >
            Cart
          </Link>
        </nav>
      )}
    </header>
  );
}
