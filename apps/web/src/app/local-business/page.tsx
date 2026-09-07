import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import {
  Store,
  Sparkles,
  ArrowRight,
  Check,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Website Builder for Local Retail Shops & Small Businesses | OkInSite",
  description:
    "Launch a credible, mobile-ready online presence for your local shop, grocery store, salon, clinic, or service business in 3 minutes. Zero hosting fees, Google Maps embed, and direct WhatsApp customer inquiries.",
  alternates: { canonical: "/local-business" },
  openGraph: {
    title: "Free Website Builder for Local Businesses | OkInSite",
    description:
      "Claim your shop's web address (yourstore.okinsite.com). Put your store hours, address, Google Maps, and WhatsApp order button online for free.",
    url: "https://okinsite.com/local-business",
  },
};

export default function LocalBusinessLandingPage() {
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
              name: "OkInSite Local Business Website Builder",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            }),
          }}
        />

        {/* Hero */}
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white via-emerald-50/30 to-[#FAFBFD]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Store size={14} className="text-emerald-600" />
              <span>Designed for Neighborhood Retail & Local Services</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              Get your local shop online with a{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                credible web presence.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Help nearby customers find your location on Google Maps, check opening hours, browse featured inventory, and send grocery or service orders via WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Claim Free Shop Website</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/templates?category=business"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>View Store Templates</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Local Business Perks */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <MapPin size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Interactive Google Map</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pin your storefront address so customers can tap to open Google Maps navigation directions directly on their mobile phones.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <MessageCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">WhatsApp Order List</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Customers can send their grocery list, ask about product stock, or book salon and clinic appointments via WhatsApp in seconds.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Clear Operating Hours</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Display daily opening and closing hours, weekly holidays, and emergency contact numbers clearly so shoppers never arrive at a closed door.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
