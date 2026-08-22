"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Zap,
  Globe,
  Layers,
  Star,
  Check,
  CheckCircle2,
  LayoutTemplate,
  PenLine,
  ChevronLeft,
  Shield,
  Users,
  Rocket,
  Code2,
  Sparkles,
  Flame,
  ArrowUpRight,
  Cpu,
  Laptop,
  X,
  Menu,
  Smartphone,
  Eye,
  Music,
  Store,
  Briefcase,
  UserCheck,
  ShoppingBag,
  Utensils,
  Share2,
  CheckSquare,
  Sparkle,
  Lock,
  Server,
  Radio,
  Clock,
  Compass,
} from "lucide-react";
import { TemplateThumbnail } from "@/components/renderer/TemplateThumbnail";
import { SiteCreationModal } from "@/components/common/SiteCreationModal";
import { projectsApi, templatesApi } from "@/lib/api";
import { BusinessProfile, injectBusinessProfileIntoConfig } from "@/lib/businessProfile";

// Continuous Marquee items highlighting digital presence scope
const MARQUEE_ITEMS = [
  "🚀 Live in under 3 minutes",
  "🏢 For businesses",
  "🔗 Better than a bio link",
  "🎨 For creators",
  "👤 Your personal corner",
  "💼 Portfolios that work",
  "🍽️ Menus for restaurants",
  "🚀 Launch your idea",
  "⚡ We host it for you",
  "🔒 Secure by default",
  "📱 Looks great on phones",
];

// Digital Presence Categories ("Whatever You Need to Be Online")
const PRESENCE_TYPES = [
  {
    icon: <Store className="w-6 h-6 text-emerald-400" />,
    title: "🏢 Business Presence",
    headline: "Give your business a professional home online.",
    desc: "Services, pricing, contact, location, reviews, booking and lead forms.",
    cta: "Create Business Presence →",
    badge: "Business",
    gradient: "from-emerald-500/10 via-slate-900 to-slate-900",
    borderColor: "border-emerald-500/30",
  },
  {
    icon: <Share2 className="w-6 h-6 text-cyan-400" />,
    title: "🔗 Link in Bio",
    headline: "Turn your social profile into a complete digital hub.",
    desc: "Links, social accounts, products, content, newsletter and more.",
    cta: "Create Link in Bio →",
    badge: "Social & Bio",
    gradient: "from-cyan-500/10 via-slate-900 to-slate-900",
    borderColor: "border-cyan-500/30",
  },
  {
    icon: <Music className="w-6 h-6 text-rose-400" />,
    title: "🎨 Creator Presence",
    headline: "Show the world what you create.",
    desc: "Portfolio, videos, social links, content, newsletter, products and collaborations.",
    cta: "Create Creator Page →",
    badge: "Creators & Artists",
    gradient: "from-rose-500/10 via-slate-900 to-slate-900",
    borderColor: "border-rose-500/30",
  },
  {
    icon: <UserCheck className="w-6 h-6 text-indigo-400" />,
    title: "👤 Personal Presence",
    headline: "Your own place on the internet.",
    desc: "About you, your work, interests, links, achievements and contact.",
    cta: "Create My Page →",
    badge: "Personal Brand",
    gradient: "from-indigo-500/10 via-slate-900 to-slate-900",
    borderColor: "border-indigo-500/30",
  },
  {
    icon: <Briefcase className="w-6 h-6 text-violet-400" />,
    title: "💼 Portfolio & Resume",
    headline: "Turn your CV into an interactive online presence.",
    desc: "Projects, skills, experience, achievements and contact.",
    cta: "Create Portfolio →",
    badge: "Career & CV",
    gradient: "from-violet-500/10 via-slate-900 to-slate-900",
    borderColor: "border-violet-500/30",
  },
  {
    icon: <Utensils className="w-6 h-6 text-amber-400" />,
    title: "🍽 Restaurant Presence",
    headline: "Give customers an instant digital menu.",
    desc: "Menu, prices, photos, location, reservations and QR sharing.",
    cta: "Create Restaurant Page →",
    badge: "Food & Dining",
    gradient: "from-amber-500/10 via-slate-900 to-slate-900",
    borderColor: "border-amber-500/30",
  },
  {
    icon: <ShoppingBag className="w-6 h-6 text-blue-400" />,
    title: "🚀 Product & Brand",
    headline: "Launch your product, startup or personal brand.",
    desc: "Product information, features, testimonials, waitlists and conversion-focused sections.",
    cta: "Launch My Product →",
    badge: "Product Launch",
    gradient: "from-blue-500/10 via-slate-900 to-slate-900",
    borderColor: "border-blue-500/30",
  },
];

// Differentiation Data
const DIFFERENTIATION = [
  {
    type: "Link in Bio",
    issue: "A list of buttons isn't enough anymore.",
    solution: "Give them the full picture: who you are, what you make, and how to reach you.",
  },
  {
    type: "Traditional Website",
    issue: "Building a site shouldn't take all weekend.",
    solution: "Skip the setup. Just click what you want to change, type, and hit publish.",
  },
  {
    type: "Social Profile",
    issue: "You don't own your social media profile.",
    solution: "Claim your own address. A place on the internet that actually belongs to you.",
  },
  {
    type: "Oninsite",
    issue: "It usually costs money to get started.",
    solution: "Start for free. No credit card, no trials, no hidden fees.",
  },
];

const SOCIAL_PROOF = [
  { name: "Sofia Marin", role: "UI/UX Designer", text: "Created my digital presence in 90 seconds. Sent my link to a client the same afternoon and landed the project.", avatar: "SM" },
  { name: "Raj Kapoor", role: "Restaurant Owner", text: "Our digital menu is live and indexed on Google. Customers scan our QR code at tables. Setup took 2 minutes.", avatar: "RK" },
  { name: "Emma Liu", role: "Product Creator", text: "I replaced my old bio link with a complete Oninsite presence. My newsletter subscribers doubled in the first month.", avatar: "EL" },
  { name: "Lucas Ferreira", role: "Indie Maker", text: "Launched my startup landing page with waitlist form in under 3 minutes. Zero coding or server hassle.", avatar: "LF" },
];

type Step = "username" | "mode" | "template";

export default function LandingPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("username");
  const [usernameInput, setUsernameInput] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [dbTemplates, setDbTemplates] = useState<any[]>([]);

  useEffect(() => {
    templatesApi.list()
      .then((res) => {
        const data = res?.data || [];
        if (Array.isArray(data)) setDbTemplates(data);
      })
      .catch(() => {});
  }, []);

  const cleanSlug =
    usernameInput
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "my-brand";

  const displayName =
    cleanSlug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "Your Name";

  const canProceed = cleanSlug.length >= 2;

  const launchEditor = async (templateId: string | null, profile?: BusinessProfile | null) => {
    setIsRedirecting(true);
    try {
      let customConfig: any;
      const tpl = templateId
        ? dbTemplates.find((t) => (t._id === templateId || t.slug === templateId || t.id === templateId))
        : null;

      const effectiveName = profile?.brandName?.trim() || displayName;

      if (tpl) {
        const rawConfig = tpl.defaultConfig || tpl.config || {};
        customConfig = JSON.parse(JSON.stringify(rawConfig));
        if (customConfig.meta) customConfig.meta.title = effectiveName;
        const s0 = customConfig.sections?.[0];
        if (s0?.content) {
          if (s0.content.title) s0.content.title = effectiveName;
          if (s0.content.name) s0.content.name = effectiveName;
        }
      } else {
        customConfig = {
          meta: { title: effectiveName, category: profile?.category || "portfolio", description: profile?.tagline || "Digital Presence" },
          theme: { primaryColor: "#4F46E5", backgroundColor: "#0F172A", textColor: "#F8FAFC", fontFamily: "Inter", borderRadius: "16px" },
          sections: [
            {
              id: "hero-1",
              type: "hero",
              title: effectiveName,
              subtitle: profile?.tagline || "Welcome to my official digital presence.",
              badge: "✦ Digital Presence",
              content: { ctaText: profile?.ctaText || "Get Started", ctaLink: "#contact" }
            },
            {
              id: "contact-1",
              type: "contact",
              title: "Get in Touch",
              subtitle: "Send us a message or reach out directly.",
              content: {
                phone: profile?.phone || "",
                whatsapp: profile?.whatsapp || profile?.phone || "",
                email: profile?.email || "",
                address: profile?.location || "",
                formConfig: {
                  enabled: true,
                  destination: "both",
                  whatsappNumber: profile?.whatsapp || profile?.phone || "",
                  notifyEmail: profile?.email || "",
                }
              }
            }
          ]
        };
      }

      // If business profile was provided, inject it across all template sections
      if (profile) {
        customConfig = injectBusinessProfileIntoConfig(customConfig, profile);
      }

      const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (token) {
        const res = await projectsApi.create({
          name: effectiveName,
          category: (profile?.category ?? tpl?.category ?? "portfolio") as any,
          config: customConfig,
        });
        if (res.data?._id) {
          try {
            sessionStorage.setItem(
              `Oninsite-pending-project:${res.data._id}`,
              JSON.stringify(res.data)
            );
          } catch {
            /* ignore quota */
          }
          router.push(`/editor/${res.data._id}`);
          return;
        }
      }

      sessionStorage.setItem(
        "Oninsite-quick-start-draft",
        JSON.stringify({
          name: effectiveName,
          slug: cleanSlug,
          category: profile?.category ?? tpl?.category ?? "portfolio",
          config: customConfig,
        })
      );
      router.push("/editor/quick-start");
    } catch (err) {
      console.error(err);
      router.push("/templates");
    } finally {
      setIsRedirecting(false);
    }
  };

  // ─── JSON-LD Structured Schema for Google & AI Search ─────────────────────
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Oninsite Studio",
    operatingSystem: "All",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Get your digital presence live in under 3 minutes. Create a professional online presence for your business, brand, portfolio, creator profile, link-in-bio, restaurant, product, or yourself.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  };

  const stepIndex = step === "username" ? 0 : step === "mode" ? 1 : 2;
  const stepLabels = ["Username", "Start type", "Template"];

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* ── SEO JSON-LD Structured Schema Injection ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* ── SEO: rich structured headings + invisible crawlable content ── */}
      <div className="sr-only">
        <h1>Oninsite — Your Digital Presence. Live in Under 3 Minutes.</h1>
        <p>
          Create a professional digital presence for your business, brand, portfolio, creator profile, link-in-bio, restaurant, product, or yourself. No coding. No hosting setup. No complicated tools.
        </p>
      </div>

      {/* ── Nav Bar ── */}
      <nav
        aria-label="Main navigation"
        className="surface-blur sticky top-0 z-50 border-b"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl bg-indigo-600 shadow-md shadow-indigo-600/20 flex items-center justify-center animate-pulse-glow"
              aria-hidden
            >
              <span className="text-white text-sm font-black tracking-tighter">N</span>
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900">Oninsite</span>
            <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              For everyone
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#start" className="btn btn-ghost text-xs">Quick Start</a>
            <Link href="/templates" className="btn btn-ghost text-xs">Templates</Link>
            <a href="#how-it-works" className="btn btn-ghost text-xs">3-Min Flow</a>
            <a href="#presences" className="btn btn-ghost text-xs">Presences</a>
            <a href="#differentiation" className="btn btn-ghost text-xs">Why Oninsite</a>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn btn-ghost text-xs hidden sm:inline-flex">
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary text-xs shadow-md shadow-indigo-600/20 active:scale-95 transition-transform"
            >
              <span className="hidden sm:inline">Get Started </span>Free
              <span className="hidden sm:inline"> →</span>
            </button>
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <>
            <div
              className="fixed inset-x-0 top-14 bottom-0 bg-slate-950/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="fixed top-14 left-0 right-0 bg-white border-b border-slate-200 p-3 flex flex-col gap-1 z-50 animate-slide-down shadow-xl md:hidden safe-bottom max-h-[calc(100dvh-3.5rem)] overflow-y-auto overscroll-contain">
              <a href="#start" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors touch-manipulation">Quick Start</a>
              <Link href="/templates" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors touch-manipulation">Templates</Link>
              <a href="#how-it-works" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors touch-manipulation">3-Minute Flow</a>
              <a href="#presences" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors touch-manipulation">Digital Presences</a>
              <a href="#differentiation" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-3 px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors touch-manipulation">Why Oninsite</a>
              <div className="border-t border-slate-100 mt-1 pt-2 flex flex-col gap-1.5">
                <Link href="/login" onClick={() => setMobileNavOpen(false)} className="w-full flex items-center justify-center px-4 py-3 min-h-[48px] rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors touch-manipulation">Sign in</Link>
                <button type="button" onClick={() => { setMobileNavOpen(false); setIsModalOpen(true); }} className="w-full flex items-center justify-center px-4 py-3 min-h-[48px] rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors touch-manipulation">Get Started Free →</button>
              </div>
            </div>
          </>
        )}
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
          CONTINUOUS MARQUEE SLIDING STRIP
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900 border-y border-slate-800 py-2.5 overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-6 text-xs font-bold text-slate-300">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 shrink-0 hover:bg-white/10 transition-colors"
            >
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN HERO ("Create your website in 3 minutes.")
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="start"
        aria-labelledby="hero-heading"
        className="relative overflow-hidden pt-10 sm:pt-16 pb-14 sm:pb-24"
      >
        {/* Ambient Lighting Orbs */}
        <div className="orb orb-brand w-[550px] h-[550px] -top-32 right-[2%] opacity-20 animate-spin-slow" />
        <div className="orb orb-violet w-[420px] h-[420px] bottom-0 left-[4%] opacity-20 animate-pulse-glow" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 sm:gap-12 lg:gap-16">
            {/* ── Left: Main Hero Copy ── */}
            <div className="flex-1 space-y-5 sm:space-y-6 pt-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold shadow-xs animate-float-smooth">
                <Clock size={14} className="text-indigo-600 animate-sparkle" />
                <span>Live in under 3 minutes</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <h1
                id="hero-heading"
                className="text-3xl sm:text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]"
              >
                Create your website
                <br />
                <span className="text-gradient">in under 3 minutes.</span>
              </h1>

              <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                The simplest way to build a clean, professional online home for your{" "}
                <strong className="text-slate-900 font-bold">
                  business, portfolio, creator brand, restaurant, or ideas.
                </strong>
              </p>

              {/* Simple 3-step pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 pt-1">
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span> Pick a style
                </span>
                <span className="text-slate-400 font-bold">→</span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span> Add details
                </span>
                <span className="text-slate-400 font-bold">→</span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">3</span> Go live free
                </span>
              </div>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={16} />
                </button>

                <Link
                  href="/templates"
                  className="px-7 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <span>Explore Templates</span>
                </Link>
              </div>

              {/* Trust strip under CTA */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-600">
                {[
                  "Free Oninsite link included",
                  "Fast hosting built-in",
                  "Free SSL security",
                  "100% Mobile responsive",
                  "No coding required",
                  "Publish in 1-click",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <Check size={13} className="text-emerald-600 shrink-0 font-bold" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: Clear Username Claim Widget ── */}
            <div className="w-full lg:w-[460px] flex-shrink-0 relative">
              <div className="hidden sm:flex absolute -top-4 -right-4 z-30 items-center gap-1.5 bg-slate-900 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-2xl shadow-xl border border-slate-700">
                <Zap size={14} className="text-amber-400" />
                <span>Instant Free Link</span>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-900/10 overflow-hidden relative z-20">
                <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Claim Your Free Website Link
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                    Free Forever
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-4">
                  <div>
                    <label
                      htmlFor="slug-input"
                      className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider"
                    >
                      Choose your web address
                    </label>
                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
                      <span className="text-sm font-semibold text-slate-400 select-none whitespace-nowrap pr-1.5 font-mono">
                        Oninsite.site /
                      </span>
                      <input
                        id="slug-input"
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && canProceed) setIsModalOpen(true);
                        }}
                        placeholder="your-name"
                        autoFocus
                        className="flex-1 bg-transparent text-sm font-mono font-bold text-slate-900 focus:outline-none placeholder-slate-300"
                      />
                      {canProceed && (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 ml-2" />
                      )}
                    </div>
                    {canProceed ? (
                      <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                        <Check size={12} className="font-bold" /> Oninsite.site/{cleanSlug} is ready to claim!
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-2">
                        Type your name, brand, or project name above.
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!canProceed}
                    className="w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] shadow-lg shadow-indigo-600/25"
                  >
                    <span>Create My Website Free</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-around text-[11px] text-slate-500 font-semibold">
                  <span>✓ No credit card</span>
                  <span>✓ Free hosting</span>
                  <span>✓ Live in 3 mins</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3-MINUTE PROMISE VISUAL SECTION ("From idea to live in 3 minutes.")
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        aria-labelledby="promise-heading"
        className="py-20 bg-slate-950 text-white relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-bold">
              <Clock size={14} className="text-amber-400" />
              How it works
            </div>
            <h2
              id="promise-heading"
              className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-xl mx-auto leading-tight"
            >
              Idea to live in 3 steps.
            </h2>
            <p className="text-slate-400 text-base max-w-lg mx-auto">
              We stripped away all the complicated parts of building a website.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 01: Choose */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col justify-between relative group">
              <div>
                <div className="text-3xl font-black text-indigo-400 mb-4 font-mono">01 — Choose</div>
                <h3 className="text-xl font-bold text-white mb-2">Tell Oninsite what you're creating.</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Select your purpose: Business, Creator, Portfolio, Link in Bio, Restaurant, Product, Resume, or Personal.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/10 text-[11px] font-semibold text-slate-300">
                {["Business", "Creator", "Portfolio", "Bio Link", "Restaurant", "Product", "Resume"].map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Step 02: Customize */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col justify-between relative group">
              <div>
                <div className="text-3xl font-black text-indigo-400 mb-4 font-mono">02 — Customize</div>
                <h3 className="text-xl font-bold text-white mb-2">Pick a template and make it yours.</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Click any text, image, or section directly on the visual canvas. Everything feels instant and simple.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-4 border-t border-white/10 text-xs font-mono font-bold text-indigo-300">
                <span>Click</span> → <span>Edit</span> → <span>Preview</span>
              </div>
            </div>

            {/* Step 03: Go Live */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900/40 to-slate-900 border-2 border-indigo-500 shadow-xl flex flex-col justify-between relative group">
              <div>
                <div className="text-3xl font-black text-emerald-400 mb-4 font-mono">03 — Go Live</div>
                <h3 className="text-xl font-bold text-white mb-2">Click Go Live. Oninsite handles the rest.</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Automatic hosting, SSL encryption, global CDN delivery, mobile optimization, and basic SEO.
                </p>
              </div>
              <div className="pt-4 border-t border-indigo-500/30 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Instant Global Deployment
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-block px-8 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-base font-extrabold shadow-lg">
              That's it. You're online.
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CORE BRAND STATEMENT ("You don't need a website. You need a presence.")
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-extrabold uppercase tracking-wider">
            Core Oninsite Philosophy
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            You don't need a website.
            <br />
            <span className="text-gradient">You need a presence.</span>
          </h2>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            A single, powerful place on the internet where people can:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-xs font-extrabold text-slate-900">
            {[
              "Find you.",
              "Know you.",
              "Contact you.",
              "Buy from you.",
              "Follow you.",
              "Work with you.",
            ].map((action) => (
              <div
                key={action}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs flex items-center justify-center gap-2 hover:border-indigo-400 transition-colors"
              >
                <CheckCircle2 size={16} className="text-indigo-600 shrink-0" />
                <span>{action}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 max-w-lg mx-auto font-medium">
            Oninsite gives you that presence without the complexity of traditional website builders.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          "WHATEVER YOU NEED TO BE ONLINE" (Digital Presence Categories)
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="presences"
        aria-labelledby="presences-heading"
        className="py-24 bg-slate-950 text-white relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-bold">
              <Compass size={14} /> Comprehensive Digital Presences
            </div>
            <h2
              id="presences-heading"
              className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight"
            >
              One Oninsite. Every kind of digital presence.
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
              Select what you are creating today. All presences come ready-to-edit with zero coding required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRESENCE_TYPES.map((pt, i) => (
              <div
                key={i}
                className={`group p-7 rounded-3xl bg-gradient-to-b ${pt.gradient} border ${pt.borderColor} hover:border-white/30 transition-all duration-300 flex flex-col justify-between shadow-xl`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-white/10 border border-white/10 group-hover:scale-110 transition-transform">
                      {pt.icon}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10">
                      {pt.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{pt.title}</h3>
                  <h4 className="text-xs font-semibold text-indigo-300 mb-2">{pt.headline}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">{pt.desc}</p>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 rounded-xl bg-white/10 hover:bg-white text-slate-100 hover:text-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  <span>{pt.cta}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          LINK IN BIO UPGRADED HIGHLIGHT
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white border-y border-indigo-500/30">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-extrabold">
              <Share2 size={14} /> Social Link Revolution
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Your Link in Bio, Upgraded.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Don't just give people a list of plain link buttons. Give them a complete digital presence with links, about info, products, content, newsletters, and contact forms.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs font-semibold text-indigo-200">
              {["Links", "About", "Content", "Portfolio", "Products", "Socials", "Contact"].map((item) => (
                <span key={item} className="px-3 py-1 rounded-lg bg-white/10 border border-white/10">
                  + {item}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-indigo-500/40 shadow-2xl text-center space-y-4 shrink-0 w-full md:w-80">
            <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-bold">
              One Link. Your Entire Presence.
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compatible with Instagram, TikTok, YouTube, Twitter/X, LinkedIn, & Spotify bio URLs.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Build Upgraded Bio Link</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          STRONG DIFFERENTIATION ("More than a link. Simpler than a website builder.")
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="differentiation"
        aria-labelledby="diff-heading"
        className="py-24 bg-slate-900 text-white"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-bold">
              <Flame size={14} className="text-amber-400" />
              Why it's different
            </div>
            <h2
              id="diff-heading"
              className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight"
            >
              Simpler than a website builder.
            </h2>
            <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
              Stop fighting with complicated tools just to get your ideas out there.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DIFFERENTIATION.map((d, i) => (
              <div
                key={i}
                className={`p-6 rounded-3xl border ${
                  i === 3
                    ? "bg-indigo-950/80 border-indigo-500 shadow-xl"
                    : "bg-slate-950/60 border-white/10"
                } flex flex-col justify-between`}
              >
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 mb-2">
                    {d.type}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{d.issue}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{d.solution}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 text-[11px] font-semibold text-slate-300">
                  {i === 3 ? "✓ What you get here" : "vs The old way"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          HOSTING POSITIONING ("Live everywhere. Automatically.")
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <div className="badge badge-brand mx-auto mb-2">Zero Maintenance Hosting</div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 max-w-xl mx-auto leading-tight">
              Live everywhere. Automatically.
            </h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto leading-relaxed">
              You create it. Oninsite handles all the technical stuff behind the scenes.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { title: "Global Hosting", desc: "Edge delivery worldwide", icon: <Globe className="w-5 h-5 text-indigo-600" /> },
              { title: "Free SSL", desc: "Automatic HTTPS encryption", icon: <Lock className="w-5 h-5 text-emerald-600" /> },
              { title: "Fast Loading", desc: "Optimized image & asset load", icon: <Zap className="w-5 h-5 text-amber-600" /> },
              { title: "Mobile Ready", desc: "Responsive on every screen", icon: <Smartphone className="w-5 h-5 text-blue-600" /> },
              { title: "Auto Deployment", desc: "Zero server config required", icon: <Server className="w-5 h-5 text-violet-600" /> },
            ].map((h, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-xs">
                  {h.icon}
                </div>
                <h3 className="font-bold text-xs text-slate-900">{h.title}</h3>
                <p className="text-[11px] text-slate-500">{h.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-3xl bg-slate-900 text-white text-center max-w-3xl mx-auto space-y-3 shadow-xl">
            <h3 className="text-xl font-bold">No servers. No hosting configuration. No deployment headaches.</h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-lg mx-auto">
              You don't need to learn DNS records, FTP, or cloud infrastructure. Just click <strong className="text-emerald-400 font-mono font-extrabold">Go Live</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TESTIMONIALS & REVIEWS
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        aria-labelledby="testimonials-heading"
        className="py-24 bg-slate-50 border-t border-slate-200"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14 space-y-2">
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 text-amber-400 fill-amber-400 animate-sparkle"
                />
              ))}
            </div>
            <h2 id="testimonials-heading" className="text-3xl font-extrabold text-slate-900">
              Creators & business owners who launched with Oninsite
            </h2>
            <p className="text-slate-500 text-sm">Real people, real presences, instant results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {SOCIAL_PROOF.map((s, i) => (
              <div
                key={i}
                className="p-6 border border-slate-200 rounded-3xl bg-white flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <p className="text-slate-700 text-xs leading-relaxed mb-6 italic">
                  "{s.text}"
                </p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {s.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{s.name}</div>
                    <div className="text-slate-500 text-[11px]">{s.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          FINAL BRAND STATEMENT & CALL TO ACTION
      ══════════════════════════════════════════════════════════════════════ */}
      <section aria-labelledby="cta-heading" className="py-24 bg-slate-950 text-white relative">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-xs font-bold">
            <Zap size={14} className="text-amber-400" />
            <span>Oninsite Studio</span>
          </div>

          <h2
            id="cta-heading"
            className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight"
          >
            Your digital presence. Live in under 3 minutes.
          </h2>

          <p className="text-slate-400 text-xs sm:text-sm font-semibold tracking-wide uppercase font-mono max-w-xl mx-auto">
            Business · Creator · Brand · Portfolio · Link in Bio · Restaurant · Product · Personal
          </p>

          <p className="text-slate-300 text-base leading-relaxed max-w-lg mx-auto">
            Choose what you need. Make it yours. Go Live. No code. No hosting setup. No complicated tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center gap-2 active:scale-95"
            >
              <span>Get Started Free →</span>
            </button>

            <Link
              href="/templates"
              className="px-8 py-3.5 rounded-2xl border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <span>Explore Templates</span>
            </Link>
          </div>

          <p className="text-xs text-slate-500 pt-2 font-medium">
            One simple platform to create, launch and share your place on the internet.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-800 py-10 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              N
            </div>
            <span className="font-bold text-slate-100 text-sm">Oninsite Studio</span>
            <span className="text-slate-600">— Your Digital Presence Platform.</span>
          </div>
          <p className="text-slate-600">© 2026 Oninsite Digital Presence. All rights reserved.</p>
          <nav aria-label="Footer navigation" className="flex gap-5">
            <Link href="/templates" className="hover:text-slate-300 transition-colors">
              Templates
            </Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Login
            </Link>
            <Link href="/register" className="hover:text-slate-300 transition-colors">
              Register
            </Link>
          </nav>
        </div>
      </footer>

      {/* ── Site Creation Popup Modal ── */}
      <SiteCreationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        username={usernameInput || "my-brand"}
        onLaunch={(templateId, profile) => launchEditor(templateId, profile)}
        isRedirecting={isRedirecting}
      />
    </div>
  );
}
