import { ThemeProvider } from "@/components/theme-provider";

import type { Metadata } from "next";
import { Inter } from "next/font/google"
import "./globals.css";
import { ThemeToggle } from "@/components/theme-toggle";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SubTracker - Track your subscriptions",
  description: "A stateful, offline-first, and privacy-focused subscription tracker",
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
