import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/PublicHeader";
import { PublicFooter } from "@/components/navigation/PublicFooter";
import {
  Check,
  X,
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Globe,
  QrCode,
  Smartphone,
  HeartHandshake,
  HelpCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "OkInSite Pricing — 100% Free Forever Digital Presence Platform",
  description:
    "Zero hidden fees, zero ads, and zero credit card required. Claim your free custom subdomain (yourname.okinsite.com), unlimited pageviews on edge CDN, automated SSL, QR codes, and visual editor.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "OkInSite Pricing — 100% Free Forever Digital Presence Platform",
    description:
      "Claim your free custom web address (yourname.okinsite.com) with automated SSL, visual editor, WhatsApp lead capture, and unlimited edge CDN traffic.",
    url: "https://okinsite.com/pricing",
  },
};

const PLAN_TIERS = [
  {
    id: "creator",
    name: "Creator & Bio Free",
    badge: "Most Popular for Bios",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    price: "$0",
    period: "forever",
    subtitle: "Perfect for content creators, artists, freelancers, and personal brand link-in-bio hubs.",
    cta: "Claim Free Bio Address",
    ctaLink: "/register",
    featured: false,
    highlights: [
      "Custom Subdomain (e.g. yourname.okinsite.com)",
      "Single-page Link in Bio & Portfolio Archetypes",
      "Unlimited Links & Social Icons",
      "Visual Canvas Click-to-Edit Studio",
      "Printable High-Res Vector QR Code",
      "Light, Dark & Glassmorphism Design Modes",
      "Zero Third-Party Ads or OkInSite watermarks",
    ],
  },
  {
    id: "business",
    name: "Business Pro Free",
    badge: "100% Free · Early Adopter Offer",
    badgeColor: "bg-emerald-500 text-white border-emerald-400",
    price: "$0",
    strikethroughPrice: "$19/mo",
    period: "free for early adopters",
    subtitle: "Built for local stores, cafes, restaurants, clinics, and professional service businesses.",
    cta: "Claim Free Business Site",
    ctaLink: "/register",
    featured: true,
    highlights: [
      "Everything in Creator & Bio, plus:",
      "Multi-Section Business & Restaurant Layouts",
      "Interactive Digital QR Menu with Dietary Badges",
      "One-Click WhatsApp Order & Lead Capture",
      "Contact & Inquiry Form Submissions with Lead Inbox",
      "Interactive Google Maps Embed",
      "Google XML Sitemap & Automated Meta Tags",
      "Edge CDN Hosting with 99.9% Uptime SLA",
    ],
  },
  {
    id: "partner",
    name: "Brand & Partner Free",
    badge: "Community Edition",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    price: "$0",
    strikethroughPrice: "$49/mo",
    period: "community access",
    subtitle: "For design agencies, multi-location brands, and innovators wanting full template freedom.",
    cta: "Explore Template Studio",
    ctaLink: "/templates",
    featured: false,
    highlights: [
      "Everything in Business Pro, plus:",
      "Custom JSON Template Import & AI Code Studio",
      "Unlimited Published Sites under 1 Account",
      "Client Website Handoff & Preview Links",
      "Custom CSS Variables & Google Fonts Pairing",
      "Direct Priority Community Discord & Email Support",
      "Early Access to Apex Custom Domain (.com) Features",
    ],
  },
];

const COMPARISON_CATEGORIES = [
  {
    name: "Web Address & Identity",
    features: [
      { name: "Dedicated Subdomain (yourname.okinsite.com)", creator: true, business: true, partner: true },
      { name: "Instant Subdomain Availability Checker", creator: true, business: true, partner: true },
      { name: "Zero Third-Party Banner Ads", creator: true, business: true, partner: true },
      { name: "Custom Site Title, Meta Description & Favicon", creator: true, business: true, partner: true },
      { name: "Custom Domain (.com / .in / .io) Integration", creator: "Roadmap", business: "Roadmap", partner: "Beta / Priority" },
    ],
  },
  {
    name: "Design & Visual Editor",
    features: [
      { name: "Live Canvas Click-to-Edit Visual Studio", creator: true, business: true, partner: true },
      { name: "Mobile, Tablet & Desktop Responsive Previews", creator: true, business: true, partner: true },
      { name: "History Undo / Redo Stack", creator: true, business: true, partner: true },
      { name: "Curated Google Fonts & Custom Typography", creator: true, business: true, partner: true },
      { name: "24+ Pre-designed Archetype Sections", creator: "Essential", business: "All 24+", partner: "All 24+ & Custom" },
      { name: "Dark, Light & Glassmorphism Themes", creator: true, business: true, partner: true },
      { name: "Custom JSON & CSS Template Code Override", creator: false, business: true, partner: true },
    ],
  },
  {
    name: "Customer Interaction & Leads",
    features: [
      { name: "Direct WhatsApp Click-to-Chat with Custom Text", creator: true, business: true, partner: true },
      { name: "Contact & Lead Generation Forms", creator: "Basic", business: "Unlimited", partner: "Unlimited" },
      { name: "Interactive Restaurant Menu with Veg/Non-Veg Badges", creator: false, business: true, partner: true },
      { name: "Google Maps Interactive Store Embed", creator: false, business: true, partner: true },
      { name: "Downloadable Vector Print QR Code", creator: true, business: true, partner: true },
      { name: "Native Web Share API Integration", creator: true, business: true, partner: true },
    ],
  },
  {
    name: "Hosting, Speed & Security",
    features: [
      { name: "Global Edge CDN Deployment", creator: true, business: true, partner: true },
      { name: "Automated Global SSL Encryption (HTTPS)", creator: true, business: true, partner: true },
      { name: "Unlimited Bandwidth & Pageviews", creator: true, business: true, partner: true },
      { name: "Google PageSpeed Optimized (95+ score)", creator: true, business: true, partner: true },
      { name: "Automated Search Engine XML Sitemap", creator: true, business: true, partner: true },
      { name: "Privacy-Friendly Zero-Overhead Analytics", creator: true, business: true, partner: true },
    ],
  },
];

const COMPETITOR_COMPARISON = [
  {
    platform: "OkInSite",
    price: "$0 / forever",
    customSubdomain: "Yes (yourname.okinsite.com)",
    ads: "Zero Ads",
    qrMenu: "Included Free",
    speed: "Ultra-Fast Edge CDN",
    highlight: true,
  },
  {
    platform: "Linktree",
    price: "$60 – $264 / year",
    customSubdomain: "No (linktr.ee/username)",
    ads: "Free tier has branding",
    qrMenu: "Limited",
    speed: "Standard",
    highlight: false,
  },
  {
    platform: "Wix / Squarespace",
    price: "$192 – $432 / year",
    customSubdomain: "Complex setup",
    ads: "Free tier shows heavy ads",
    qrMenu: "Paid apps required",
    speed: "Heavy scripts",
    highlight: false,
  },
  {
    platform: "WordPress + Hosting",
    price: "$120 – $300 / year",
    customSubdomain: "Requires manual server",
    ads: "Depends on plugins",
    qrMenu: "Paid plugins needed",
    speed: "Requires caching plugins",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Why is OkInSite completely free right now?",
    a: "Our mission is to empower millions of small businesses, local retail shops, creators, and professionals to build a credible web destination without prohibitive costs. Thanks to our ultra-efficient edge compilation technology, our infrastructure overhead is a fraction of traditional website builders, allowing us to offer the core platform 100% free.",
  },
  {
    q: "Will I ever be forced to pay or have ads placed on my site?",
    a: "No. Sites published during our Free Forever Early Adopter program will remain free forever with zero third-party advertisements. We respect your brand and will never inject pop-ups, banners, or affiliate ads onto your public website.",
  },
  {
    q: "Do I need to enter a credit card or payment details to publish?",
    a: "Absolutely not. You can create an account, customize your website, claim your subdomain (e.g. yourname.okinsite.com), and publish your live URL in under 3 minutes with zero payment information.",
  },
  {
    q: "Can I change my subdomain or website design after publishing?",
    a: "Yes! You can jump into the visual editor anytime to adjust colors, text, menu items, images, and links. Changes go live instantly when you tap Publish.",
  },
  {
    q: "Can I use the high-resolution QR code for printed posters and table stands?",
    a: "Yes. In the visual editor and publish modal, you can download a crisp PNG QR code linked directly to your digital presence. Print it on flyers, menus, restaurant table stands, or product packaging.",
  },
];

export default function PricingPage() {
  return (
    <div className="bg-[#FAFBFD] text-slate-900 min-h-screen flex flex-col font-sans">
      <PublicHeader />

      <main className="flex-1">
        {/* Schema.org JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "OkInSite",
              applicationCategory: "DesignApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
              },
            }),
          }}
        />

        {/* Hero Section */}
        <section className="relative pt-16 pb-20 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/60 to-[#FAFBFD]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={14} className="text-emerald-500" />
              <span>100% Free · No Credit Card Required</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              A high-converting web presence,{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                free forever.
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Everything you need to launch your business, portfolio, restaurant menu, or creator hub with your own custom address. No hosting fees. No forced ads.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs sm:text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>yourname.okinsite.com free</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Automated SSL certificate</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                <span>Unlimited edge CDN traffic</span>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Choose your plan. All plans are currently $0.
            </h2>
            <p className="text-sm text-slate-600">
              Early adopters receive full lifetime access to our business-grade features at zero cost.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {PLAN_TIERS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-3xl p-8 sm:p-9 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.featured
                    ? "bg-white border-2 border-blue-600 shadow-2xl shadow-blue-600/15 ring-4 ring-blue-600/5 -translate-y-1 sm:-translate-y-2"
                    : "bg-white border border-slate-200/90 shadow-lg shadow-slate-900/[0.04] hover:border-slate-300 hover:shadow-xl"
                }`}
              >
                {/* Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span
                    className={`inline-block px-3.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-sm ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-950">{plan.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[38px]">{plan.subtitle}</p>
                  </div>

                  <div className="flex items-baseline gap-2 pt-1 border-b border-slate-100 pb-5">
                    {plan.strikethroughPrice && (
                      <span className="text-lg font-semibold text-slate-400 line-through">
                        {plan.strikethroughPrice}
                      </span>
                    )}
                    <span className="text-5xl font-black font-mono text-slate-950">{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500">/{plan.period}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      What’s included:
                    </div>
                    {plan.highlights.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <Check size={16} className="text-emerald-500 stroke-[3] shrink-0 mt-0.5" />
                        <span className="leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-slate-100">
                  <Link
                    href={plan.ctaLink}
                    className={`w-full h-12 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      plan.featured
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 hover:shadow-blue-600/40"
                        : "bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/10"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950">
                Detailed Feature Breakdown
              </h2>
              <p className="text-sm text-slate-600">
                Compare every tool, integration, and security feature available on OkInSite.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-xs text-slate-700">
                    <th className="p-4 sm:p-5 font-bold w-2/5">Platform Feature</th>
                    <th className="p-4 sm:p-5 font-bold text-center w-1/5">Creator & Bio</th>
                    <th className="p-4 sm:p-5 font-bold text-center w-1/5 bg-blue-50/60 text-blue-900 border-x border-blue-200/60">
                      Business Pro (Active)
                    </th>
                    <th className="p-4 sm:p-5 font-bold text-center w-1/5">Brand Partner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {COMPARISON_CATEGORIES.map((cat, cIdx) => (
                    <>
                      <tr key={`cat-${cIdx}`} className="bg-slate-50/50">
                        <td colSpan={4} className="px-4 py-3 font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                          {cat.name}
                        </td>
                      </tr>
                      {cat.features.map((feat, fIdx) => (
                        <tr key={`feat-${cIdx}-${fIdx}`} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 sm:px-5 py-3.5 text-slate-700 font-medium">{feat.name}</td>
                          <td className="p-4 sm:px-5 py-3.5 text-center">
                            {typeof feat.creator === "boolean" ? (
                              feat.creator ? (
                                <Check className="w-4 h-4 text-emerald-600 stroke-[3] mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-500">{feat.creator}</span>
                            )}
                          </td>
                          <td className="p-4 sm:px-5 py-3.5 text-center bg-blue-50/30 border-x border-blue-100">
                            {typeof feat.business === "boolean" ? (
                              feat.business ? (
                                <Check className="w-4 h-4 text-emerald-600 stroke-[3] mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-[11px] font-bold text-blue-700">{feat.business}</span>
                            )}
                          </td>
                          <td className="p-4 sm:px-5 py-3.5 text-center">
                            {typeof feat.partner === "boolean" ? (
                              feat.partner ? (
                                <Check className="w-4 h-4 text-emerald-600 stroke-[3] mx-auto" />
                              ) : (
                                <X className="w-4 h-4 text-slate-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-[11px] font-semibold text-purple-700">{feat.partner}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Competitor Cost Savings */}
        <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              How OkInSite compares to alternatives
            </h2>
            <p className="text-sm text-slate-600">
              Save hundreds of dollars every year while getting a faster, cleaner digital presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {COMPETITOR_COMPARISON.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-6 flex flex-col justify-between space-y-4 border ${
                  item.highlight
                    ? "bg-white border-blue-600 shadow-xl shadow-blue-600/10 ring-2 ring-blue-600/10"
                    : "bg-white/70 border-slate-200 shadow-sm"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-base text-slate-950">{item.platform}</span>
                    {item.highlight && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
                        Winner
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-black text-slate-900 font-mono">{item.price}</div>
                  <div className="pt-2 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Subdomain:</span>
                      <span className="font-medium text-slate-800">{item.customSubdomain}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">Ads & Branding:</span>
                      <span className="font-medium text-slate-800">{item.ads}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] font-bold uppercase">QR Menu / Ordering:</span>
                      <span className="font-medium text-slate-800">{item.qrMenu}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
                Frequently Asked Questions About Pricing
              </h2>
              <p className="text-sm text-slate-600">
                Clear answers with no fine print or deceptive loopholes.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle size={16} className="text-blue-600 shrink-0" />
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Call to Action */}
            <div className="text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white space-y-6 shadow-xl shadow-blue-600/20">
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                Ready to claim your free address?
              </h3>
              <p className="text-sm text-blue-100 max-w-md mx-auto">
                Lock in your handle under yourname.okinsite.com before someone else reserves it.
              </p>
              <div>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-lg transition-all"
                >
                  <span>Claim Your Free Address Now</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
