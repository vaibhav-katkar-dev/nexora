"use client";

import { SiteConfigJSON, Section } from "@ai-platform/shared";
import { CSSProperties, useState, useEffect } from "react";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
  Globe,
  Star,
  Clock,
  Briefcase,
  GraduationCap,
  Shield,
  Rocket,
  User,
  Heart,
  Code2,
  Calendar,
  Github,
  Instagram,
  Youtube,
  Twitch,
  Linkedin,
  Facebook,
  Twitter,
} from "lucide-react";

// Icon mapping helper
const ICON_MAP: Record<string, any> = {
  Sparkles,
  Zap,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronDown,
  Globe,
  Star,
  Clock,
  Briefcase,
  GraduationCap,
  Shield,
  Rocket,
  User,
  Heart,
  Code2,
  Calendar,
  Github,
  Instagram,
  Youtube,
  Twitch,
  Linkedin,
  Facebook,
  Twitter,
};

// Element selection helper: returns data-* attributes for a given element key
function elementSel(key: string, selectedElementKey?: string | null) {
  return {
    "data-element-key": key,
    "data-selected": selectedElementKey === key ? "true" : "false",
  };
}

// ─── Theme Style Builder ───────────────────────────────────────────────────
function buildCssVariables(theme: SiteConfigJSON["theme"]): CSSProperties {
  const isDark = theme.mode === "dark" || theme.mode === "glassmorphism";

  return {
    "--primary": theme.primaryColor || "#3B82F6",
    "--secondary": theme.secondaryColor || "#8B5CF6",
    "--accent": theme.accentColor || "#F59E0B",
    "--bg": theme.backgroundColor || (isDark ? "#090D16" : "#F8FAFC"),
    "--text": theme.textColor || (isDark ? "#F8FAFC" : "#0F172A"),
    "--font-heading": `'${theme.headingFont || "Inter"}', sans-serif`,
    "--font-body": `'${theme.bodyFont || "Inter"}', sans-serif`,
    "--radius": theme.borderRadius || "12px",
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    minHeight: "100vh",
  } as CSSProperties;
}

// ─── Section Renderers ───────────────────────────────────────────────────────

interface SectionRendererProps {
  section: Section;
  theme: SiteConfigJSON["theme"];
  selectedElementKey?: string | null;
  interactive?: boolean;
}

function NavbarSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const content = section.content || {};
  const links: any[] = content.links || [];

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-md px-6 py-4 border-b flex items-center justify-between"
      style={{
        backgroundColor: "rgba(11, 15, 25, 0.75)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
<div className="flex items-center gap-3">
        <span {...elementSel("title", selectedElementKey)} className="font-extrabold text-xl tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title || "Brand"}
        </span>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm font-medium opacity-80">
        {links.map((l: any, i: number) => (
          <a
            key={i}
            {...elementSel(`content.links.${i}.label`, selectedElementKey)}
            href={l.url || "#"}
            className="hover:opacity-100 hover:text-indigo-400 transition-colors"
          >
            {l.label}
          </a>
        ))}
      </div>
      {content.ctaText && (
        <a
          {...elementSel("content.ctaText", selectedElementKey)}
          href={content.ctaLink || "#"}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
          style={{ background: theme.primaryColor }}
        >
          {content.ctaText}
        </a>
      )}
    </nav>
  );
}

function HeroSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const content = section.content || {};
  const stats: any[] = content.stats || [];

  return (
    <section
      id={section.id}
      className="relative px-6 py-20 lg:py-32 max-w-7xl mx-auto flex flex-col items-center text-center justify-center min-h-[75vh]"
    >
      {/* Background Subtle Glow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 blur-3xl -z-10"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${theme.primaryColor}, transparent 70%)`,
        }}
      />

      {section.badge && (
        <div
          {...elementSel("badge", selectedElementKey)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 border shadow-sm"
          style={{
            borderColor: `${theme.primaryColor}40`,
            background: `${theme.primaryColor}15`,
            color: theme.primaryColor,
          }}
        >
          {section.badge}
        </div>
      )}

      <h1
        {...elementSel("title", selectedElementKey)}
        className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-none mb-6"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {section.title}
      </h1>

      {section.subtitle && (
        <p {...elementSel("subtitle", selectedElementKey)} className="text-lg sm:text-xl opacity-85 max-w-2xl font-normal leading-relaxed mb-10">
          {section.subtitle}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
        {content.ctaText && (
          <a
            {...elementSel("content.ctaText", selectedElementKey)}
            href={content.ctaLink || "#"}
            className="px-8 py-3.5 rounded-xl font-bold text-white shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
              borderRadius: "var(--radius)",
            }}
          >
            {content.ctaText}
          </a>
        )}
        {content.secondaryCtaText && (
          <a
            {...elementSel("content.secondaryCtaText", selectedElementKey)}
            href={content.secondaryCtaLink || "#"}
            className="px-8 py-3.5 rounded-xl font-semibold border backdrop-blur-sm transition-all hover:bg-white/5"
            style={{
              borderColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "var(--radius)",
            }}
          >
            {content.secondaryCtaText}
          </a>
        )}
      </div>

      {stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-8 border-t border-white/10 w-full max-w-3xl">
          {stats.map((st: any, i: number) => (
            <div key={i} {...elementSel(`content.stats.${i}.value`, selectedElementKey)} className="text-center">
              <div className="text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                {st.value}
              </div>
              <div className="text-xs uppercase tracking-wider opacity-60 mt-1">{st.label}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function AboutSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const content = section.content || {};
  const skills: string[] = content.skills || [];
  const highlights: string[] = content.highlights || [];

  return (
    <section id={section.id} className="py-20 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12 items-start">
<div className="flex-1 space-y-6">
          <div className="inline-block text-xs font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
            About
          </div>
          <h2 {...elementSel("title", selectedElementKey)} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
          {content.bio && <p {...elementSel("content.bio", selectedElementKey)} className="text-base opacity-80 leading-relaxed">{content.bio}</p>}

          {highlights.length > 0 && (
            <div className="space-y-3 pt-2">
              {highlights.map((h: string, i: number) => (
                <div key={i} {...elementSel(`content.highlights.${i}`, selectedElementKey)} className="flex items-start gap-3 text-sm opacity-90">
                  <CheckCircle2 size={18} style={{ color: theme.primaryColor }} className="mt-0.5 flex-shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {skills.length > 0 && (
          <div
            {...elementSel("content.skills", selectedElementKey)}
            className="w-full md:w-80 p-6 rounded-2xl border backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius)",
            }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill: string) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                  style={{
                    backgroundColor: `${theme.primaryColor}15`,
                    borderColor: `${theme.primaryColor}40`,
                    color: theme.primaryColor,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturesSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];

  return (
    <section id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...elementSel("title", selectedElementKey)} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...elementSel("subtitle", selectedElementKey)} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item: any, i: number) => {
          const IconComponent = ICON_MAP[item.icon] || Sparkles;
          return (
            <div
              key={i}
              {...elementSel(`content.items.${i}`, selectedElementKey)}
              className="p-8 rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--radius)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-md"
                style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
              >
                <IconComponent size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                {item.title}
              </h3>
              <p className="opacity-75 text-sm leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PortfolioSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const projects: any[] = section.content?.projects || [];

  return (
<section id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="mb-14 space-y-2">
        <h2 {...elementSel("title", selectedElementKey)} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...elementSel("subtitle", selectedElementKey)} className="opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((p: any, i: number) => (
          <div
            key={i}
            {...elementSel(`content.projects.${i}`, selectedElementKey)}
            className="group overflow-hidden rounded-2xl border backdrop-blur-sm flex flex-col justify-between transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius)",
            }}
          >
            {p.image && (
              <div className="h-48 overflow-hidden relative">
                <img
                  {...elementSel(`content.projects.${i}.image`, selectedElementKey)}
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                {p.tag && (
                  <span
                    className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-3"
                    style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
                  >
                    {p.tag}
                  </span>
                )}
                <h3 {...elementSel(`content.projects.${i}.name`, selectedElementKey)} className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">
                  {p.name}
                </h3>
                <p className="opacity-70 text-sm leading-relaxed mb-6">{p.desc}</p>
              </div>
              {p.url && (
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold hover:underline"
                  style={{ color: theme.primaryColor }}
                >
                  View Live Project <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MenuSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const categories: any[] = section.content?.categories || [];

  return (
    <section id={section.id} className="py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h2 {...elementSel("title", selectedElementKey)} className="text-3xl sm:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...elementSel("subtitle", selectedElementKey)} className="opacity-75">{section.subtitle}</p>}
      </div>

      <div className="space-y-12">
        {categories.map((cat: any, ci: number) => (
          <div key={ci}>
            <h3
              {...elementSel(`content.categories.${ci}.name`, selectedElementKey)}
              className="text-2xl font-bold mb-6 pb-3 border-b border-white/10"
              style={{ color: theme.primaryColor, fontFamily: "var(--font-heading)" }}
            >
              {cat.name}
            </h3>
            <div className="space-y-6">
              {(cat.items || []).map((item: any, ii: number) => (
                <div key={ii} {...elementSel(`content.categories.${ci}.items.${ii}`, selectedElementKey)} className="flex justify-between items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-lg">{item.name}</span>
                      {item.badge && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.desc && <p className="text-sm opacity-65 mt-1">{item.desc}</p>}
                  </div>
                  <span className="font-extrabold text-lg tracking-tight" style={{ color: theme.primaryColor }}>
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TimelineSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];

  return (
    <section id={section.id} className="py-20 px-6 max-w-4xl mx-auto">
      <div className="mb-14 text-center">
        <h2 {...elementSel("title", selectedElementKey)} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...elementSel("subtitle", selectedElementKey)} className="opacity-75 mt-2">{section.subtitle}</p>}
      </div>

      <div className="relative border-l-2 border-white/10 ml-4 pl-8 space-y-12">
        {items.map((item: any, i: number) => (
          <div key={i} {...elementSel(`content.items.${i}`, selectedElementKey)} className="relative group">
            <div
              className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full border-2 border-slate-900 shadow-md transition-all group-hover:scale-125"
              style={{ background: theme.primaryColor }}
            />
            <div className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">{item.period}</div>
            <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
              {item.role || item.title}
            </h3>
            <div className="text-sm font-semibold opacity-80 mb-2" style={{ color: theme.primaryColor }}>
              {item.company || item.institution}
            </div>
            {item.desc && <p className="text-sm opacity-70 leading-relaxed">{item.desc}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const plans: any[] = section.content?.plans || [];

  return (
<section id={section.id} className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <h2 {...elementSel("title", selectedElementKey)} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...elementSel("subtitle", selectedElementKey)} className="opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((p: any, i: number) => (
          <div
            key={i}
            {...elementSel(`content.plans.${i}`, selectedElementKey)}
            className={`p-8 rounded-3xl border relative flex flex-col justify-between transition-all ${
              p.isPopular ? "border-2 shadow-2xl scale-105" : "backdrop-blur-sm"
            }`}
            style={{
              backgroundColor: p.isPopular ? `${theme.primaryColor}10` : "rgba(255, 255, 255, 0.03)",
              borderColor: p.isPopular ? theme.primaryColor : "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius)",
            }}
          >
            {p.badge && (
              <span
                className="absolute -top-3.5 right-6 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-white shadow-md"
                style={{ background: theme.primaryColor }}
              >
                {p.badge}
              </span>
            )}
            <div>
              <h3 {...elementSel(`content.plans.${i}.name`, selectedElementKey)} className="text-2xl font-bold mb-2">{p.name}</h3>
              <p className="text-xs opacity-65 mb-6">{p.desc}</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span {...elementSel(`content.plans.${i}.price`, selectedElementKey)} className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  {p.price}
                </span>
                <span className="text-xs opacity-60">/ month</span>
              </div>
              <div className="space-y-3 mb-8">
                {(p.features || []).map((f: string, fi: number) => (
                  <div key={fi} className="flex items-center gap-3 text-sm opacity-85">
                    <CheckCircle2 size={16} style={{ color: theme.primaryColor }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all hover:opacity-90"
              style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id={section.id} className="py-20 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-14">
        <h2 {...elementSel("title", selectedElementKey)} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
      </div>

      <div className="space-y-4">
        {items.map((item: any, i: number) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              {...elementSel(`content.items.${i}`, selectedElementKey)}
              className="border rounded-2xl overflow-hidden backdrop-blur-sm transition-all"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderColor: "rgba(255, 255, 255, 0.08)",
              }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                className="w-full p-6 text-left font-bold flex justify-between items-center gap-4 text-lg"
              >
                <span>{item.question}</span>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && <div className="px-6 pb-6 text-sm opacity-75 leading-relaxed border-t border-white/5 pt-4">{item.answer}</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DigitalCardSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const socials = section.content?.socials || {};
  const customLinks = section.content?.customLinks || [];
  const avatar = section.content?.avatar || "";
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);

  const handleLinkClick = (i: number, url: string, e: React.MouseEvent) => {
    if (!url || url === "#") { e.preventDefault(); return; }
    setClickedIdx(i);
    setTimeout(() => setClickedIdx(null), 1500);
  };

  return (
    <section id={section.id} className="min-h-screen flex items-center justify-center p-6">
      <div
        className="max-w-md w-full text-center p-8 rounded-3xl border shadow-2xl backdrop-blur-md"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: "var(--radius)",
        }}
      >
        {avatar ? (
          <img
            {...elementSel("content.avatar", selectedElementKey)}
            src={avatar}
            alt={section.title || "Avatar"}
            className="w-28 h-28 rounded-full border-4 object-cover mx-auto mb-6 shadow-xl"
            style={{ borderColor: theme.primaryColor }}
          />
        ) : (
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white mx-auto mb-6 shadow-xl"
            style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})` }}
          >
            {(section.title || "?")[0].toUpperCase()}
          </div>
        )}

        <h1 {...elementSel("title", selectedElementKey)} className="text-2xl font-extrabold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h1>
        {section.subtitle && <p {...elementSel("subtitle", selectedElementKey)} className="text-sm font-semibold mb-4" style={{ color: theme.primaryColor }}>{section.subtitle}</p>}
        {section.content?.bio && <p {...elementSel("content.bio", selectedElementKey)} className="text-sm opacity-80 leading-relaxed mb-6">{section.content.bio}</p>}

        {section.content?.location && (
          <div {...elementSel("content.location", selectedElementKey)} className="inline-flex items-center gap-1.5 text-xs opacity-60 mb-6 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <MapPin size={12} /> {section.content.location}
          </div>
        )}

        {/* Primary CTA Button */}
        {section.content?.ctaText && (
          <div className="mb-8">
            <a
              {...elementSel("content.ctaText", selectedElementKey)}
              href={section.content?.ctaLink || "#"}
              className="inline-block w-full py-3.5 rounded-xl font-bold text-white shadow-xl transition-all transform hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`,
                borderRadius: "var(--radius)",
              }}
            >
              {section.content.ctaText}
            </a>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {socials.email && (
            <a {...elementSel("content.socials.email", selectedElementKey)} href={`mailto:${socials.email}`} className="px-4 py-2 rounded-full text-xs font-semibold border bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <Mail size={14} /> Email
            </a>
          )}
          {socials.phone && (
            <a {...elementSel("content.socials.phone", selectedElementKey)} href={`tel:${socials.phone}`} className="px-4 py-2 rounded-full text-xs font-semibold border bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <Phone size={14} /> Call
            </a>
          )}
          {socials.linkedin && (
            <a {...elementSel("content.socials.linkedin", selectedElementKey)} href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full text-xs font-semibold border bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <Linkedin size={14} /> LinkedIn
            </a>
          )}
          {socials.twitter && (
            <a {...elementSel("content.socials.twitter", selectedElementKey)} href={socials.twitter} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full text-xs font-semibold border bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <Twitter size={14} /> Twitter
            </a>
          )}
        </div>

        {/* Custom Links List */}
        {customLinks.length > 0 && (
          <div className="space-y-3">
            {customLinks.map((link: any, i: number) => {
              const IconComponent = ICON_MAP[link.icon] || ExternalLink;
              const clicked = clickedIdx === i;
              return (
                <a
                  key={i}
                  {...elementSel(`content.customLinks.${i}`, selectedElementKey)}
                  href={link.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleLinkClick(i, link.url, e)}
                  className={`flex items-center justify-between py-3.5 px-5 rounded-2xl border font-bold transition-all shadow-md group ${
                    clicked
                      ? "bg-emerald-500/20 border-emerald-500/50 scale-[0.98]"
                      : "bg-white/5 hover:bg-white/10 border-white/10 hover:scale-[1.02]"
                  }`}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <div className="flex items-center gap-3">
                    {clicked
                      ? <CheckCircle2 size={18} className="text-emerald-400" />
                      : <IconComponent size={18} className="opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: theme.primaryColor }} />
                    }
                    <span className={`text-sm transition-colors ${clicked ? "text-emerald-300" : ""}`}>{link.label}</span>
                  </div>
                  {link.badge && !clicked && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}>
                      {link.badge}
                    </span>
                  )}
                  {clicked && <span className="text-[10px] font-bold text-emerald-400">✓ Opened</span>}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function LinksSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const links: any[] = section.content?.links || [];
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);

  const handleClick = (i: number, url: string, e: React.MouseEvent) => {
    if (!url || url === "#") { e.preventDefault(); return; }
    setClickedIdx(i);
    setTimeout(() => setClickedIdx(null), 1500);
  };

  return (
    <section id={section.id} className="py-20 px-6 max-w-lg mx-auto text-center">
      {section.title && (
        <h2 {...elementSel("title", selectedElementKey)} className="text-3xl font-extrabold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
      )}
      {section.subtitle && <p {...elementSel("subtitle", selectedElementKey)} className="text-sm opacity-80 mb-10">{section.subtitle}</p>}

      <div className="space-y-4">
        {links.map((link: any, i: number) => {
          const IconComponent = ICON_MAP[link.icon] || Globe;
          const clicked = clickedIdx === i;
          return (
            <a
              key={i}
              {...elementSel(`content.links.${i}`, selectedElementKey)}
              href={link.url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleClick(i, link.url, e)}
              className={`flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border font-bold text-center transition-all shadow-md backdrop-blur-sm relative group ${
                clicked
                  ? "bg-emerald-500/20 border-emerald-500/60 scale-95"
                  : "hover:-translate-y-1 hover:shadow-xl"
              }`}
              style={{
                backgroundColor: clicked ? undefined : "rgba(255, 255, 255, 0.05)",
                borderColor: clicked ? undefined : "rgba(255, 255, 255, 0.12)",
                borderRadius: "var(--radius)",
              }}
            >
              {link.badge && !clicked && (
                <span className="absolute top-0 right-4 -translate-y-1/2 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500 text-amber-950 shadow-sm border border-amber-400">
                  {link.badge}
                </span>
              )}
              {clicked
                ? <CheckCircle2 size={22} className="text-emerald-400 animate-bounce" />
                : link.icon && <IconComponent size={20} className="opacity-70 group-hover:opacity-100 transition-opacity" style={{ color: theme.primaryColor }} />
              }
              <span className={`text-lg transition-colors ${clicked ? "text-emerald-300" : ""}`}>
                {clicked ? "Opened ✓" : link.label}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function ContactSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const c = section.content || {};

  return (
    <section id={section.id} className="py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-14 space-y-2">
        <h2 {...elementSel("title", selectedElementKey)} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...elementSel("subtitle", selectedElementKey)} className="opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          {c.email && (
            <div {...elementSel("content.email", selectedElementKey)} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                <Mail size={18} style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <div className="text-xs opacity-60">Email</div>
                <a href={`mailto:${c.email}`} className="font-semibold hover:underline">
                  {c.email}
                </a>
              </div>
            </div>
          )}
          {c.phone && (
            <div {...elementSel("content.phone", selectedElementKey)} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                <Phone size={18} style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <div className="text-xs opacity-60">Phone</div>
                <div className="font-semibold">{c.phone}</div>
              </div>
            </div>
          )}
          {c.address && (
            <div {...elementSel("content.address", selectedElementKey)} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10">
                <MapPin size={18} style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <div className="text-xs opacity-60">Address</div>
                <div className="font-semibold">{c.address}</div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4 p-6 rounded-2xl border bg-white/5 backdrop-blur-sm">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
          />
          <textarea
            rows={4}
            placeholder="Your Message..."
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 resize-none"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all"
            style={{ background: theme.primaryColor }}
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

function FooterSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  return (
    <footer className="py-12 px-6 border-t border-white/10 text-center text-xs opacity-60">
      <p>© {new Date().getFullYear()} {section.title || "Nexora AI"}. All rights reserved.</p>
    </footer>
  );
}

// ─── Section Dispatcher ────────────────────────────────────────────────────
interface RenderSectionProps {
  section: Section;
  theme: SiteConfigJSON["theme"];
  selectedElementKey?: string | null;
  interactive?: boolean;
}

function RenderSection({ section, theme, selectedElementKey, interactive }: RenderSectionProps) {
  if (section.visible === false) return null;

  const rendererProps = {
    section,
    theme,
    selectedElementKey,
    interactive: !!interactive,
  };

  switch (section.type) {
    case "navbar":
      return <NavbarSection {...rendererProps} />;
    case "hero":
      return <HeroSection {...rendererProps} />;
    case "about":
      return <AboutSection {...rendererProps} />;
    case "features":
      return <FeaturesSection {...rendererProps} />;
    case "portfolio_grid":
      return <PortfolioSection {...rendererProps} />;
    case "menu_list":
      return <MenuSection {...rendererProps} />;
    case "timeline":
      return <TimelineSection {...rendererProps} />;
    case "pricing":
      return <PricingSection {...rendererProps} />;
    case "faq":
      return <FAQSection {...rendererProps} />;
    case "links":
      return <LinksSection {...rendererProps} />;
    case "digital_card":
      return <DigitalCardSection {...rendererProps} />;
    case "contact":
      return <ContactSection {...rendererProps} />;
    case "custom_html":
      return (
        <section id={section.id} className="custom-html-section py-8 px-6">
          {section.content?.html ? (
            <div dangerouslySetInnerHTML={{ __html: section.content.html }} />
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-700 rounded-xl">
              [Custom HTML Section: {section.title || "Empty"}]
            </div>
          )}
        </section>
      );
    case "footer":
      return <FooterSection {...rendererProps} />;
    default:
      return (
        <section id={section.id} className="py-16 px-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold">{section.title}</h2>
          {section.subtitle && <p className="opacity-70">{section.subtitle}</p>}
        </section>
      );
  }
}

// ─── Main Renderer ─────────────────────────────────────────────────────────
interface SiteRendererProps {
  config: SiteConfigJSON;
  customCode?: { html?: string; css?: string; js?: string };
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  selectedElementKey?: string | null;
  onSelectElement?: (elementKey: string, sectionId: string) => void;
  interactive?: boolean;
}

export function SiteRenderer({
  config,
  customCode,
  selectedSectionId,
  onSelectSection,
  selectedElementKey,
  onSelectElement,
  interactive = false,
}: SiteRendererProps) {
  useEffect(() => {
    // Dynamic Google Fonts Loader
    const headingFont = config?.theme?.headingFont || "Inter";
    const bodyFont = config?.theme?.bodyFont || "Inter";
    const fontsToLoad = Array.from(new Set([headingFont, bodyFont])).filter(Boolean);

    fontsToLoad.forEach((font) => {
      const linkId = `google-font-${font.replace(/\s+/g, "-")}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@300;400;500;600;700;800&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [config?.theme?.headingFont, config?.theme?.bodyFont]);

  // ─── Custom JS & Inline Script Executor ─────────────────────────────────
  // Executes customCode.js + any embedded <script> tags from full HTML documents
  useEffect(() => {
    // Extract any inline <script> tags inside customCode.html
    const inlineScripts: string[] = [];
    if (customCode?.html) {
      const regex = /<script(?![^>]*\bsrc=)[\s\S]*?>([\s\S]*?)<\/script>/gi;
      let m;
      while ((m = regex.exec(customCode.html)) !== null) {
        if (m[1]?.trim()) inlineScripts.push(m[1].trim());
      }
    }

    const combinedJs = [customCode?.js || "", ...inlineScripts].filter(Boolean).join("\n;\n");
    if (!combinedJs.trim()) return;

    const timer = setTimeout(() => {
      try {
        const prev = document.querySelector("script[data-nexora-custom]");
        if (prev) prev.remove();
        const script = document.createElement("script");
        script.setAttribute("data-nexora-custom", "true");
        script.textContent = `(function(){\ntry{\n${combinedJs}\n}catch(e){console.warn("[Nexora Custom JS]:", e.message);}\n})();`;
        document.body.appendChild(script);
      } catch (e) {
        console.warn("[Nexora Custom JS inject error]:", e);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [customCode?.js, customCode?.html]);

  if (!config) return null;

  return (
    <div style={buildCssVariables(config.theme)}>
      {customCode?.css && <style dangerouslySetInnerHTML={{ __html: customCode.css }} />}

      {config.sections.map((section) => {
        if (section.visible === false) return null;
        const isSelected = selectedSectionId === section.id;

        return (
          <div
            key={section.id}
            id={section.id}
            data-section-id={section.id}
            onClick={(e) => {
              if (!interactive) return;
              e.stopPropagation();

              // 1) Element-level selection: if the click landed on a tagged element
              if (onSelectElement) {
                const target = (e.target as HTMLElement)?.closest?.("[data-element-key]");
                if (target) {
                  const elKey = target.getAttribute("data-element-key");
                  if (elKey) {
                    onSelectElement(elKey, section.id);
                    return;
                  }
                }
              }

              // 2) Fallback: section-level selection
              if (onSelectSection) onSelectSection(section.id);
            }}
            className={`relative transition-all duration-150 ${
              interactive ? "cursor-pointer group" : ""
            } ${
              interactive && isSelected
                ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 z-20 shadow-xl shadow-indigo-500/10"
                : interactive
                ? "hover:ring-2 hover:ring-indigo-400/40"
                : ""
            }`}
          >
            {interactive && isSelected && (
              <div className="absolute top-3 right-6 z-30 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/90 text-white text-[10px] font-bold shadow-md tracking-wider uppercase backdrop-blur-sm pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Editing: {section.type.replace("_", " ")}</span>
              </div>
            )}
            <RenderSection
              section={section}
              theme={config.theme}
              selectedElementKey={selectedElementKey}
              interactive={interactive}
            />
          </div>
        );
      })}

      {customCode?.html && <div dangerouslySetInnerHTML={{ __html: customCode.html }} />}
    </div>
  );
}
