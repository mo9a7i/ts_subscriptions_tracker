import { ThemeProvider } from "@/components/theme-provider";

import type { Metadata } from "next";
import { Inter } from "next/font/google"
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SubTracker - Smart Subscription Management & Cost Awareness",
  description: "Privacy-first subscription tracker with smart sorting, auto-detection, and cost awareness tools. Track, organize, and optimize all your recurring payments. No signup required - your data stays private.",
  keywords: ["subscription tracker", "recurring payments", "cost management", "privacy-first", "subscription management", "expense tracking", "financial awareness"],
  authors: [{ name: "SubTracker Team" }],
  creator: "SubTracker",
  publisher: "SubTracker",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://subtracker.mo9a7i.com/",
    siteName: "SubTracker",
    title: "SubTracker - Smart Subscription Management & Cost Awareness",
    description: "Privacy-first subscription tracker with smart sorting, auto-detection, and cost awareness tools. Track and optimize all your recurring payments.",
    images: [
      {
        url: "/screenshots/dark_image.png",
        width: 1200,
        height: 630,
        alt: "SubTracker - Subscription Management Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SubTracker - Smart Subscription Management & Cost Awareness",
    description: "Privacy-first subscription tracker with smart sorting, auto-detection, and cost awareness tools.",
    images: ["/screenshots/dark_image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification
  },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} antialiased`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
