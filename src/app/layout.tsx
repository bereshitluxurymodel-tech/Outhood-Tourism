import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { themeInitScript } from "@/lib/themeInitScript";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600"],
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Outhood — Discover Kenya, book the experience",
  description:
    "Outhood is a marketplace for verified Kenyan stays, safaris and experiences — compare, book, and travel with confidence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        {/* Blocking script, runs before paint — sets the dark class early
            enough that there's no flash of the wrong theme on load. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-sand text-ink font-body antialiased transition-colors dark:bg-night dark:text-nightInk">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
