import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Nexora Studio — Your Ideas, Beautifully Live",
  description:
    "Create stunning portfolios, digital cards, landing pages and more in under 60 seconds. No design experience needed. Powered by AI.",
  keywords: ["portfolio builder", "AI website builder", "digital card", "landing page"],
  openGraph: {
    title: "Nexora Studio — Your Ideas, Beautifully Live",
    description:
      "Create stunning portfolios, digital cards, landing pages and more in under 60 seconds. Powered by AI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexora Studio",
    description: "AI-powered digital presence platform",
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
