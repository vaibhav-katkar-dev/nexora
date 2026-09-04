import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import {
  Sparkles,
  ArrowRight,
  Globe,
  Sliders,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How OkInSite Works — From Idea to Live in 3 Simple Steps",
  description:
    "Discover how easy it is to launch your online presence with OkInSite. Claim your custom subdomain, customize with our visual editor, and publish live in under 3 minutes.",
  alternates: { canonical: "/how-it-works" },
};

const STEPS = [
  {
    number: "01",
    phase: "CLAIM",
    title: "Choose your unique web address",
    subtitle: "Reserve your custom subdomain before anyone else claims it.",
    desc: "Type your business name, personal name, or creative moniker into the subdomain field. Our system immediately verifies availability and locks in your address under https://yourname.okinsite.com.",
    features: [
      "Instant real-time availability check",
      "Free permanent subdomain reservation",
      "Automatic SSL HTTPS encryption enabled",
      "No DNS setup, nameservers, or registration fees",
    ],
    accent: "text-blue-600",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    number: "02",
    phase: "CUSTOMIZE",
    title: "Personalize your visual presence",
    subtitle: "Click directly on the canvas to update words, imagery, and links.",
    desc: "Start with a curated template or tailor each section to fit your brand. Use our Quick Business Setup wizard to inject your WhatsApp number, email, services, and location with one click.",
    features: [
      "Direct on-canvas visual text editing",
      "Pre-formatted sections (Services, Pricing, Menus, Portfolios)",
      "Instant phone, tablet, and desktop preview modes",
      "Automated WhatsApp & email inquiry wiring",
    ],
    accent: "text-indigo-600",
    pill: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    number: "03",
    phase: "PUBLISH",
    title: "Publish live across the globe",
    subtitle: "One click distributes your site on our high-speed global CDN.",
    desc: "When you hit 'Publish', OkInSite compiles clean static HTML/CSS, generates Schema.org search microdata, issues your sitemap entry, and pings search crawlers automatically.",
    features: [
      "Sub-second global CDN edge caching",
      "Included in dynamic XML search engine sitemaps",
      "Instant shareable link and downloadable QR code",
      "Live analytics tracking pageviews & inquiries",
    ],
    accent: "text-emerald-600",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
              <Sparkles size={14} />
              <span>Simplicity By Design</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 leading-tight">
              From idea to live <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                in 3 simple steps.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              No server configuration, no confusing control panels, and no coding required. OkInSite makes launching effortless.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-12 shadow-sm hover:shadow-xl hover:shadow-slate-900/5 transition-all space-y-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className={`text-4xl sm:text-5xl font-black font-mono ${step.accent}`}>
                    {step.number}
                  </div>
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${step.pill}`}>
                      {step.phase}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-950 mt-1">
                      {step.title}
                    </h2>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold">
                  <Clock size={14} className="text-blue-600" />
                  <span>~60 seconds</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-slate-900">{step.subtitle}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
                </div>

                <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-5 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    What happens here:
                  </div>
                  {step.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 rounded-3xl border border-blue-200/70 p-8 sm:p-10 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 text-center">
              What every OkInSite presence gets automatically:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                <ShieldCheck size={22} className="text-blue-600 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Automatic SSL (HTTPS)</div>
                  <div className="text-slate-500">Bank-grade security certificates</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                <Zap size={22} className="text-indigo-600 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Global Edge Delivery</div>
                  <div className="text-slate-500">Fast page loads worldwide</div>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-blue-100">
                <Globe size={22} className="text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Google Search Indexing</div>
                  <div className="text-slate-500">Automated sitemap submissions</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 space-y-4">
            <h3 className="text-2xl font-bold text-slate-950">
              Start building your presence in seconds.
            </h3>
            <p className="text-sm text-slate-600">
              Free forever. No credit card required.
            </p>
            <div className="flex justify-center pt-2">
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all"
              >
                <span>Claim Your Free Web Address</span>
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
