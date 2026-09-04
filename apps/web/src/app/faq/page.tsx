"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import { ChevronDown, Sparkles, ArrowRight, HelpCircle } from "lucide-react";

const FAQ_CATEGORIES = [
  {
    category: "General & Identity",
    items: [
      {
        q: "What is OkInSite?",
        a: "OkInSite is a modern digital presence platform that allows creators, freelancers, local businesses, and restaurants to claim their own clean custom subdomain (e.g. yourname.okinsite.com) and launch a professional, mobile-ready online home in under 3 minutes with zero coding or server configuration.",
      },
      {
        q: "How is OkInSite different from Linktree or traditional website builders?",
        a: "Link-in-bio tools offer only a list of generic buttons with zero brand depth. Traditional website builders (like WordPress or Webflow) are expensive, steep in complexity, and require hours of setup. OkInSite provides the sweet spot: a rich, credible, multi-section digital presence that takes only 3 minutes to publish.",
      },
      {
        q: "Can I use OkInSite for my business or restaurant?",
        a: "Yes. OkInSite has purpose-built archetypes for Local Businesses (services, reviews, inquiry forms), Restaurants (interactive digital menus & QR codes), Portfolios (case studies & visual galleries), and Creators (links, video showcases, and media kits).",
      },
    ],
  },
  {
    category: "Subdomains & Hosting",
    items: [
      {
        q: "Is the custom subdomain really free?",
        a: "Yes. Claiming your yourname.okinsite.com address is 100% free forever, including SSL encryption and global edge CDN hosting. No credit card is required to claim or publish.",
      },
      {
        q: "How does the subdomain format work?",
        a: "Your site is published on a dedicated clean subdomain format: https://yourname.okinsite.com (where 'yourname' is your reserved handle). This ensures your link looks professional and independent across social bios, business cards, and email signatures.",
      },
      {
        q: "Do I need to buy hosting or configure DNS records?",
        a: "No. OkInSite handles global edge CDN hosting, automated SSL certificate generation, caching, and server management automatically with zero configuration.",
      },
    ],
  },
  {
    category: "SEO & Discoverability",
    items: [
      {
        q: "Will my OkInSite address be indexed by Google?",
        a: "Yes. When you publish a site on OkInSite, our compiler automatically injects search-engine-friendly tags (meta title, description, canonical link, OpenGraph social cards) and Schema.org structured data. The system adds your live URL to our sitemap index and pings search crawlers.",
      },
      {
        q: "How do lead forms and customer inquiries work?",
        a: "Each template comes pre-configured with inquiry forms. You can set inquiries to deliver directly to your email address and/or launch a pre-filled WhatsApp chat immediately, allowing you to connect with potential clients within seconds.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<string | null>("What is OkInSite?");

  const toggleItem = (q: string) => {
    setOpenItem(openItem === q ? null : q);
  };

  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
              <HelpCircle size={14} />
              <span>Answers & Explanations</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 leading-tight">
              Frequently Asked <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Questions.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Everything you need to know about claiming, building, publishing, and growing your digital presence with OkInSite.
            </p>
          </div>
        </section>

        <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          {FAQ_CATEGORIES.map((cat, cIdx) => (
            <div key={cIdx} className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50/80 px-3 py-1 rounded-md inline-block">
                {cat.category}
              </h2>

              <div className="space-y-3">
                {cat.items.map((item, iIdx) => {
                  const isOpen = openItem === item.q;
                  return (
                    <div
                      key={iIdx}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(item.q)}
                        className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                      >
                        <h3 className="text-base sm:text-lg font-bold text-slate-900">
                          {item.q}
                        </h3>
                        <ChevronDown
                          size={18}
                          className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-blue-600" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-fade-in">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="bg-blue-600 text-white rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-xl shadow-blue-600/20">
            <h2 className="text-2xl font-bold tracking-tight">Have more questions?</h2>
            <p className="text-blue-100 text-sm max-w-md mx-auto">
              The easiest way to understand OkInSite is to try it. It takes less than 3 minutes to see your site live.
            </p>
            <div className="flex justify-center">
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-blue-600 font-bold text-sm shadow-md hover:bg-blue-50 transition-all"
              >
                <span>Claim Your Free Web Address</span>
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
