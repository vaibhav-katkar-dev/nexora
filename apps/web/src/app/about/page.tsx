import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import { Globe, Shield, Zap, Sparkles, Heart, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About OkInSite — Our Mission & Philosophy",
  description:
    "Learn why OkInSite was created: to give every creator, freelancer, local business, and professional their own independent, credible place on the internet.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
              <Sparkles size={14} />
              <span>The Story Behind OkInSite</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 leading-tight">
              Everyone deserves their own <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                place on the internet.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              We started OkInSite with a simple conviction: you shouldn't have to choose between a generic, rented social media bio link and an expensive, complex website that takes weeks to build.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Why We Built It
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-950">
                The internet got crowded, complicated, and rented.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Social feeds change their algorithms constantly. You invest years gathering followers, only for your posts to reach a tiny fraction of them. Meanwhile, "link-in-bio" tools turned profiles into dull lists of buttons with zero brand depth.
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                On the other end, traditional website builders demand DNS records, hosting fees, plugin updates, and weeks of design tinkering.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl shadow-slate-900/5 space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Globe className="text-blue-600" size={20} />
                <span>The OkInSite Standard</span>
              </h3>
              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Zero Technical Friction:</strong> Claim your address like <code>yourname.okinsite.com</code> and edit visually.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Rich Brand Depth:</strong> Showcase services, pricing, menus, galleries, and stories—not just bare links.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Direct Conversions:</strong> Turn visits into real client inquiries through WhatsApp and Email.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Modern Infrastructure:</strong> Free global CDN delivery, automatic SSL, and search indexation out of the box.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-200">
            <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-950 mb-12">
              Our Guiding Principles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Zap size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Speed Over Complexity</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every feature is tested against one question: Does this help a user publish an authentic presence in under 3 minutes?
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Shield size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Credibility By Default</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Clean typography, fast load times, automated Schema.org metadata, and SSL security ensure visitors immediately trust your site.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Heart size={20} />
                </div>
                <h3 className="text-base font-bold text-slate-900">Accessible to Everyone</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  No credit cards, no hidden paywalls for fundamental features. Everyone deserves their own free address on the web.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl shadow-blue-600/20">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to claim your place online?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
              Choose your address, customize your presence, and publish live in 3 minutes.
            </p>
            <div className="flex justify-center">
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-blue-600 font-bold text-sm shadow-md hover:bg-blue-50 active:scale-[0.98] transition-all"
              >
                <span>Claim Your Free Address</span>
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
