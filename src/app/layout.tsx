import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://anvreeality.com';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Anv Reealty | Luxury Real Estate & Verified Properties in Pune",
    template: "%s | ANV REEALTY"
  },
  description: "Anv Reealty - Pune's premier luxury real estate advisory and verified buyer-seller marketplace for residential apartments, penthouses, and commercial spaces.",
  alternates: {
    canonical: './',
  },
  icons: {
    icon: "/LogoAnv-original.png",
    shortcut: "/LogoAnv-original.png",
    apple: "/LogoAnv-original.png",
  },
  openGraph: {
    title: "Anv Reealty | Luxury Real Estate & Verified Properties in Pune",
    description: "Pune's premier luxury real estate advisory and verified buyer-seller marketplace.",
    url: baseUrl,
    siteName: "ANV REEALTY",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/gtag";
import { PropertyComparisonProvider } from "@/context/PropertyComparisonContext";
import { SavedPropertiesProvider } from "@/context/SavedPropertiesContext";
import { FloatingCompareBar } from "@/components/public/FloatingCompareBar";
import { StickyAdsStrip } from "@/components/public/StickyAdsStrip";
import { TimedEnquiryModal } from "@/components/public/TimedEnquiryModal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased w-full`}
    >
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col w-full max-w-full">
        <SavedPropertiesProvider>
          <PropertyComparisonProvider>
            {children}
            <FloatingCompareBar />
            <StickyAdsStrip />
            <TimedEnquiryModal />
          </PropertyComparisonProvider>
        </SavedPropertiesProvider>
      </body>
    </html>
  );
}
