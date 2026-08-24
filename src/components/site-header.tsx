"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart/cart-context";

const NAV_LINKS = [
  { href: "/collection", label: "Collection" },
  { href: "/atelier-supply", label: "Atelier" },
  { href: "/about", label: "About" },
  { href: "/business", label: "Business" },
  { href: "/contact", label: "Contact" },
];

function useCartCount() {
  const { state } = useCart();
  const collectionCount = state.collection.reduce((n, i) => n + i.quantity, 0);
  const supplyCount = state.supply.reduce((n, i) => n + i.quantity, 0);
  return collectionCount + supplyCount;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartCount();
  const cartLabel = cartCount > 0 ? `Cart (${cartCount})` : "Cart";

  const [cartPulse, setCartPulse] = useState(false);
  const prevCartCount = useRef(cartCount);
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setCartPulse(true);
      const timeout = setTimeout(() => setCartPulse(false), 500);
      prevCartCount.current = cartCount;
      return () => clearTimeout(timeout);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  // Subtle scroll-triggered compacting (spec: "slightly more compact,
  // solid background, no aggressive animation"), not a layout jump.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Admin gets its own shell (src/app/admin/(protected)/layout.tsx),
  // not the public marketing header, per the admin spec's "does not
  // need to replicate the luxury consumer website."
  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`sticky top-0 z-50 border-b border-taupe/20 backdrop-blur transition-colors ${scrolled ? "bg-ivory" : "bg-ivory/95"}`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-10 ${scrolled ? "py-3" : "py-4"}`}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl tracking-[0.15em] text-burgundy"
        >
          <Image
            src="/images/logo.png"
            alt=""
            width={36}
            height={36}
            priority
            className="h-9 w-9"
          />
          AURIELLE
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="nav-underline text-sm uppercase tracking-wide text-ink/80 transition-colors hover:text-burgundy"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/cart"
            aria-label="Cart"
            className={`nav-underline text-sm uppercase tracking-wide text-ink/80 transition-colors hover:text-burgundy ${cartPulse ? "cart-pulse" : ""}`}
          >
            {cartLabel}
          </Link>
          <Link
            href="/affiliate"
            className="border border-burgundy bg-burgundy px-4 py-2 text-xs uppercase tracking-wide text-ivory transition-colors hover:bg-burgundy-dark"
          >
            Be an Affiliate
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

      <div className="md:hidden">
        <div
          className={`mobile-menu-wrap ${menuOpen ? "is-open" : ""}`}
          inert={!menuOpen}
        >
          <nav id="mobile-menu" className="overflow-hidden">
            <div className="flex flex-col gap-1 border-t border-taupe/20 bg-ivory px-6 pb-6 pt-2">
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
                {cartLabel}
              </Link>
              <Link
                href="/affiliate"
                className="mt-2 border border-burgundy bg-burgundy px-4 py-3 text-center text-sm uppercase tracking-wide text-ivory"
                onClick={() => setMenuOpen(false)}
              >
                Be an Affiliate
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
