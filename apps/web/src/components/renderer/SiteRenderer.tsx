"use client";

import {
  SiteConfigJSON,
  Section,
  sanitizeTemplateCss,
  resolveTemplateContainerClass,
} from "@ai-platform/shared";
import { CSSProperties, useState, useEffect, useMemo, type MouseEvent } from "react";
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
  GripVertical,
  ChevronUp,
  Copy,
  Trash2,
  Camera,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";

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

// Safe icon lookup helper
function getIconComponent(name: any, fallback: any = Sparkles) {
  if (typeof name === "string" && ICON_MAP[name]) {
    return ICON_MAP[name];
  }
  return fallback;
}

function isEditableLeafText(key: string): boolean {
  const normKey = key.replace(/^content\./, "");
  if (new Set(["title", "subtitle", "badge", "address", "phone", "availability"]).has(normKey)) {
    return true;
  }
  const leafProperties = new Set([
    "label",
    "title",
    "desc",
    "quote",
    "author",
    "role",
    "name",
    "price",
    "question",
    "answer",
    "bio",
    "email",
    "phone",
    "address",
    "ctaText",
    "secondaryCtaText",
    "location",
    "buttonText",
    "value",
    "tag",
  ]);
  const lastPart = normKey.split(".").pop();
  return lastPart ? leafProperties.has(lastPart) : false;
}

/** Compute current caret character offset inside an element */
function getCaretOffset(element: HTMLElement): number {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return 0;
    const range = selection.getRangeAt(0);
    if (!element.contains(range.startContainer)) return 0;
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  } catch {
    return 0;
  }
}

/** Set caret character offset inside an element, falling back to end of contents */
function setCaretOffset(element: HTMLElement, offset: number) {
  try {
    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    let currentOffset = 0;
    let found = false;

    function walk(node: Node) {
      if (found) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const len = node.textContent?.length || 0;
        if (currentOffset + len >= offset) {
          const nodeOffset = Math.min(Math.max(0, offset - currentOffset), len);
          range.setStart(node, nodeOffset);
          range.setEnd(node, nodeOffset);
          found = true;
        } else {
          currentOffset += len;
        }
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          walk(node.childNodes[i]);
          if (found) break;
        }
      }
    }

    walk(element);

    if (!found) {
      range.selectNodeContents(element);
      range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  } catch {
    // Ignore selection range errors gracefully
  }
}

// Element selection & direct contentEditable editing helper: returns data-* & editing handlers for a given element key
function elementSel(
  key: string,
  selectedElementKey?: string | null,
  sectionId?: string,
  interactive?: boolean
) {
  const isSelected = selectedElementKey === key;
  const canBeEditable = interactive && sectionId && isEditableLeafText(key);

  if (!canBeEditable) {
    return {
      "data-element-key": key,
      "data-selected": isSelected && interactive ? "true" : "false",
    };
  }

  const isMultiline = /subtitle|desc|bio|answer|detail|content|paragraph/i.test(key);

  return {
    "data-element-key": key,
    "data-selected": isSelected ? "true" : "false",
    "data-placeholder": "[Type text here...]",
    contentEditable: true,
    suppressContentEditableWarning: true,
    onFocus: (e: React.FocusEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const caretPos = getCaretOffset(el);
      useEditorStore.getState().pushHistorySnapshot();
      useEditorStore.getState().selectElement(sectionId!, key);

      // Preserve cursor position after React re-renders selection outline
      requestAnimationFrame(() => {
        if (document.activeElement === el) {
          setCaretOffset(el, caretPos);
        }
      });
    },
    onInput: (e: React.FormEvent<HTMLElement>) => {
      const el = e.currentTarget;
      const caretPos = getCaretOffset(el);
      const text = el.innerText || el.textContent || "";
      useEditorStore.getState().updateElementValue(sectionId!, key, text, false);

      // Restore caret position right after text character insertion so forward typing works naturally
      requestAnimationFrame(() => {
        if (document.activeElement === el) {
          setCaretOffset(el, caretPos);
        }
      });
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const text = e.currentTarget.innerText || e.currentTarget.textContent || "";
      useEditorStore.getState().updateElementValue(sectionId!, key, text, true);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isMultiline) {
        e.preventDefault();
        e.currentTarget.blur();
      }
    },
  };
}

function getElementStyle(section: Section, elementKey: string): CSSProperties {
  const normalizedKey = elementKey.replace(/^content\./, "");
  const styleMap = (section.elementStyles || {}) as Record<string, Record<string, string>>;
  const styles = styleMap[normalizedKey] || styleMap[elementKey] || {};
  const elementColors = (section.elementColors || {}) as Record<string, string>;
  const customColor = elementColors[normalizedKey] || elementColors[elementKey];

  const style: CSSProperties = {};

  if (customColor) style.color = customColor;
  else if (styles.color) style.color = styles.color;
  if (styles.fontSize) style.fontSize = styles.fontSize;
  if (styles.fontWeight) style.fontWeight = styles.fontWeight as CSSProperties["fontWeight"];
  if (styles.textAlign) style.textAlign = styles.textAlign as CSSProperties["textAlign"];
  if (styles.backgroundColor) style.backgroundColor = styles.backgroundColor;
  if (styles.padding) style.padding = styles.padding;
  if (styles.paddingTop) style.paddingTop = styles.paddingTop;
  if (styles.paddingBottom) style.paddingBottom = styles.paddingBottom;
  if (styles.paddingLeft) style.paddingLeft = styles.paddingLeft;
  if (styles.paddingRight) style.paddingRight = styles.paddingRight;
  if (styles.marginTop) style.marginTop = styles.marginTop;
  if (styles.marginBottom) style.marginBottom = styles.marginBottom;
  if (styles.borderRadius) style.borderRadius = styles.borderRadius;
  if (styles.boxShadow) style.boxShadow = styles.boxShadow;
  if (styles.width) style.width = styles.width;
  if (styles.maxWidth) style.maxWidth = styles.maxWidth;
  if (styles.display) style.display = styles.display as CSSProperties["display"];
  if (styles.lineHeight) style.lineHeight = styles.lineHeight;
  if (styles.opacity) style.opacity = Number(styles.opacity);
  if (styles.textTransform) style.textTransform = styles.textTransform as CSSProperties["textTransform"];
  if (styles.letterSpacing) style.letterSpacing = styles.letterSpacing;

  return style;
}

/**
 * Builds section-scoped CSS that applies per-element custom text colors.
 * Targets both normalized keys and `content.` prefixed data-element-key attributes
 * so custom colors apply seamlessly to all nav items, text headers, buttons & stats.
 */
function buildElementColorCss(sections: Section[]): string {
  let css = "";
  for (const section of sections) {
    const colors = section.elementColors;
    if (!colors || Object.keys(colors).length === 0) continue;
    const safeSection = String(section.id).replace(/["\\]/g, "\\$&");
    for (const [key, color] of Object.entries(colors)) {
      if (!color) continue;
      const keys = Array.from(new Set([
        key,
        key.startsWith("content.") ? key : `content.${key}`,
        key.replace(/^content\./, "")
      ]));
      for (const k of keys) {
        const safeKey = String(k).replace(/["\\]/g, "\\$&");
        css += `[data-section-id="${safeSection}"] [data-element-key="${safeKey}"], #${safeSection} [data-element-key="${safeKey}"], [data-section-id="${safeSection}"][data-element-key="${safeKey}"], #${safeSection}[data-element-key="${safeKey}"] { color: ${color} !important; }\n`;
      }
    }
  }
  return css;
}

function buildElementStyleCss(sections: Section[]): string {
  let css = "";
  for (const section of sections) {
    const styles = section.elementStyles;
    if (!styles || Object.keys(styles).length === 0) continue;
    const safeSection = String(section.id).replace(/["\\]/g, "\\$&");
    for (const [key, valueMap] of Object.entries(styles)) {
      if (!valueMap || typeof valueMap !== "object") continue;
      const declarations = Object.entries(valueMap)
        .filter(([, value]) => typeof value === "string" && value.length > 0)
        .map(([property, value]) => {
          const valStr = String(value).trim();
          const cleanVal = valStr.endsWith("!important") ? valStr : `${valStr} !important`;
          return `${property}: ${cleanVal};`;
        })
        .join(" ");
      if (!declarations) continue;
      const keys = Array.from(new Set([
        key,
        key.startsWith("content.") ? key : `content.${key}`,
        key.replace(/^content\./, "")
      ]));
      for (const k of keys) {
        const safeKey = String(k).replace(/["\\]/g, "\\$&");
        css += `[data-section-id="${safeSection}"] [data-element-key="${safeKey}"], #${safeSection} [data-element-key="${safeKey}"], [data-section-id="${safeSection}"][data-element-key="${safeKey}"], #${safeSection}[data-element-key="${safeKey}"] { ${declarations} }\n`;
      }
    }
  }
  return css;
}

/**
 * Determines whether a custom_html section's markup already declares its own
 * semantic root element (section / nav / footer / header / main / article /
 * aside / div with an id or class). When it does, the raw HTML should be
 * rendered as-is so the template's own layout (full-bleed sections, sticky nav,
 * marquee, etc.) is preserved — WITHOUT an extra padded <section> wrapper that
 * would conflict with the template's CSS.
 *
 * When the HTML is just a bare fragment (no semantic root), we wrap it in a
 * plain <div> (no padding/spacing) so it still renders safely and future
 * templates that ship fragments keep working.
 */
function customHtmlHasRootElement(html: string): boolean {
  const trimmed = (html || "").trim();
  if (!trimmed) return false;
  // Match the FIRST opening tag. If it's a semantic/structural element that
  // carries its own layout, treat it as the section root.
  const firstTag = trimmed.match(/^\s*<([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/);
  if (!firstTag) return false;
  const tag = firstTag[1].toLowerCase();
  const rootTags = new Set([
    "section",
    "nav",
    "footer",
    "header",
    "main",
    "article",
    "aside",
    "div",
    "ul",
    "ol",
    "table",
    "form",
    "figure",
  ]);
  return rootTags.has(tag);
}

// ─── Theme Style Builder ───────────────────────────────────────────────────
function buildCssVariables(
  theme: SiteConfigJSON["theme"],
  interactive?: boolean
): CSSProperties {
  const isDark = theme.mode === "dark" || theme.mode === "glassmorphism";

  return {
    "--primary": theme.primaryColor || "#3B82F6",
    "--secondary": theme.secondaryColor || "#8B5CF6",
    "--accent": theme.accentColor || "#F59E0B",
    "--bg": theme.backgroundColor || (isDark ? "#090D16" : "#F8FAFC"),
    "--text": theme.textColor || (isDark ? "#F8FAFC" : "#0F172A"),
    "--surface": isDark ? "rgba(15, 23, 42, 0.85)" : "#FFFFFF",
    "--surface-hover": isDark ? "rgba(30, 41, 59, 0.9)" : "#F1F5F9",
    "--muted": isDark ? "#94A3B8" : "#64748B",
    "--border": isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
    "--font-heading": `'${theme.headingFont || "Inter"}', sans-serif`,
    "--font-body": `'${theme.bodyFont || "Inter"}', sans-serif`,
    "--radius": theme.borderRadius || "12px",
    "--shadow": theme.shadow || "md",
    backgroundColor: "var(--bg)",
    color: "var(--text)",
    fontFamily: "var(--font-body)",
    minHeight: interactive ? "100%" : "100vh",
    width: "100%",
    flex: "1 1 auto",
    display: "flex",
    flexDirection: "column",
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
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  const logoImage = content.logoImage || content.logo || (section as any).logoImage;
  const logoWidth = content.logoWidth || (section as any).logoWidth || 36;
  const logoHeight = content.logoHeight || (section as any).logoHeight || "auto";

  return (
    <nav
      id={section.id}
      data-section-id={section.id}
      className="sticky top-0 z-50 backdrop-blur-md px-6 py-4 border-b flex items-center justify-between"
      style={{
        backgroundColor: "rgba(11, 15, 25, 0.75)",
        borderColor: "rgba(255, 255, 255, 0.08)",
      }}
    >
      <div className="flex items-center gap-3">
        {logoImage && (
          <img
            {...sel("content.logoImage")}
            src={logoImage}
            alt={section.title || "Logo"}
            loading="lazy"
            decoding="async"
            className="object-contain rounded shrink-0 transition-all"
            style={{
              width: typeof logoWidth === "number" ? `${logoWidth}px` : logoWidth,
              height: typeof logoHeight === "number" ? `${logoHeight}px` : logoHeight,
              maxHeight: "56px",
              ...getElementStyle(section, "content.logoImage"),
            }}
          />
        )}
        <span
          {...sel("title")}
          className="font-extrabold text-xl tracking-tight text-white"
          style={{ fontFamily: "var(--font-heading)", ...getElementStyle(section, "title") }}
        >
          {section.title || "Brand"}
        </span>
      </div>
      <div className="hidden md:flex items-center gap-6 text-sm font-medium opacity-80">
        {links.map((l: any, i: number) => {
          const labelText = typeof l === "string" ? l : (l?.label || l?.name || `Link ${i + 1}`);
          const linkUrl = typeof l === "string" ? "#" : (l?.url || "#");
          const itemKey = `content.links.${i}.label`;
          return (
            <a
              key={i}
              {...sel(itemKey)}
              href={linkUrl}
              className="hover:opacity-100 hover:text-indigo-400 transition-colors"
              style={getElementStyle(section, itemKey)}
            >
              {labelText}
            </a>
          );
        })}
      </div>
      {content.ctaText && (
        <a
          {...sel("content.ctaText")}
          href={content.ctaLink || "#"}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
          style={{ background: theme.primaryColor, ...getElementStyle(section, "content.ctaText") }}
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
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section
      id={section.id}
      data-section-id={section.id}
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
          {...sel("badge")}
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
        {...sel("title")}
        className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-none mb-6"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {section.title}
      </h1>

      {section.subtitle && (
        <p {...sel("subtitle")} className="text-lg sm:text-xl opacity-85 max-w-2xl font-normal leading-relaxed mb-10" style={getElementStyle(section, "subtitle")}>
          {section.subtitle}
        </p>
      )}

      {content.avatarUrl && (
        <div className="w-full max-w-3xl mb-16">
          <img
            src={content.avatarUrl}
            alt={section.title || "Hero"}
            loading="lazy"
            decoding="async"
            className="w-full h-72 sm:h-96 object-cover rounded-2xl shadow-2xl"
            style={{ borderRadius: "var(--radius)" }}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
        {content.ctaText && (
          <a
            {...sel("content.ctaText")}
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
            {...sel("content.secondaryCtaText")}
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-white/10 w-full max-w-3xl">
          {stats.map((st: any, i: number) => (
            <div key={i} {...sel(`content.stats.${i}.value`)} className="text-center">
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
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="flex-1 space-y-6">
          <div className="inline-block text-xs font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
            About
          </div>
          <h2 {...sel("title")} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            {section.title}
          </h2>
          {content.bio && <p {...sel("content.bio")} className="text-base opacity-80 leading-relaxed">{content.bio}</p>}

          {highlights.length > 0 && (
            <div className="space-y-3 pt-2">
              {highlights.map((h: string, i: number) => (
                <div key={i} {...sel(`content.highlights.${i}`)} className="flex items-start gap-3 text-sm opacity-90">
                  <CheckCircle2 size={18} style={{ color: theme.primaryColor }} className="mt-0.5 flex-shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {skills.length > 0 && (
          <div
            {...sel("content.skills")}
            className="w-full md:w-80 p-6 rounded-2xl border backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius)",
            }}
          >
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">Skills &amp; Expertise</h3>
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
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item: any, i: number) => {
          const IconComponent = getIconComponent(item.icon, Sparkles);
          return (
            <div
              key={i}
              {...sel(`content.items.${i}`)}
              className="rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden flex flex-col"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--radius)",
              }}
            >
              {item.image && (
                <div className="h-44 overflow-hidden relative">
                  <img
                    {...sel(`content.items.${i}.image`)}
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )}
              <div className="p-8 flex-1 flex flex-col">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 shadow-md"
                  style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
                >
                  <IconComponent size={24} />
                </div>
                <h3 {...sel(`content.items.${i}.title`)} className="text-xl font-bold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
                  {item.title}
                </h3>
                <p {...sel(`content.items.${i}.desc`)} className="opacity-75 text-sm leading-relaxed">{item.desc}</p>
              {(item.buttonText || item.url || item.ctaLink) && (
                <a
                  href={item.url || item.ctaLink || "#"}
                  {...sel(`content.items.${i}.buttonText`)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline cursor-pointer"
                  style={{ color: theme.primaryColor }}
                >
                  {item.buttonText || "Learn More"} &rarr;
                </a>
              )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ServicesSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item: any, i: number) => {
          const IconComponent = getIconComponent(item.icon, Sparkles);
          return (
            <article
              key={i}
              {...sel(`content.items.${i}`)}
              className="rounded-2xl border backdrop-blur-sm flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--radius)",
              }}
            >
              {item.image && (
                <div className="h-52 overflow-hidden relative">
                  <img
                    {...sel(`content.items.${i}.image`)}
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md"
                  style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
                >
                  <IconComponent size={24} />
                </div>
                <h3 {...sel(`content.items.${i}.title`)} className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                  {item.title}
                </h3>
                <p {...sel(`content.items.${i}.desc`)} className="opacity-75 text-sm leading-relaxed flex-1">{item.desc}</p>
                {(item.buttonText || item.url || item.ctaLink) && (
                  <a
                    href={item.url || item.ctaLink || "#"}
                    {...sel(`content.items.${i}.buttonText`)}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline cursor-pointer"
                    style={{ color: theme.primaryColor }}
                  >
                    {item.buttonText || "Learn More"} &rarr;
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProductsSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item: any, i: number) => (
          <div
            key={i}
            {...sel(`content.items.${i}`)}
            className="rounded-2xl border backdrop-blur-sm flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", borderRadius: "var(--radius)" }}
          >
            {item.image && (
              <div className="h-52 overflow-hidden relative">
                <img
                  {...sel(`content.items.${i}.image`)}
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            )}
            {item.badge && (
              <span
                className="mx-4 mt-4 w-fit px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow"
                style={{ background: theme.primaryColor }}
              >
                {item.badge}
              </span>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <h3 {...sel(`content.items.${i}.title`)} className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                {item.title}
              </h3>
              <p {...sel(`content.items.${i}.desc`)} className="opacity-75 text-sm leading-relaxed flex-1">{item.desc}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                {item.price && (
                  <span {...sel(`content.items.${i}.price`)} className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)", color: theme.primaryColor }}>
                    {item.price}
                  </span>
                )}
                {(item.buttonText || item.url || item.ctaLink) && (
                  <a
                    href={item.url || item.ctaLink || "#"}
                    {...sel(`content.items.${i}.buttonText`)}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow transition-all hover:opacity-90 cursor-pointer"
                    style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
                  >
                    {item.buttonText || "Buy Now"}
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GallerySection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const images: any[] = section.content?.images || [];
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img: any, i: number) => (
          <figure
            key={i}
            {...sel(`content.images.${i}`)}
            className="gallery-item rounded-2xl border overflow-hidden cursor-pointer"
            style={{
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "var(--radius)",
            }}
          >
            <img
              {...sel(`content.images.${i}.url`)}
              src={img.url}
              alt={img.alt || `Gallery image ${i + 1}`}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}

function PortfolioSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const projects: any[] = section.content?.projects || [];
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="mb-14 space-y-2">
        <h2 {...sel("title")} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((p: any, i: number) => (
          <div
            key={i}
            {...sel(`content.projects.${i}`)}
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
                  {...sel(`content.projects.${i}.image`)}
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
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
                <h3 {...sel(`content.projects.${i}.name`)} className="text-xl font-bold mb-2 group-hover:text-indigo-400 transition-colors">
                  {p.name}
                </h3>
                <p {...sel(`content.projects.${i}.desc`)} className="opacity-70 text-sm leading-relaxed mb-6">{p.desc}</p>
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
  const layout = section.variant || section.content?.layout || "grid";
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        {section.badge && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2" style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}>
            {section.badge}
          </span>
        )}
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className="space-y-16">
        {categories.map((cat: any, ci: number) => {
          const catItems: any[] = cat.items || [];
          return (
            <div key={ci} className="space-y-8">
              <div className="flex items-center gap-4">
                <h3
                  {...sel(`content.categories.${ci}.name`)}
                  className="text-2xl sm:text-3xl font-extrabold tracking-tight shrink-0"
                  style={{ color: theme.primaryColor, fontFamily: "var(--font-heading)" }}
                >
                  {cat.name}
                </h3>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              {/* GRID LAYOUT (Photo Cards) */}
              {layout === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {catItems.map((item: any, ii: number) => (
                    <div
                      key={ii}
                      {...sel(`content.categories.${ci}.items.${ii}`)}
                      className="rounded-2xl border backdrop-blur-sm flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", borderColor: "rgba(255, 255, 255, 0.08)", borderRadius: "var(--radius)" }}
                    >
                      {item.image && (
                        <div className="h-48 overflow-hidden relative">
                          <img
                            {...sel(`content.categories.${ci}.items.${ii}.image`)}
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          {item.badge && (
                            <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow" style={{ background: theme.primaryColor }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 {...sel(`content.categories.${ci}.items.${ii}.name`)} className="font-bold text-lg" style={{ fontFamily: "var(--font-heading)" }}>
                              {item.name}
                            </h4>
                            {item.price && (
                              <span {...sel(`content.categories.${ci}.items.${ii}.price`)} className="font-extrabold text-lg shrink-0" style={{ color: theme.primaryColor }}>
                                {item.price}
                              </span>
                            )}
                          </div>
                          {item.desc && <p {...sel(`content.categories.${ci}.items.${ii}.desc`)} className="text-sm opacity-75 leading-relaxed">{item.desc}</p>}
                        </div>
                        {(item.url || item.buttonText) && (
                          <a
                            href={item.url || "#"}
                            {...sel(`content.categories.${ci}.items.${ii}.buttonText`)}
                            className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
                            style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`, borderRadius: "var(--radius)" }}
                          >
                            {item.buttonText || "Order Now"}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* COMPACT TWO-COLUMN LAYOUT */}
              {layout === "compact" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {catItems.map((item: any, ii: number) => (
                    <div
                      key={ii}
                      {...sel(`content.categories.${ci}.items.${ii}`)}
                      className="p-4 rounded-xl border backdrop-blur-sm flex items-center gap-4 transition-colors hover:bg-white/5"
                      style={{ borderColor: "rgba(255, 255, 255, 0.08)", borderRadius: "var(--radius)" }}
                    >
                      {item.image && (
                        <img
                          {...sel(`content.categories.${ci}.items.${ii}.image`)}
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
                          className="w-16 h-16 rounded-xl object-cover shrink-0 shadow-md border border-white/10"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span {...sel(`content.categories.${ci}.items.${ii}.name`)} className="font-bold text-base truncate">{item.name}</span>
                          <span {...sel(`content.categories.${ci}.items.${ii}.price`)} className="font-extrabold text-base shrink-0" style={{ color: theme.primaryColor }}>
                            {item.price}
                          </span>
                        </div>
                        {item.desc && <p {...sel(`content.categories.${ci}.items.${ii}.desc`)} className="text-xs opacity-65 truncate mt-0.5">{item.desc}</p>}
                        {(item.url || item.buttonText) && (
                          <a
                            href={item.url || "#"}
                            {...sel(`content.categories.${ci}.items.${ii}.buttonText`)}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white shadow transition-all hover:opacity-90"
                            style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
                          >
                            {item.buttonText || "Order Now"}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CLASSIC LIST LAYOUT (DEFAULT) */}
              {(layout === "list" || (layout !== "grid" && layout !== "compact")) && (
                <div className="space-y-6">
                  {catItems.map((item: any, ii: number) => (
                    <div
                      key={ii}
                      {...sel(`content.categories.${ci}.items.${ii}`)}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                    >
                      {item.image && (
                        <img
                          {...sel(`content.categories.${ci}.items.${ii}.image`)}
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-md border border-white/10"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span {...sel(`content.categories.${ci}.items.${ii}.name`)} className="font-bold text-lg">{item.name}</span>
                            {item.badge && (
                              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded text-white shadow-sm shrink-0" style={{ background: theme.primaryColor }}>
                                {item.badge}
                              </span>
                            )}
                            <div className="hidden sm:block flex-1 border-b border-dotted border-white/20 mx-2" />
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {item.price && (
                              <span {...sel(`content.categories.${ci}.items.${ii}.price`)} className="font-extrabold text-lg tracking-tight" style={{ color: theme.primaryColor }}>
                                {item.price}
                              </span>
                            )}
                            {(item.url || item.buttonText) && (
                              <a
                                href={item.url || "#"}
                                {...sel(`content.categories.${ci}.items.${ii}.buttonText`)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
                                style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
                              >
                                {item.buttonText || "Order Now"}
                              </a>
                            )}
                          </div>
                        </div>
                        {item.desc && <p {...sel(`content.categories.${ci}.items.${ii}.desc`)} className="text-sm opacity-70 mt-1 leading-relaxed">{item.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TimelineSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-4xl mx-auto">
      <div className="mb-14 text-center">
        <h2 {...sel("title")} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="opacity-75 mt-2">{section.subtitle}</p>}
      </div>

      <div className="relative border-l-2 border-white/10 ml-4 pl-8 space-y-12">
        {items.map((item: any, i: number) => (
          <div key={i} {...sel(`content.items.${i}`)} className="relative group">
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
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((p: any, i: number) => (
          <div
            key={i}
            {...sel(`content.plans.${i}`)}
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
              <h3 {...sel(`content.plans.${i}.name`)} className="text-2xl font-bold mb-2">{p.name}</h3>
              <p {...sel(`content.plans.${i}.desc`)} className="text-xs opacity-65 mb-6">{p.desc}</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span {...sel(`content.plans.${i}.price`)} className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                  {p.price}
                </span>
                <span className="text-xs opacity-60">/ month</span>
              </div>
              <div className="space-y-3 mb-8">
                {(p.features || []).map((f: string, fi: number) => (
                  <div key={fi} className="flex items-center gap-3 text-sm opacity-85">
                    <CheckCircle2 size={16} style={{ color: theme.primaryColor }} />
                    <span {...sel(`content.plans.${i}.features.${fi}`)}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <a
              href={p.url || p.ctaLink || p.buttonUrl || "#"}
              {...sel(`content.plans.${i}.buttonText`)}
              className="w-full py-3 block text-center font-bold text-white shadow-lg transition-all hover:opacity-90 cursor-pointer"
              style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
            >
              {p.buttonText || p.ctaText || "Get Started"}
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-3xl mx-auto">
      <div className="text-center mb-14">
        <h2 {...sel("title")} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
      </div>

      <div className="space-y-4">
        {items.map((item: any, i: number) => {
          const isOpen = openIdx === i;
          return (
            <div
              key={i}
              {...sel(`content.items.${i}`)}
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
                <span {...sel(`content.items.${i}.question`)}>{item.question}</span>
                <ChevronDown size={20} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div {...sel(`content.items.${i}.answer`)} className="px-6 pb-6 text-sm opacity-75 leading-relaxed border-t border-white/5 pt-4">
                  {item.answer}
                </div>
              )}
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
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  const handleLinkClick = (i: number, url: string, e: React.MouseEvent) => {
    if (!url || url === "#") { e.preventDefault(); return; }
    if (interactive) { e.preventDefault(); return; }
    setClickedIdx(i);
    setTimeout(() => setClickedIdx(null), 1500);
  };

  return (
    <section id={section.id} data-section-id={section.id} className="min-h-screen flex items-center justify-center p-6">
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
            {...sel("content.avatar")}
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

        <h1 {...sel("title")} className="text-2xl font-extrabold mb-1" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h1>
        {section.subtitle && <p {...sel("subtitle")} className="text-sm font-semibold mb-4" style={{ color: theme.primaryColor }}>{section.subtitle}</p>}
        {section.content?.bio && <p {...sel("content.bio")} className="text-sm opacity-80 leading-relaxed mb-6">{section.content.bio}</p>}

        {section.content?.location && (
          <div {...sel("content.location")} className="inline-flex items-center gap-1.5 text-xs opacity-60 mb-6 font-medium bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
            <MapPin size={12} /> {section.content.location}
          </div>
        )}

        {/* Primary CTA Button */}
        {section.content?.ctaText && (
          <div className="mb-8">
            <a
              {...sel("content.ctaText")}
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
            <a {...sel("content.socials.email")} href={`mailto:${socials.email}`} className="px-4 py-2 rounded-full text-xs font-semibold border bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <Mail size={14} /> Email
            </a>
          )}
          {socials.phone && (
            <a {...sel("content.socials.phone")} href={`tel:${socials.phone}`} className="px-4 py-2 rounded-full text-xs font-semibold border bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <Phone size={14} /> Call
            </a>
          )}
          {socials.linkedin && (
            <a {...sel("content.socials.linkedin")} href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full text-xs font-semibold border bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <Linkedin size={14} /> LinkedIn
            </a>
          )}
          {socials.twitter && (
            <a {...sel("content.socials.twitter")} href={socials.twitter} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full text-xs font-semibold border bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5">
              <Twitter size={14} /> Twitter
            </a>
          )}
        </div>

        {/* Custom Links List */}
        {customLinks.length > 0 && (
          <div className="space-y-3">
            {customLinks.map((link: any, i: number) => {
              const IconComponent = getIconComponent(link.icon, ExternalLink);
              const clicked = clickedIdx === i;
              return (
                <a
                  key={i}
                  {...sel(`content.customLinks.${i}`)}
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
                    <span {...sel(`content.customLinks.${i}.label`)} className={`text-sm transition-colors ${clicked ? "text-emerald-300" : ""}`}>{link.label}</span>
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
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  const handleClick = (i: number, url: string, e: React.MouseEvent) => {
    if (!url || url === "#") { e.preventDefault(); return; }
    if (interactive) { e.preventDefault(); return; }
    setClickedIdx(i);
    setTimeout(() => setClickedIdx(null), 1500);
  };

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-lg mx-auto text-center">
      {section.title && (
        <h2 {...sel("title")} className="text-3xl font-extrabold mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
      )}
      {section.subtitle && <p {...sel("subtitle")} className="text-sm opacity-80 mb-10">{section.subtitle}</p>}

      <div className="space-y-4">
        {links.map((link: any, i: number) => {
          const IconComponent = getIconComponent(link.icon, Globe);
          const clicked = clickedIdx === i;
          return (
            <a
              key={i}
              {...sel(`content.links.${i}`)}
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
              <span {...sel(`content.links.${i}.label`)} className={`text-lg transition-colors ${clicked ? "text-emerald-300" : ""}`}>
                {clicked ? "Opened ✓" : link.label}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function TeamSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const members: any[] = section.content?.members || [];
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {members.map((m: any, i: number) => (
          <article
            key={i}
            {...sel(`content.members.${i}`)}
            className="rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius)",
            }}
          >
            {m.avatar && (
              <div className="aspect-square overflow-hidden relative">
                <img
                  {...elementSel(`content.members.${i}.avatar`, selectedElementKey)}
                  src={m.avatar}
                  alt={m.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-6 text-center">
              <h3 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>{m.name}</h3>
              <div className="text-xs font-semibold uppercase tracking-wider mt-1 mb-3" style={{ color: theme.primaryColor }}>
                {m.role}
              </div>
              {m.bio && <p className="text-sm opacity-70 leading-relaxed">{m.bio}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((t: any, i: number) => (
          <figure
            key={i}
            {...sel(`content.items.${i}`)}
            className="rounded-2xl border backdrop-blur-sm p-8 flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius)",
            }}
          >
            <blockquote {...sel(`content.items.${i}.quote`)} className="opacity-85 leading-relaxed text-sm md:text-base italic">
              “{t.quote}”
            </blockquote>
            <figcaption className="flex items-center gap-3 mt-auto">
              {t.avatar && (
                <img
                  {...sel(`content.items.${i}.avatar`)}
                  src={t.avatar}
                  alt={t.author}
                  className="w-11 h-11 rounded-full object-cover border-2"
                  style={{ borderColor: `${theme.primaryColor}55` }}
                  loading="lazy"
                />
              )}
              <div>
                <div {...sel(`content.items.${i}.author`)} className="font-bold text-sm">{t.author}</div>
                {t.role && <div {...sel(`content.items.${i}.role`)} className="text-xs opacity-60">{t.role}</div>}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ContactSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const c = section.content || {};
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-14 space-y-2">
        <h2 {...sel("title")} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          {c.email && (
            <div {...sel("content.email")} className="flex items-center gap-4">
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
            <div {...sel("content.phone")} className="flex items-center gap-4">
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
            <div {...sel("content.address")} className="flex items-center gap-4">
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
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);
  return (
    <footer id={section.id} data-section-id={section.id} className="py-12 px-6 border-t border-white/10 text-center text-xs opacity-60">
      <p {...sel("title")}>© {new Date().getFullYear()} {section.title || "Nexora AI"}. All rights reserved.</p>
    </footer>
  );
}

function MapsSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const c = section.content || {};
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  let embedSrc = c.embedUrl || "";
  const query = c.address || c.query || "";
  const lat = c.lat;
  const lng = c.lng;

  if (!embedSrc && (lat || lng)) {
    embedSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=${c.zoom || 15}&output=embed`;
  } else if (!embedSrc && query) {
    embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=${c.zoom || 15}&output=embed`;
  }

  return (
    <section id={section.id} data-section-id={section.id} className="py-16 px-6 max-w-6xl mx-auto">
      <div className="text-center mb-10 space-y-2">
        <h2 {...sel("title")} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="opacity-75 max-w-2xl mx-auto">{section.subtitle}</p>}
      </div>

      {c.address && (
        <p {...sel("address")} className="text-center text-sm mb-6 opacity-80 flex items-center justify-center gap-2">
          <MapPin size={16} style={{ color: theme.primaryColor }} /> {c.address}
        </p>
      )}

      <div
        className="w-full overflow-hidden rounded-2xl border shadow-lg"
        style={{ borderColor: "rgba(255,255,255,0.1)", height: c.height || 380, borderRadius: "var(--radius)" }}
      >
        {embedSrc ? (
          <iframe
            {...sel("embedUrl")}
            title={section.title || "Map"}
            src={embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0, filter: theme.mode === "dark" ? "invert(0.9) hue-rotate(180deg)" : "none" }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800/40 text-slate-400 text-sm">
            <MapPin size={20} className="mr-2" /> Add an address or coordinates to display the map.
          </div>
        )}
      </div>
    </section>
  );
}

function WhatsAppSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const c = section.content || {};
  const phone = c.phone || "15551234567";
  const defaultText = c.defaultText || "Hi! I'd like to know more about your services.";
  const waLink = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(defaultText)}`;
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-16 px-6 text-center">
      {section.title && (
        <h2 {...sel("title")} className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
      )}
      {section.subtitle && <p {...sel("subtitle")} className="opacity-75 mb-8 max-w-2xl mx-auto">{section.subtitle}</p>}

      <a
        {...sel("phone")}
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!interactive) e.preventDefault();
        }}
        className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
        style={{ backgroundColor: "#25D366", borderRadius: "var(--radius)" }}
      >
        <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
          <SvgWhatsApp className="w-5 h-5 text-[#25D366]" />
        </span>
        <span {...sel("buttonText")}>{c.buttonText || "Chat on WhatsApp"}</span>
      </a>

      {c.availability && (
        <p {...sel("availability")} className="text-xs opacity-60 mt-4 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {c.availability}
        </p>
      )}
    </section>
  );
}

function BlogSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const posts: any[] = section.content?.posts || section.content?.items || [];
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post: any, i: number) => (
          <article
            key={i}
            {...sel(`content.posts.${i}`)}
            className="rounded-2xl border backdrop-blur-sm overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius)",
            }}
          >
            {post.image && (
              <div className="h-52 overflow-hidden relative">
                <img
                  {...sel(`content.posts.${i}.image`)}
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-6 flex-1 flex flex-col">
              <h3 {...sel(`content.posts.${i}.title`)} className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
                {post.title}
              </h3>
              <p {...sel(`content.posts.${i}.desc`)} className="opacity-75 text-sm leading-relaxed flex-1">{post.desc || post.excerpt}</p>
              {(post.url || post.buttonText) && (
                <a
                  href={post.url || "#"}
                  {...sel(`content.posts.${i}.buttonText`)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline cursor-pointer"
                  style={{ color: theme.primaryColor }}
                >
                  {post.buttonText || "Read Article"} &rarr;
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ─── YouTube Embed Helper ──────────────────────────────────────────────────
export function parseYouTubeEmbedUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes("youtube.com/embed/")) {
    const videoId = trimmed.split("youtube.com/embed/")[1]?.split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : trimmed;
  }

  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?.*v=|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?rel=0`;
  }

  return null;
}

function VideoSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const content = section.content || {};
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  const rawUrl =
    content.youtubeUrl ||
    (section as any).youtubeUrl ||
    content.videoUrl ||
    (section as any).videoUrl ||
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

  const embedUrl = parseYouTubeEmbedUrl(rawUrl);

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      className="relative px-6 py-16 sm:py-24 max-w-5xl mx-auto flex flex-col items-center text-center"
    >
      {section.badge && (
        <div
          {...sel("badge")}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border"
          style={{
            borderColor: `${theme.primaryColor}40`,
            background: `${theme.primaryColor}15`,
            color: theme.primaryColor,
          }}
        >
          {section.badge}
        </div>
      )}

      {section.title && (
        <h2
          {...sel("title")}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {section.title}
        </h2>
      )}

      {section.subtitle && (
        <p {...sel("subtitle")} className="text-base sm:text-lg opacity-80 max-w-2xl mb-8">
          {section.subtitle}
        </p>
      )}

      <div
        {...sel("youtubeUrl")}
        className="w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-950 relative group"
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={section.title || "YouTube Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-slate-400 gap-3 bg-slate-900">
            <Youtube size={48} className="text-red-500 animate-pulse" />
            <p className="text-xs font-bold text-slate-200">
              Paste any YouTube video or Shorts link in the Inspector panel to embed
            </p>
          </div>
        )}
      </div>

      {content.caption && (
        <p {...sel("caption")} className="text-xs opacity-60 mt-3 italic">
          {content.caption}
        </p>
      )}
    </section>
  );
}

// Lightweight inline WhatsApp glyph (avoids extra icon dependency).
function SvgWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
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
    case "services":
      return <ServicesSection {...rendererProps} />;
    case "products":
      return <ProductsSection {...rendererProps} />;
    case "gallery":
      return <GallerySection {...rendererProps} />;
    case "team":
      return <TeamSection {...rendererProps} />;
    case "testimonials":
      return <TestimonialsSection {...rendererProps} />;
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
    case "blog":
      return <BlogSection {...rendererProps} />;
case "links":
      return <LinksSection {...rendererProps} />;
    case "digital_card":
      return <DigitalCardSection {...rendererProps} />;
    case "contact":
      return <ContactSection {...rendererProps} />;
    case "maps":
      return <MapsSection {...rendererProps} />;
    case "whatsapp":
      return <WhatsAppSection {...rendererProps} />;
    case "video":
    case "media":
      return <VideoSection {...rendererProps} />;
    case "custom_html": {
      const rawHtml = section.content?.html || "";
      // If the template ships its own semantic root (section/nav/footer/...),
      // render the raw HTML directly so its layout & full-bleed styling apply.
      // Only wrap bare fragments in a plain, padding-free <div> for safety.
      const hasRoot = customHtmlHasRootElement(rawHtml);
      return hasRoot ? (
        <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
      ) : (
        <section id={section.id} className="custom-html-section">
          {rawHtml ? (
            <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs border border-dashed border-slate-700 rounded-xl">
              [Custom HTML Section: {section.title || "Empty"}]
            </div>
          )}
        </section>
      );
    }
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
  onRequestImageEdit?: (sectionId: string, elementKey: string) => void;
  interactive?: boolean;
}

interface InlineEditorState {
  sectionId: string;
  elementKey: string;
  top: number;
  left: number;
  width: number;
  height: number;
  multiline: boolean;
}

export function SiteRenderer({
  config,
  customCode,
  selectedSectionId,
  onSelectSection,
  selectedElementKey,
  onSelectElement,
  onRequestImageEdit,
  interactive = false,
}: SiteRendererProps) {
  const updateElementValue = useEditorStore((state) => state.updateElementValue);
  const updateElementStyle = useEditorStore((state) => state.updateElementStyle);
  const moveSection = useEditorStore((state) => state.moveSection);
  const duplicateSection = useEditorStore((state) => state.duplicateSection);
  const removeSection = useEditorStore((state) => state.removeSection);
  const [inlineEditor, setInlineEditor] = useState<InlineEditorState | null>(null);
  const [draftValue, setDraftValue] = useState("");
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
  // Executes customCode.js + any embedded <script> tags from full HTML documents.
  // Falls back to config.customCode when the prop isn't passed (e.g. thumbnails).
  useEffect(() => {
    const cc = customCode || config?.customCode;
    // Extract any inline <script> tags inside customCode.html
    const inlineScripts: string[] = [];
    if (cc?.html) {
      const regex = /<script(?![^>]*\bsrc=)[\s\S]*?>([\s\S]*?)<\/script>/gi;
      let m;
      while ((m = regex.exec(cc.html)) !== null) {
        if (m[1]?.trim()) inlineScripts.push(m[1].trim());
      }
    }

const combinedJs = [cc?.js || "", ...inlineScripts].filter(Boolean).join("\n;\n");
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
  }, [customCode?.js, customCode?.html, config?.customCode?.js, config?.customCode?.html]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setInlineEditor(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const resolveElementValue = (section: Section, elementKey: string) => {
    const normalizedKey = elementKey.replace(/^content\./, "");
    const directKeys = new Set(["badge", "title", "subtitle"]);

    if (directKeys.has(normalizedKey)) {
      const value = (section as Record<string, any>)[normalizedKey];
      return typeof value === "string" || typeof value === "number" ? value : null;
    }

    const content = (section.content || {}) as Record<string, any>;
    const parts = normalizedKey.split(".").filter(Boolean);
    if (parts.length === 0) return null;

    let cursor: any = content;
    for (const part of parts) {
      if (cursor === null || cursor === undefined) return null;
      cursor = cursor[part];
    }

    return typeof cursor === "string" || typeof cursor === "number" ? cursor : null;
  };

  const openInlineEditor = (event: MouseEvent<HTMLElement>, section: Section, elementKey: string) => {
    const value = resolveElementValue(section, elementKey);
    if (typeof value !== "string" && typeof value !== "number") return;

    const target = event.currentTarget as HTMLElement | null;
    const rect = target?.getBoundingClientRect();
    if (!rect) return;

    const isMultiline = /subtitle|desc|bio|answer|detail|content/i.test(elementKey);
    setDraftValue(String(value));
    setInlineEditor({
      sectionId: section.id,
      elementKey,
      top: rect.top + window.scrollY - 2,
      left: rect.left + window.scrollX - 2,
      width: Math.max(rect.width + 4, 220),
      height: Math.max(rect.height, isMultiline ? 120 : 44),
      multiline: isMultiline,
    });
  };

  const applyInlineStyle = (section: Section, elementKey: string, styleUpdates: Record<string, string>) => {
    updateElementStyle(section.id, elementKey, styleUpdates);
  };

  const commitInlineEditor = () => {
    setInlineEditor(null);
  };

  if (!config) return null;

const containerClass = resolveTemplateContainerClass(config);
  const containerSelector = `.${containerClass}`;
  // Scope & sanitize BOTH the template-level customCss and the customCode.css
  // (uploaded templates store their animated CSS in customCode.css). This ensures
  // their "body.tpl-<slug>" selectors are rewritten to the container class.
  const scopedTemplateCss = sanitizeTemplateCss(
[config.customCss, config.customCode?.css, customCode?.css].filter(Boolean).join("\n"),
containerSelector
  );

  // Per-element custom text colors (from the visual editor "Custom Color" tool).
  const elementColorCss = buildElementColorCss(config.sections || []);
  const elementStyleCss = buildElementStyleCss(config.sections || []);

return (
    <div
      className={`${containerClass} min-h-full w-full flex flex-col flex-1`}
      style={buildCssVariables(config.theme, interactive)}
      // ── Editor-only safety net ─────────────────────────────────────────
      // In interactive (visual editor) mode we prevent two things that would
      // otherwise yank the user out of the editor:
      //   1) Link navigation — any click inside an <a href> (React-rendered OR
      //      raw HTML via dangerouslySetInnerHTML) is prevented so the element
      //      can be selected/edited instead of opening the page.
      //   2) Form submission — custom-HTML forms won't navigate during editing.
      // We use the *capture* phase so this runs before the section onClick
      // selection logic, and preventDefault() does NOT stop event bubbling, so
      // element/section selection still works. The published site & preview
      // render without `interactive`, so their links/forms behave normally.
      onClickCapture={(e) => {
        if (!interactive) return;
        if ((e.target as HTMLElement)?.closest?.("a[href], button[type='submit']")) {
          e.preventDefault();
        }
      }}
      onSubmitCapture={(e) => {
        if (!interactive) return;
        e.preventDefault();
      }}
    >
{scopedTemplateCss && <style dangerouslySetInnerHTML={{ __html: scopedTemplateCss }} />}

      {/* Per-element custom text colors (visual editor "Custom Color" tool) */}
      {elementColorCss && <style dangerouslySetInnerHTML={{ __html: elementColorCss }} />}
      {elementStyleCss && <style dangerouslySetInnerHTML={{ __html: elementStyleCss }} />}

{/* Editor-only: force a normal cursor so template custom-cursor CSS
          (cursor: url(...) / cursor: none) never interferes with editing.
          Scoped to the template container so the published site keeps the
          template's real cursors. */}
      {interactive && (
        <style
          dangerouslySetInnerHTML={{
            __html: `.${containerClass}, .${containerClass} *, .${containerClass} a, .${containerClass} button { cursor: auto !important; }`,
          }}
        />
      )}

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

              const target = (e.target as HTMLElement)?.closest?.("[data-element-key]");
              if (target) {
                const elKey = target.getAttribute("data-element-key");
                if (elKey) {
                  onSelectElement?.(elKey, section.id);

                  const isImage = (e.target as HTMLElement)?.closest?.("img") !== null;
                  if (isImage) {
                    onRequestImageEdit?.(section.id, elKey);
                  }
                  return;
                }
              }

              if (onSelectSection) onSelectSection(section.id);
            }}
            draggable={interactive}
            onDragStart={(e) => {
              if (!interactive) return;
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", section.id);
            }}
            onDragOver={(e) => {
              if (!interactive) return;
              e.preventDefault();
            }}
            onDrop={(e) => {
              if (!interactive) return;
              e.preventDefault();
              const sourceId = e.dataTransfer.getData("text/plain");
              if (sourceId && sourceId !== section.id) {
                moveSection(sourceId, section.id);
              }
            }}
            className={`relative transition-all duration-200 ease-out will-change-transform group ${
              interactive ? "cursor-pointer" : ""
            } ${
              interactive && isSelected
                ? "z-20 before:absolute before:inset-0 sm:before:rounded-[0.9rem] before:border before:border-indigo-400/50"
                : interactive
                ? "hover:before:absolute hover:before:inset-0 sm:before:rounded-[0.9rem] hover:before:border hover:before:border-slate-700/40"
                : ""
            }`}
          >
            {interactive && (
              <>
                <div className={`absolute left-3 top-3 z-30 flex items-center gap-1.5 rounded-full border border-slate-700/70 bg-slate-950/70 px-2.5 py-1 text-[10px] font-semibold text-slate-200 shadow-lg backdrop-blur transition-opacity duration-200 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} title="Drag to reorder section">
                  <GripVertical size={12} className="text-slate-400" />
                  <span className="uppercase tracking-[0.2em]">Move</span>
                </div>

                <div
                  className={`absolute top-3 right-3 z-30 flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-xl backdrop-blur-md transition-all duration-200 ${
                    isSelected ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-95 hover:scale-100"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-950/60 rounded-md border border-indigo-700/40">
                    {section.type}
                  </div>
                  <div className="w-px h-3.5 bg-slate-800 my-auto mx-0.5" />
                  <button
                    onClick={() => {
                      const idx = config.sections.findIndex((s) => s.id === section.id);
                      if (idx > 0) moveSection(section.id, config.sections[idx - 1].id);
                    }}
                    className="p-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Move Up"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => {
                      const idx = config.sections.findIndex((s) => s.id === section.id);
                      if (idx < config.sections.length - 1) moveSection(section.id, config.sections[idx + 1].id);
                    }}
                    className="p-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Move Down"
                  >
                    <ChevronDown size={13} />
                  </button>
                  <button
                    onClick={() => duplicateSection(section.id)}
                    className="p-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Duplicate Section"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="p-1 rounded-md hover:bg-red-950/80 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete Section"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </>
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

{(customCode?.html || config.customCode?.html) && (
        <div dangerouslySetInnerHTML={{ __html: customCode?.html || config.customCode?.html || "" }} />
      )}

    </div>
  );
}
