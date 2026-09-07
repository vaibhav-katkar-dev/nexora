import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import {
  Briefcase,
  Sparkles,
  ArrowRight,
  Check,
  Code,
  Palette,
  Eye,
  Award,
  Globe,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Portfolio Website Builder for Creatives & Freelancers | OkInSite",
  description:
    "Build a stunning visual portfolio for designers, developers, photographers, and creative directors in minutes. 100% free hosting, custom web address, and project showcase case studies.",
  alternates: { canonical: "/portfolio-builder" },
  openGraph: {
    title: "Free Portfolio Website Builder for Creatives | OkInSite",
    description:
      "Claim your personal web address (yourname.okinsite.com). Showcase your best client case studies with luxury typography and zero monthly fees.",
    url: "https://okinsite.com/portfolio-builder",
  },
};

export default function PortfolioLandingPage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white via-indigo-50/30 to-[#FAFBFD]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Briefcase size={14} className="text-indigo-600" />
              <span>Showcase Your Work · Win High-Paying Clients</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              The portfolio builder that makes your work{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                look extraordinary.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Ditch complicated CMS setups and slow shared hosting. Build a blazing-fast portfolio on your dedicated address: <strong className="text-slate-900 font-mono">yourname.okinsite.com</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Build Free Portfolio</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/templates?category=portfolio"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Browse Portfolio Themes</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Palette size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Curated Google Fonts</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Pair modern display headings (Space Grotesk, Syne, Outfit, Cinzel) with legible body typography for an editorial magazine finish.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Layers size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Masonry Case Studies</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Present project deliverables, metrics, client reviews, and direct live links with responsive grid layouts.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">High-Conversion Inquiries</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Prospective clients can book a discovery call or send a project brief straight to your inbox with built-in inquiry forms.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
