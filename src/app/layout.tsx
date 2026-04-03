import type { Metadata } from "next";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Lato, Playfair_Display, Allerta_Stencil } from "next/font/google";
import "./globals.css";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import PageTransition from "@/components/PageTransition";

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
});

const allertaStencil = Allerta_Stencil({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-allerta-stencil",
});

export const metadata: Metadata = {
  title: "Artway Fine Art Services",
  description:
    "Artway Fine Art Services — fine art shipping, handling, packing, storage, and installation.",
  keywords: [
    "fine art shipping",
    "fine art logistics",
    "fine art transportation",
    "fine art handling",
    "fine art storage",
    "art packing",
    "art crating",
    "white glove delivery",
    "art installation",
    "museum art transport",
    "gallery art transport",
    "art courier service",
    "international art shipping",
    "local art shipping",
    "art moving services",
    "art transportation New York",
    "fine art shipping New York",
    "art logistics NYC",
    "artway",
    "new york",
  ],
  icons: {
    icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/favicon.ico`,
  },
  openGraph: {
    title: "Artway Fine Art Services",
    description:
      "Fine art shipping, handling, packing, storage, and installation.",
    type: "website",
    url: "https://artwayinc.com",
  },
  twitter: {
    card: "summary",
    title: "Artway Fine Art Services",
    description:
      "Fine art shipping, handling, packing, storage, and installation.",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://artwayinc.com"
  ),
};

// Структурированные данные Schema.org для SEO
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Artway Fine Art Services",
  description:
    "Fine art shipping, handling, packing, storage, and installation services",
  url: "https://artwayinc.com",
  telephone: ["+1-855-527-8929", "+1-718-213-6886"],
  email: "info@artwayinc.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "New York",
    addressRegion: "NY",
    addressCountry: "US",
  },
  areaServed: [
    {
      "@type": "Country",
      name: "United States",
    },
    {
      "@type": "City",
      name: "New York City",
    },
    {
      "@type": "AdministrativeArea",
      name: "New York",
    },
    {
      "@type": "AdministrativeArea",
      name: "New Jersey",
    },
    {
      "@type": "AdministrativeArea",
      name: "Connecticut",
    },
    {
      "@type": "AdministrativeArea",
      name: "Pennsylvania",
    },
    {
      "@type": "AdministrativeArea",
      name: "Florida",
    },
    {
      "@type": "AdministrativeArea",
      name: "Georgia",
    },
    {
      "@type": "AdministrativeArea",
      name: "North Carolina",
    },
    {
      "@type": "AdministrativeArea",
      name: "South Carolina",
    },
    {
      "@type": "City",
      name: "Chicago",
    },
    {
      "@type": "Place",
      name: "The Hamptons",
    },
    {
      "@type": "Place",
      name: "Long Island",
    },
    {
      "@type": "Place",
      name: "East Coast",
    },
  ],
  serviceType: [
    "Fine Art Shipping",
    "Art Handling",
    "Art Packing & Crating",
    "Art Storage",
    "White Glove Delivery",
    "Art Installation",
    "Auction House Services",
    "Art Restoration",
  ],
  foundingDate: "1995",
  sameAs: ["https://www.facebook.com/share/1FFrmNWTN8/?mibextid=wwXIfr"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lato.variable} ${playfair.variable} ${allertaStencil.variable}`}
      >
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <div className="site">
          <SiteHeader />
          <main className="main">
            <PageTransition>{children}</PageTransition>
          </main>
          <SiteFooter />
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
