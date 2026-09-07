import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import {
  CreditCard,
  Sparkles,
  ArrowRight,
  Check,
  QrCode,
  Smartphone,
  Share2,
  Contact,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Digital Business Card & NFC Contact Profile Maker | OkInSite",
  description:
    "Create a modern virtual business card with vCard contact saving, NFC tag compatibility, and instant QR code sharing. 100% free web address (yourname.okinsite.com).",
  alternates: { canonical: "/digital-business-card" },
  openGraph: {
    title: "Free Digital Business Card & NFC Profile Maker | OkInSite",
    description:
      "Share your contact details with 1 tap. QR code, vCard save, WhatsApp chat, and zero paper waste on your free custom web address.",
    url: "https://okinsite.com/digital-business-card",
  },
};

export default function DigitalCardLandingPage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white via-cyan-50/30 to-[#FAFBFD]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold uppercase tracking-wider">
              <CreditCard size={14} className="text-cyan-700" />
              <span>Modern Networking · NFC Compatible · Free Forever</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              The last business card you will{" "}
              <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                ever need to share.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Swap paper cards for a tap-to-save digital profile. Let partners, investors, and clients save your phone, email, and social handles straight to their contacts.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Create Digital Business Card</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/templates?category=digital_card"
                className="w-full sm:w-auto px-6 py-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>View Card Designs</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                <QrCode size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Instant Scan & Save</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Anyone can point their camera at your QR code on lock screens, badges, or physical cards to open your full profile in 1 second.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <Contact size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">One-Tap vCard Download</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Visitors tap "Save Contact" to import your name, job title, company, phone, email, and website directly into Apple Contacts or Google Contacts.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Share2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-950">Native Phone Sharing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Integrates with the mobile Web Share sheet to text, Airdrop, or message your web card with 1 tap during conferences and meetings.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
