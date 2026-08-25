import type { Metadata } from "next";
import Script from "next/script";
import { Playfair_Display, Inter, Parisienne } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CUSTOMISATION_STUDIO_ENABLED } from "@/config/studio";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const parisienne = Parisienne({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

const description = CUSTOMISATION_STUDIO_ENABLED
  ? "Aurielle Paris Atelier: refined perfumes, a professional fragrance supply catalogue, and made-to-order custom UV printing, crafted with French-inspired luxury."
  : "Aurielle Paris Atelier: refined perfumes and a professional fragrance supply catalogue, crafted with French-inspired luxury.";

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL once the production domain is final so
  // og:image/twitter:image resolve to absolute URLs; falls back to
  // localhost for local dev.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Aurielle Paris Atelier",
  description,
  openGraph: {
    title: "Aurielle Paris Atelier",
    description,
    images: ["/images/og-share.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurielle Paris Atelier",
    description,
    images: ["/images/og-share.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${parisienne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-ivory text-ink">
        {/* Marks .reveal sections as JS-driven before first paint so they
            only start hidden when a script can actually reveal them; with
            JS disabled the class never lands and content stays visible. */}
        <Script id="js-flag" strategy="beforeInteractive">
          {`document.documentElement.classList.add("js");`}
        </Script>
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
