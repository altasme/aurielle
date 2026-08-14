import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-taupe/20 bg-beige">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-3 lg:px-10">
        <div>
          <p className="font-serif text-lg tracking-[0.15em] text-burgundy">
            AURIELLE
          </p>
          <p className="mt-3 max-w-xs text-sm text-ink/70">
            A fragrance house creating refined perfumes and supplying quality
            fragrance materials to creators and businesses worldwide.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-ink/60">
            Explore
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            <li>
              <Link href="/collection">Aurielle Collection</Link>
            </li>
            <li>
              <Link href="/atelier-supply">Atelier Supply</Link>
            </li>
            <li>
              <Link href="/business">For Your Business</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-ink/60">
            Company
          </p>
          <ul className="mt-3 space-y-2 text-sm text-ink/80">
            <li>
              <Link href="/about">About</Link>
            </li>
            <li>
              <Link href="/contact">Contact</Link>
            </li>
            <li>
              <Link href="/order-lookup">Order Lookup</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-taupe/20 px-6 py-5 text-center text-xs text-ink/50">
        <p>
          &copy; {new Date().getFullYear()} Aurielle Paris Atelier. All rights
          reserved.
        </p>
        <p className="mt-1">
          Website &amp; Hosting by{" "}
          <a
            href="https://altasme.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-burgundy"
          >
            ALTAVENTURES
          </a>{" "}
          |{" "}
          <a
            href="https://altasme.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-burgundy"
          >
            Get your flagship website FREE
          </a>
        </p>
      </div>
    </footer>
  );
}
