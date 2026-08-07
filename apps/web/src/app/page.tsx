"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Zap, Globe, Layers, Star, Check, ChevronRight, Palette, CreditCard, UtensilsCrossed, Link2, FileText, Mail, Briefcase } from "lucide-react";

const TICKER_ITEMS = [
  "Portfolio", "Digital Card", "Restaurant Menu", "Startup Landing",
  "Resume", "Link in Bio", "Business Site", "Event Page",
];

function TickerWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % TICKER_ITEMS.length);
        setVisible(true);
      }, 300);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className="text-gradient inline-block"
      style={{
        transition: "opacity 0.3s ease, transform 0.3s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-8px)",
        display: "inline-block",
      }}
    >
      {TICKER_ITEMS[index]}
    </span>
  );
}

const FEATURES = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "AI that understands you",
    desc: "Describe your vision in plain words. Our AI transforms your idea into a complete, beautiful site in seconds — no prompts to master.",
    color: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Live in under 60 seconds",
    desc: "From blank canvas to published URL in one minute flat. Your digital presence goes live instantly on a global network.",
    color: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    title: "Designed for everyone",
    desc: "Tap to edit any text. Swap colors. Rearrange sections. No design skills required — the interface guides you naturally.",
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "SEO-ready by default",
    desc: "Every site ships with optimized meta tags, Open Graph images, structured data, and a sitemap — automatically.",
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

const TEMPLATES = [
  { label: "Portfolio", icon: Palette, accent: "#6366F1" },
  { label: "Digital Card", icon: CreditCard, accent: "#10B981" },
  { label: "Restaurant", icon: UtensilsCrossed, accent: "#F43F5E" },
  { label: "Startup", icon: Zap, accent: "#F59E0B" },
  { label: "Link in Bio", icon: Link2, accent: "#06B6D4" },
  { label: "Resume", icon: FileText, accent: "#8B5CF6" },
];

const SOCIAL_PROOF = [
  { name: "Sofia Marin", role: "Freelance Designer", text: "I built my portfolio in 3 minutes. My clients think I hired a studio.", avatar: "SM" },
  { name: "Raj Kapoor", role: "Restaurant Owner", text: "My menu is now online and Google loves it. Bookings went up 40%.", avatar: "RK" },
  { name: "Emma Liu", role: "Product Manager", text: "Finally a tool that doesn't make me feel like a developer just to have a website.", avatar: "EL" },
];

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── Navigation ── */}
      <nav className="surface-blur sticky top-0 z-50 border-b" style={{ borderColor: "var(--border-light)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--brand)", boxShadow: "var(--shadow-brand)" }}>
              <span className="text-white text-sm font-black">P</span>
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ color: "var(--text-primary)" }}>Presence</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {["Templates", "Features", "Pricing"].map((item) => (
              <a key={item} href="#" className="btn btn-ghost" style={{ fontSize: "14px" }}>{item}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-ghost" style={{ fontSize: "14px" }}>Sign in</Link>
            <Link href="/register" className="btn btn-primary">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ paddingTop: "100px", paddingBottom: "80px" }}>
        {/* Background orbs */}
        <div className="orb orb-brand w-96 h-96" style={{ top: "-80px", right: "5%", opacity: 0.35 }} />
        <div className="orb orb-violet w-72 h-72" style={{ bottom: "0", left: "10%", opacity: 0.25 }} />
        <div className="orb orb-warm w-64 h-64" style={{ top: "30%", left: "60%", opacity: 0.2 }} />

        <div className="max-w-6xl mx-auto px-6 relative">
          {/* Pill badge */}
          <div className="flex justify-center mb-8 animate-fade-up">
            <div className="badge badge-brand gap-2 px-4 py-2 text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered · Live in 60 seconds
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto animate-fade-up stagger-1">
            <h1 style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "1rem" }}>
              Create your{" "}
              <TickerWord />
              <br />in 60 seconds flat
            </h1>
          </div>

          {/* Subheadline */}
          <p className="text-center animate-fade-up stagger-2" style={{ fontSize: "1.2rem", color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: 1.65 }}>
            Describe what you need. Watch the AI build it. Edit with one tap. Go live instantly — no coding, no design degree required.
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up stagger-3">
            <Link href="/register" className="btn btn-primary btn-lg" style={{ paddingLeft: "32px", paddingRight: "32px" }}>
              <Sparkles className="w-4 h-4" /> Start building free
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              Browse templates <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-6 mt-8 animate-fade-up stagger-4">
            {[
              { icon: <Check className="w-3.5 h-3.5 text-emerald-500" />, text: "No credit card" },
              { icon: <Check className="w-3.5 h-3.5 text-emerald-500" />, text: "Free forever plan" },
              { icon: <Check className="w-3.5 h-3.5 text-emerald-500" />, text: "Publish instantly" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5" style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                {icon} {text}
              </div>
            ))}
          </div>

          {/* Hero preview card */}
          <div className="mt-16 animate-fade-up stagger-5 relative max-w-3xl mx-auto">
            <div className="card" style={{ padding: "6px", borderRadius: "24px", boxShadow: "var(--shadow-xl)" }}>
              {/* Browser chrome */}
              <div style={{ background: "var(--surface-2)", borderRadius: "20px 20px 0 0", padding: "12px 16px" }} className="flex items-center gap-2">
                {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => <div key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
                <div className="flex-1 ml-2" style={{ background: "var(--border-light)", borderRadius: "99px", padding: "5px 12px" }}>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>presence.app/alex-rivera</div>
                </div>
              </div>
              {/* Site preview */}
              <div style={{ background: "#0B0F19", borderRadius: "0 0 20px 20px", padding: "40px 32px", minHeight: "280px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #6366F1, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "20px", boxShadow: "0 8px 32px rgba(99,102,241,0.4)" }}>
                  AR
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.6rem", letterSpacing: "-0.02em" }}>Alex Rivera</div>
                  <div style={{ color: "#9B87F5", fontWeight: 600, fontSize: "0.9rem", marginTop: "4px" }}>Senior AI Engineer & Open Source Creator</div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  {[
                    { label: "Email", icon: Mail },
                    { label: "LinkedIn", icon: Briefcase },
                    { label: "GitHub", icon: Link2 },
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} style={{ padding: "7px 14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Icon className="w-3.5 h-3.5 text-indigo-400" />
                        {s.label}
                      </div>
                    );
                  })}
                </div>
                <div className="animate-float" style={{ position: "absolute", bottom: "24px", right: "24px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "999px", padding: "5px 12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#10B981", fontWeight: 700 }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} /> Published · Live now
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Templates row ── */}
      <section style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: "12px" }}>11 site categories, endless styles</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>Every template starts smart — AI fills in content tailored to you.</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            {TEMPLATES.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.label} className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${t.accent}15`, color: t.accent }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{t.label}</span>
                  <ChevronRight style={{ width: "14px", height: "14px", color: "var(--text-tertiary)" }} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ paddingTop: "80px", paddingBottom: "80px", background: "var(--surface)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="badge badge-brand mx-auto mb-4">Why Presence</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, maxWidth: "520px", margin: "0 auto" }}>
              Everything you need. Nothing you don't.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="card" style={{ padding: "28px" }}>
                <div className={`${f.color} ${f.iconColor} w-10 h-10 rounded-xl flex items-center justify-center mb-5`}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "10px" }}>{f.title}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section style={{ paddingTop: "80px", paddingBottom: "80px" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
            </div>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, marginBottom: "8px" }}>Loved by creators worldwide</h2>
            <p style={{ color: "var(--text-secondary)" }}>From freelancers to restaurant owners to startup founders.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {SOCIAL_PROOF.map((s, i) => (
              <div key={i} className="card" style={{ padding: "28px" }}>
                <p style={{ color: "var(--text-primary)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "20px", fontStyle: "italic" }}>"{s.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--brand)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "13px", flexShrink: 0 }}>{s.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px" }}>{s.name}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{s.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ paddingTop: "80px", paddingBottom: "100px" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="card" style={{ padding: "64px 48px", background: "var(--surface)", position: "relative", overflow: "hidden" }}>
            <div className="orb orb-brand w-64 h-64" style={{ top: "-40px", right: "-40px", opacity: 0.3 }} />
            <div className="orb orb-violet w-48 h-48" style={{ bottom: "-40px", left: "-40px", opacity: 0.2 }} />
            <div className="relative">
              <div className="badge badge-brand mx-auto mb-5">Start free today</div>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, marginBottom: "16px", letterSpacing: "-0.02em" }}>
                Your digital presence<br />starts right here
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem", marginBottom: "32px", lineHeight: 1.65 }}>
                Join thousands of creators building beautiful sites with Presence. No credit card, no complexity — just results.
              </p>
              <Link href="/register" className="btn btn-primary btn-lg" style={{ paddingLeft: "40px", paddingRight: "40px" }}>
                <Sparkles className="w-4 h-4" /> Create my presence
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid var(--border-light)", padding: "28px 24px" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "var(--brand)" }}>
              <span className="text-white text-xs font-black">P</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>Presence</span>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>© 2026 Presence. Your ideas, beautifully live.</p>
          <div className="flex gap-4">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" style={{ fontSize: "13px", color: "var(--text-tertiary)", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
