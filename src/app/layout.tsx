import type { Metadata } from "next";
import { Playfair_Display, Inter, Parisienne } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

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

const description =
  "Aurielle Paris Atelier: refined perfumes and a professional fragrance supply catalogue, crafted with French-inspired luxury.";

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
    >
      <body className="min-h-full flex flex-col bg-ivory text-ink">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
