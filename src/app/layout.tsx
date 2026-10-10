import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Anv Reeality | Luxury Real Estate & Verified Properties in Pune",
  description: "Anv Reeality - Pune's premier luxury real estate advisory and verified buyer-seller marketplace.",
  icons: {
    icon: "/LogoAnv-original.png",
  },
};

import { PropertyComparisonProvider } from "@/context/PropertyComparisonContext";
import { SavedPropertiesProvider } from "@/context/SavedPropertiesContext";
import { FloatingCompareBar } from "@/components/public/FloatingCompareBar";
import { FloatingWhatsAppButton } from "@/components/public/FloatingWhatsAppButton";
import { FloatingChatbot } from "@/components/public/FloatingChatbot";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-hidden w-full`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden w-full max-w-full">
        <SavedPropertiesProvider>
          <PropertyComparisonProvider>
            {children}
            <FloatingCompareBar />
            <FloatingChatbot />
            <FloatingWhatsAppButton />
          </PropertyComparisonProvider>
        </SavedPropertiesProvider>
      </body>
    </html>
  );
}
