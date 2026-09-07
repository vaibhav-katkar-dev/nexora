import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import {
  Sparkles,
  ArrowRight,
  Check,
  Smartphone,
  Zap,
  Globe,
  QrCode,
  Layers,
  Palette,
  Eye,
  Share2,
  Instagram,
  Youtube,
  Twitter,
  Music,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Link in Bio Builder — Beautiful, Fast & 100% Free Forever | OkInSite",
  description:
    "Build a stunning, mobile-first link in bio for Instagram, TikTok, YouTube, and X. Claim your free custom web address (yourname.okinsite.com) with zero ads, high-speed edge CDN, and QR codes.",
  alternates: { canonical: "/link-in-bio" },
  openGraph: {
    title: "Free Link in Bio Builder — 100% Free Forever | OkInSite",
    description:
      "Claim your free custom web address (yourname.okinsite.com). Beautiful layouts, glowing dark themes, zero ads, and instant WhatsApp links.",
    url: "https://okinsite.com/link-in-bio",
  },
};

export default function LinkInBioLandingPage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "OkInSite Link in Bio",
              applicationCategory: "SocialNetworkingApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                ratingCount: "1280",
              },
            }),
          }}
        />

        {/* Hero */}
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/60 to-[#FAFBFD] overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-purple-600" />
              <span>Next-Gen Link in Bio · Zero Ads · Free Forever</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              One sleek link for all your{" "}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                content, socials & drops.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Stop settling for boring, limited link trees with forced branding. Get a glowing, luxury mobile bio page on your own custom web address: <strong className="text-slate-900 font-mono">yourname.okinsite.com</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Claim Your Free Bio Address</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/templates?category=link_in_bio"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Browse Bio Templates</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs sm:text-sm font-semibold text-slate-600">
              <span className="flex items-center gap-1.5"><Check className="text-emerald-500 stroke-[3] w-4 h-4" /> 100% Free Forever</span>
              <span className="flex items-center gap-1.5"><Check className="text-emerald-500 stroke-[3] w-4 h-4" /> Instant WhatsApp & Email</span>
              <span className="flex items-center gap-1.5"><Check className="text-emerald-500 stroke-[3] w-4 h-4" /> Vector Print QR Code</span>
              <span className="flex items-center gap-1.5"><Check className="text-emerald-500 stroke-[3] w-4 h-4" /> Zero Ads or Watermarks</span>
            </div>
          </div>
        </section>

        {/* Features Breakdown */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
              Why Creators & Influencers Choose OkInSite
            </h2>
            <p className="text-sm text-slate-600">
              Everything you need to turn casual Instagram, TikTok, and YouTube followers into loyal fans, clients, and buyers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg shadow-slate-900/[0.03] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Smartphone size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Mobile-First Aesthetics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose between luxury dark mode with glowing ambient backdrops, crisp editorial light layouts, or frosted glassmorphism cards designed to stun on smartphones.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg shadow-slate-900/[0.03] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-700 flex items-center justify-center font-bold">
                <Globe size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Your Own Dedicated Subdomain</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Rather than an ugly generic redirect link like linktr.ee/random123, you get your own clean address: <span className="font-mono text-xs text-purple-700 font-bold">yourname.okinsite.com</span>.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-lg shadow-slate-900/[0.03] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Instant WhatsApp & Inquiry</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Allow brands, sponsors, and fans to start a WhatsApp conversation or submit a booking inquiry with 1 click directly from your link-in-bio hub.
              </p>
            </div>
          </div>

          {/* Comparison Table snippet */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-950 text-center">
              OkInSite vs. Generic Link-in-Bio Tools
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-6 space-y-3">
                <div className="font-bold text-emerald-800 text-base">✨ OkInSite Link in Bio ($0 Forever)</div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  <li className="flex items-center gap-2"><Check className="text-emerald-600 stroke-[3] w-4 h-4 shrink-0" /> Free custom address: yourname.okinsite.com</li>
                  <li className="flex items-center gap-2"><Check className="text-emerald-600 stroke-[3] w-4 h-4 shrink-0" /> Zero forced ads or company watermarks</li>
                  <li className="flex items-center gap-2"><Check className="text-emerald-600 stroke-[3] w-4 h-4 shrink-0" /> Unlimited links, stats counters & mini gallery</li>
                  <li className="flex items-center gap-2"><Check className="text-emerald-600 stroke-[3] w-4 h-4 shrink-0" /> Downloadable print vector QR code</li>
                </ul>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3">
                <div className="font-bold text-slate-700 text-base">⚠️ Typical Bio Link Builders ($60 - $264/yr)</div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                  <li className="flex items-center gap-2">❌ Generic subfolder URL (service.com/u/123)</li>
                  <li className="flex items-center gap-2">❌ Ugly platform logo watermark on free tier</li>
                  <li className="flex items-center gap-2">❌ Paywall on custom themes & fonts</li>
                  <li className="flex items-center gap-2">❌ Monthly subscription fees for basic analytics</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Can I put my OkInSite link on Instagram and TikTok?</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Yes! Both Instagram and TikTok fully support your custom address (e.g. https://yourname.okinsite.com). Because it uses automated HTTPS encryption, social networks verify and render your link instantly without security warnings.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                <h3 className="font-bold text-slate-900 text-base">Can I customize colors, fonts, and photos?</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Yes. Using the visual click-to-edit canvas, you can change your avatar, background effects, Google typography, link button shapes, and badge texts in real time.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all"
              >
                <span>Claim Your Free Bio Address</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
