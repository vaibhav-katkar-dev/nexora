import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import {
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  Check,
  QrCode,
  Smartphone,
  MessageCircle,
  MapPin,
  Clock,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Restaurant QR Code Menu Builder — Instant WhatsApp Ordering | OkInSite",
  description:
    "Launch an interactive digital QR code menu for your restaurant, cafe, bar, or cloud kitchen in under 3 minutes. Free custom address (yourcafe.okinsite.com), dietary badges, and direct WhatsApp ordering.",
  alternates: { canonical: "/restaurant-menu" },
  openGraph: {
    title: "Free Restaurant QR Code Menu Builder — 100% Free | OkInSite",
    description:
      "Create a contactless digital menu with QR code table stands, WhatsApp ordering, veg/non-veg dietary tags, and zero monthly fees.",
    url: "https://okinsite.com/restaurant-menu",
  },
};

export default function RestaurantMenuLandingPage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        {/* Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "OkInSite Restaurant QR Menu Builder",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />

        {/* Hero */}
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white via-amber-50/30 to-[#FAFBFD]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <UtensilsCrossed size={14} className="text-amber-700" />
              <span>Free QR Code Menu & WhatsApp Ordering Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              A contactless digital menu that{" "}
              <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                guests love scanning.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Never reprint paper menus again when prices change. Launch an interactive digital menu with dietary tags, chef's specials, and direct WhatsApp table orders on <strong className="text-slate-900 font-mono">yourcafe.okinsite.com</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Create Free Restaurant Menu</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/templates?category=restaurant"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Preview Dining Templates</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs sm:text-sm font-semibold text-slate-600">
              <span className="flex items-center gap-1.5"><Check className="text-emerald-500 stroke-[3] w-4 h-4" /> Downloadable Print QR Code</span>
              <span className="flex items-center gap-1.5"><Check className="text-emerald-500 stroke-[3] w-4 h-4" /> Direct WhatsApp Table Ordering</span>
              <span className="flex items-center gap-1.5"><Check className="text-emerald-500 stroke-[3] w-4 h-4" /> Google Maps Location Embed</span>
              <span className="flex items-center gap-1.5"><Check className="text-emerald-500 stroke-[3] w-4 h-4" /> Zero App Downloads Needed</span>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
              Built Specifically for Restaurants, Cafes & Bars
            </h2>
            <p className="text-sm text-slate-600">
              Increase table turnaround, eliminate menu printing bills, and let diners explore mouth-watering photos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg shadow-slate-900/[0.03] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">High-Res Print QR Codes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Download a crisp PNG vector QR code linked directly to your menu. Place it on table stands, windows, takeaway boxes, and business cards.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg shadow-slate-900/[0.03] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">WhatsApp Order Flow</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Guests tap "Order on WhatsApp" to send their chosen dish names and table number directly to your staff's WhatsApp phone.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg shadow-slate-900/[0.03] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Update Prices in 10 Seconds</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Ran out of fresh seafood? Need to tweak a daily special? Edit the menu on your phone or laptop and changes go live instantly.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-slate-950 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <h2 className="text-3xl font-black">Ready to upgrade your dining experience?</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Claim your free address like yourrestaurant.okinsite.com and create your menu today.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-xl transition-all"
            >
              <span>Launch Free Restaurant Menu</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
