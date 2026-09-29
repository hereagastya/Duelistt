import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";

import { ThemeScript } from "@/components/ui/ThemeScript";

import "./globals.css";

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

/*
  One word at a time, and only on the landing page. The serif is the sans's own
  sibling, so the pairing reads as emphasis inside one voice rather than as two
  typefaces arguing. Italic only -- that is the whole point of having it.
*/
const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic"],
  variable: "--font-plex-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.duelistt.com"),
  title: { default: "Duelistt", template: "%s · Duelistt" },
  description: "Log who you contacted. Find out who needs a follow-up today.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // data-theme is written by ThemeScript before paint; suppressHydrationWarning
    // keeps React from complaining that the server could not have known it.
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${plex.variable} ${plexSerif.variable}`}
    >
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
