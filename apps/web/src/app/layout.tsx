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
  title: "Nexora — Build & Publish Your Website in Seconds. No Code.",
  description:
    "Nexora is the fastest way to launch a professional website. Choose a username, pick a template, and publish your portfolio, restaurant menu, startup landing page or digital card — free, no signup required to start.",
  keywords: [
    "website builder",
    "free website builder",
    "portfolio website",
    "no code website",
    "publish website free",
    "linktree alternative",
    "digital card builder",
    "restaurant menu website",
    "startup landing page",
    "resume website builder",
    "link in bio website",
  ],
  authors: [{ name: "Nexora" }],
  creator: "Nexora Studio",
  metadataBase: new URL("https://nexora.site"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Nexora — Build & Publish Your Website in Seconds",
    description:
      "The fastest way to launch a professional website. Username → Template → Live. Free, no signup required to start.",
    type: "website",
    url: "https://nexora.site",
    siteName: "Nexora Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexora — Your Website Live in Seconds",
    description: "Choose username, pick a template, publish. Free website builder with instant global hosting.",
    creator: "@nexorastudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
