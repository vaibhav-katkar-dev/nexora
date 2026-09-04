import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0F172A",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "OkInSite — Claim Your Place on the Internet | Free Digital Presence Platform",
    template: "%s — OkInSite",
  },
  description:
    "OkInSite is the fastest way to build a credible, professional digital presence. Claim your free custom web address (yourname.okinsite.com) and publish your business, portfolio, restaurant menu, or creator hub in 3 minutes.",
  keywords: [
    "OkInSite",
    "digital presence platform",
    "free custom subdomain",
    "website builder",
    "free website builder",
    "portfolio website",
    "restaurant menu website",
    "link in bio alternative",
    "digital business card",
    "startup landing page",
  ],
  authors: [{ name: "OkInSite" }],
  creator: "OkInSite Studio",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://okinsite.com"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "OkInSite — Claim Your Place on the Internet",
    description:
      "Claim your free custom web address (yourname.okinsite.com) and launch a professional, mobile-ready digital presence in under 3 minutes.",
    type: "website",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://okinsite.com",
    siteName: "OkInSite",
  },
  twitter: {
    card: "summary_large_image",
    title: "OkInSite — Your Digital Presence Live in Minutes",
    description: "Claim your free address, customize visually, and publish worldwide. Free hosting & automatic SSL.",
    creator: "@OkInSite",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
  verification: {
    google: "EK7JThCeYWy6hC1WVI3CwJLjRLC0qGGgvuvDs2EUvo4",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="EK7JThCeYWy6hC1WVI3CwJLjRLC0qGGgvuvDs2EUvo4" />
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
