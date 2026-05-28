import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import InstallPrompt from "@/components/pwa/InstallPrompt";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Reltiva | Real Estate Property Listing Platform for Ghana",
  description: "Find affordable and accessible housing for everyday Ghanaians. Buy, rent, or sell apartments, houses, lands, and commercial spaces.",
  manifest: "/manifest.json",
  applicationName: "Reltiva",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Reltiva",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
          <InstallPrompt />
        </SessionProvider>
      </body>
    </html>
  );
}
