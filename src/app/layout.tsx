import type { Metadata } from "next";
import { Lato, Playfair_Display } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Artway Fine Art Services",
  description:
    "Artway Fine Art Services — fine art shipping, handling, packing, storage, and installation.",
  keywords: [
    "fine art shipping",
    "art handling",
    "art logistics",
    "art transportation",
    "fine art storage",
    "art packing",
    "white glove delivery",
    "art installation",
    "artway",
    "new york",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Artway Fine Art Services",
    description:
      "Fine art shipping, handling, packing, storage, and installation.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Artway Fine Art Services",
    description:
      "Fine art shipping, handling, packing, storage, and installation.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${playfair.variable}`}>
        <div className="site">
          <SiteHeader />
          <main className="main">
            <PageTransition>{children}</PageTransition>
          </main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
