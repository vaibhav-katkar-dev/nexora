import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import { Check, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "OkInSite Pricing — Free Forever with Premium Reliability",
  description:
    "Transparent pricing for modern digital presences. Get your free custom address (yourname.okinsite.com), free hosting, and automatic SSL with no credit card required.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-semibold">
              <Sparkles size={14} />
              <span>Transparent & Accessible Pricing</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 leading-tight">
              A serious web presence, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                free forever.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              No hidden surprise hosting fees, no credit cards required to publish, and no forced ads on your site.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border-2 border-blue-600 p-8 sm:p-10 shadow-xl shadow-blue-600/10 flex flex-col justify-between space-y-8 relative">
              <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                Active Tier · Free Forever
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-slate-950">Free Digital Presence</h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Everything creators, freelancers, businesses, and restaurants need to be online.
                  </p>
                </div>

                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-5xl font-black font-mono text-slate-950">$0</span>
                  <span className="text-sm font-semibold text-slate-500">/ forever</span>
                </div>

                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 p-2.5 rounded-xl">
                  No credit card required. Claim your address in 10 seconds.
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  {[
                    "Custom Subdomain (yourname.okinsite.com)",
                    "Unlimited pageviews on global edge CDN",
                    "Full visual canvas editor access",
                    "All starter templates & archetype sections",
                    "Direct WhatsApp & Email inquiry capture",
                    "Free automated SSL encryption certificate",
                    "Dynamic search engine XML sitemap inclusion",
                    "Downloadable high-res print QR code",
                    "Zero third-party banner ads",
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
                      <Check size={16} className="text-emerald-500 shrink-0 stroke-[3]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/#pricing"
                  className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
                >
                  <span>Claim Your Free Site Now</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="bg-slate-50/70 rounded-3xl border border-slate-200 p-8 sm:p-10 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                    Roadmap · Coming Soon
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Custom Domain Pro</h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    For high-growth businesses and brands wanting a standalone custom apex domain.
                  </p>
                </div>

                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-4xl font-bold font-mono text-slate-400">TBA</span>
                  <span className="text-xs text-slate-400">/ optional upgrade</span>
                </div>

                <div className="pt-4 border-t border-slate-200/70 space-y-3">
                  {[
                    "Attach custom domain (e.g. yourbusiness.com)",
                    "Advanced conversion tracking & webhook exports",
                    "Multi-user team permissions",
                    "Custom branding removal (white-label)",
                    "Priority 24/7 technical support",
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-500">
                      <Check size={16} className="text-slate-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled
                  className="w-full h-12 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs flex items-center justify-center cursor-not-allowed"
                >
                  Coming in future releases
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-center">
            <h3 className="text-base font-bold text-slate-900">Why is the core tier free?</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our mission is to make claiming your personal or business web address as fundamental as registering an email address. By operating a highly optimized static compilation architecture, hosting costs are near zero, allowing us to keep the core OkInSite platform free forever.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
