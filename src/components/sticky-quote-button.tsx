"use client";

import { useEffect, useState } from "react";

// Appears once the visitor has scrolled past the hero, so it doesn't
// duplicate the hero's own "Request a Quote" button immediately.
// Mobile-first per spec ("priority on mobile"): bottom-center fixed
// bar on small screens, bottom-right pill on larger ones.
export function StickyQuoteButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <a
      href="#quote"
      className="fixed inset-x-4 bottom-4 z-40 border border-burgundy bg-burgundy px-6 py-3 text-center text-xs uppercase tracking-[0.2em] text-ivory shadow-lg transition-colors hover:bg-burgundy-dark sm:inset-x-auto sm:right-6 sm:bottom-6 sm:rounded-none"
    >
      Request a Quote
    </a>
  );
}
