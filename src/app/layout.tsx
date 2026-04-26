import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { JetBrains_Mono, Manrope } from "next/font/google";

import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Qorithm",
    default: "Qorithm - Master algorithms systematically",
  },
  description: "A clean SaaS foundation for organizing competitive programming practice.",
  openGraph: {
    title: "Qorithm",
    description: "A clean SaaS foundation for organizing competitive programming practice.",
    siteName: "Qorithm",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qorithm",
    description: "A clean SaaS foundation for organizing competitive programming practice.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${manrope.variable} ${jetbrainsMono.variable} antialiased`}>
          <div className="min-h-screen">
            <SiteHeader />
            <main>{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
