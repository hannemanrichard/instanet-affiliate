import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/shared/components/ThemeProvider";
import { ConditionalClerkProvider } from "@/shared/components/providers/ConditionalClerkProvider";
import { ReactQueryProvider } from "@/shared/lib/providers/react-query";
import { I18nProvider } from "@/shared/lib/providers/i18n-provider";
import { Toaster } from "@/shared/components/ui/toaster";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { PixelScripts } from "@/shared/components/PixelScripts";
import { Cairo, JetBrains_Mono, Montserrat, Source_Serif_4 } from "next/font/google";

/** UI face — Montserrat for English / French (display, body, labels) */
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

/** Optional serif — DESIGN.md Source Serif 4 (editorial only) */
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source-serif",
  display: "swap",
});

/** Mono — DESIGN.md JetBrains Mono */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/** Arabic UI face — used for all text when lang=ar */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Instanet",
    default: "Instanet",
  },
  description: "Instanet affiliate platform",
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/logo.svg",
  },
  other: {
    "facebook-domain-verification": "3oy9d69km6868q0wrj4g6900b9ptzt",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head />
      <body
        className={`${montserrat.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} ${cairo.variable} font-sans`}
      >
        <ConditionalClerkProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <I18nProvider>
              <ReactQueryProvider>
                <NextSSRPlugin
                  routerConfig={extractRouterConfig(ourFileRouter)}
                />
                <PixelScripts />
                {children}
              </ReactQueryProvider>
            </I18nProvider>
          </ThemeProvider>
        </ConditionalClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}
