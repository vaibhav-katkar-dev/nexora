import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import {
  Globe,
  Zap,
  Shield,
  Smartphone,
  MessageCircle,
  BarChart3,
  Search,
  Sparkles,
  ArrowRight,
  Layers,
  Palette,
  QrCode,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "OkInSite Features — Complete Digital Presence Engine",
  description:
    "Explore the powerful capabilities of OkInSite: free custom subdomains, visual section canvas, instant WhatsApp/Email inquiry forms, built-in analytics, and global CDN hosting.",
  alternates: { canonical: "/features" },
};

const FEATURE_LIST = [
  {
    icon: Globe,
    title: "Free Custom Subdomain",
    badge: "Identity",
    desc: "Reserve your distinct address like yourname.okinsite.com. No DNS settings or technical hurdles needed.",
    details: ["Instant reservation check", "Edge CDN routing", "Auto SSL certificate (HTTPS)", "Shareable anywhere"],
  },
  {
    icon: Layers,
    title: "Interactive Visual Canvas",
    badge: "Creation",
    desc: "Click directly on text, photos, and links to update them in real time with instant live previews.",
    details: ["Inline text editing", "Re-orderable sections", "Color themes & typography", "Auto-saving draft state"],
  },
  {
    icon: MessageCircle,
    title: "Direct WhatsApp & Email Lead Capture",
    badge: "Conversion",
    desc: "Turn visitors into paying clients with pre-configured inquiry forms that alert you immediately.",
    details: ["Direct WhatsApp chat launch", "Instant email notifications", "Spam protection built-in", "Lead management dashboard"],
  },
  {
    icon: BarChart3,
    title: "Zero-Overhead Site Analytics",
    badge: "Insights",
    desc: "Understand your audience with clean, privacy-respecting metrics that require zero third-party cookie banners.",
    details: ["Real-time pageview tracking", "Device & browser breakdown", "Visitor dwell time", "Referral channel insights"],
  },
  {
    icon: Smartphone,
    title: "Mobile-First Fluid Responsiveness",
    badge: "Experience",
    desc: "Every layout is engineered to look flawless on smartphones, tablets, and wide desktop screens.",
    details: ["Responsive flex/grid systems", "Touch-friendly UI elements", "Fast mobile payload (<150ms)", "Safe-area notch support"],
  },
  {
    icon: Search,
    title: "Automated Search Engine Indexing",
    badge: "Discoverability",
    desc: "Built-in technical SEO foundations help your site get indexed by Google, Bing, and AI search engines quickly.",
    details: ["Automated XML sitemap inclusion", "Schema.org structured data", "OpenGraph social preview cards", "Search engine ping triggers"],
  },
  {
    icon: QrCode,
    title: "Dynamic QR Code Generator",
    badge: "Hospitality & Print",
    desc: "Generate high-resolution QR codes for table menus, business cards, flyers, and event badges in one click.",
    details: ["Downloadable vector PNG", "Direct phone camera scan", "Instant menu viewing", "No app download needed"],
  },
  {
    icon: Palette,
    title: "Curated Archetype Templates",
    badge: "Designs",
    desc: "Choose from purpose-built starter templates crafted specifically for businesses, creators, restaurants, and portfolios.",
    details: ["10+ modern aesthetics", "Tailored section presets", "Dark and light mode palettes", "Custom CSS motion systems"],
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
              <Sparkles size={14} />
              <span>Engineered for Authenticity & Conversion</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 leading-tight">
              Everything you need for a <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                credible digital presence.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              OkInSite unites custom domain identity, visual editing, lead capture, and global speed in one cohesive platform.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURE_LIST.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-3xl border border-slate-200/90 p-7 space-y-6 shadow-xs hover:shadow-xl hover:shadow-slate-900/5 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Icon size={22} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                        {feat.badge}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-slate-950">{feat.title}</h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    {feat.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-20 bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Test drive the OkInSite editor today.
            </h2>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              No credit card, no downloads, no configuration. Claim your address and see how easy it is.
            </p>
            <div className="flex justify-center">
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-500 transition-all"
              >
                <span>Claim Your Free Site</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
