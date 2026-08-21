"use client";

import {
  SiteConfigJSON,
  Section,
  sanitizeTemplateCss,
  resolveTemplateContainerClass,
} from "@ai-platform/shared";
import { CSSProperties, useState, useEffect, useMemo, useRef, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  CheckCircle,
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
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Send,
  X,
  Menu,
  Plus,
} from "lucide-react";
import { useEditorStore } from "@/store/editorStore";
import { formsApi } from "@/lib/api";
import { getUrlUtmParams } from "@/lib/analyticsTracker";

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

/** Determine if the current theme is dark-mode based on the theme config object */
function getIsDarkTheme(theme: any): boolean {
  if (!theme) return true;
  const mode = theme.mode || theme.variant || theme.colorMode || "";
  if (typeof mode === "string") {
    const m = mode.toLowerCase();
    if (m === "light" || m === "pastel") return false;
  }
  // Check background color heuristic – if bg is explicitly a light color
  const bg = theme.backgroundColor || theme.background || "";
  if (typeof bg === "string" && bg.startsWith("#")) {
    const hex = bg.replace("#", "");
    if (hex.length >= 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
  }
  return true; // default to dark
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
      // Trim to avoid saving leading/trailing whitespace introduced by browser or adjacent elements
      const text = (e.currentTarget.innerText || e.currentTarget.textContent || "").trim();
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

/** Selectable in the editor but not inline-editable (e.g. contact info cards). */
function selectOnly(key: string, selectedElementKey?: string | null) {
  return {
    "data-element-key": key,
    "data-selected": selectedElementKey === key ? "true" : "false",
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

function getNavElementStyle(section: Section, elementKey: string): CSSProperties {
  const base = getElementStyle(section, elementKey);
  return {
    color: base.color,
    fontSize: base.fontSize,
    fontWeight: base.fontWeight,
    textAlign: base.textAlign,
    textTransform: base.textTransform,
    letterSpacing: base.letterSpacing,
    backgroundColor: base.backgroundColor && base.backgroundColor !== "transparent" ? base.backgroundColor : undefined,
  };
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
// ─── Theme Style Builder ───────────────────────────────────────────────────
export function isColorDark(colorStr?: string): boolean | null {
  if (!colorStr || typeof colorStr !== "string") return null;
  const c = colorStr.trim().toLowerCase();
  if (c === "transparent" || c === "inherit") return null;

  let hex = c.replace(/^#/, "");
  if (/^[0-9a-f]{3}$/.test(hex)) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (/^[0-9a-f]{6}$/.test(hex)) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }
  if (c.startsWith("rgb")) {
    const parts = c.match(/\d+/g);
    if (parts && parts.length >= 3) {
      const r = parseInt(parts[0], 10);
      const g = parseInt(parts[1], 10);
      const b = parseInt(parts[2], 10);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
  }
  if (c.startsWith("hsl")) {
    const parts = c.match(/\d+/g);
    if (parts && parts.length >= 3) {
      const l = parseInt(parts[2], 10);
      return l < 50;
    }
  }
  return null;
}

/** Build a CSSProperties object with CSS custom properties derived from the theme config.
 *  These custom properties (--primary, --font-heading, --radius, etc.) are consumed by
 *  template CSS and inline styles throughout the renderer. */
function buildCssVariables(theme: any, _interactive?: boolean): CSSProperties {
  if (!theme) return {};
  return {
    "--primary": theme.primaryColor || "#3B82F6",
    "--secondary": theme.secondaryColor || theme.primaryColor || "#8B5CF6",
    "--accent": theme.accentColor || "#F59E0B",
    "--background": theme.backgroundColor || "#090D16",
    "--text": theme.textColor || "#F8FAFC",
    "--surface": theme.mode === "light" ? "#ffffff" : "rgba(255,255,255,0.04)",
    "--border": theme.mode === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)",
    "--font-heading": theme.headingFont || theme.fontFamily || "Inter",
    "--font-body": theme.bodyFont || theme.fontFamily || "Inter",
    "--radius": theme.borderRadius || "12px",
    fontFamily: `${theme.bodyFont || theme.fontFamily || "Inter"}, ui-sans-serif, system-ui, sans-serif`,
    backgroundColor: theme.backgroundColor || "#090D16",
    color: theme.textColor || "#F8FAFC",
  } as CSSProperties;
}

/**
 * Builds section-scoped CSS that applies per-element custom text colors.
 * Targets both normalized keys and `content.` prefixed data-element-key attributes
 * so custom colors apply seamlessly to all nav items, text headers, buttons & stats.
 */
export function getCleanSocialUrl(platform: string, value: string): string {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) {
    return trimmed;
  }
  const cleanHandle = trimmed.replace(/^@/, "");
  switch (platform.toLowerCase()) {
    case "instagram":
    case "insta":
      return `https://instagram.com/${cleanHandle}`;
    case "github":
      return `https://github.com/${cleanHandle}`;
    case "twitter":
    case "x":
      return `https://x.com/${cleanHandle}`;
    case "linkedin":
      return cleanHandle.includes("/") ? `https://linkedin.com/${cleanHandle}` : `https://linkedin.com/in/${cleanHandle}`;
    case "youtube":
      return `https://youtube.com/@${cleanHandle}`;
    case "facebook":
      return `https://facebook.com/${cleanHandle}`;
    case "twitch":
      return `https://twitch.tv/${cleanHandle}`;
    case "whatsapp":
      return `https://wa.me/${cleanHandle.replace(/[^0-9]/g, "")}`;
    case "email":
      return `mailto:${cleanHandle}`;
    case "phone":
      return `tel:${cleanHandle}`;
    default:
      return `https://${trimmed}`;
  }
}

function SocialLinksRow({
  socials,
  theme,
  sel,
  className = "",
}: {
  socials: Record<string, any> | undefined;
  theme: SiteConfigJSON["theme"];
  sel?: (key: string) => any;
  className?: string;
}) {
  if (!socials || typeof socials !== "object") return null;
  const isDark = getIsDarkTheme(theme);

  const platforms = [
    { key: "instagram", label: "Instagram", icon: Instagram },
    { key: "github", label: "GitHub", icon: Github },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin },
    { key: "twitter", label: "Twitter", icon: Twitter },
    { key: "youtube", label: "YouTube", icon: Youtube },
    { key: "facebook", label: "Facebook", icon: Facebook },
    { key: "twitch", label: "Twitch", icon: Twitch },
    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { key: "email", label: "Email", icon: Mail },
    { key: "phone", label: "Phone", icon: Phone },
  ];

  const activeLinks = platforms
    .map((p) => {
      const val = socials[p.key] || (socials as any)[p.label.toLowerCase()];
      return val ? { ...p, value: val, url: getCleanSocialUrl(p.key, val) } : null;
    })
    .filter(Boolean);

  if (activeLinks.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {activeLinks.map((item: any) => {
        const Icon = item.icon;
        const selAttr = sel ? sel(`content.socials.${item.key}`) : {};
        return (
          <a
            key={item.key}
            {...selAttr}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={item.label}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${
              isDark
                ? "bg-white/5 hover:bg-white/15 border-white/10 text-white"
                : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800"
            }`}
          >
            <Icon size={14} style={{ color: theme.primaryColor }} />
            <span>{item.label}</span>
          </a>
        );
      })}
    </div>
  );
}

// ─── Interactive Image Wrapper with Hover Badge ──────────────────────────────
interface InteractiveImageWrapperProps {
  children: React.ReactNode;
  sectionId: string;
  elementKey: string;
  interactive?: boolean;
  onSelectElement?: (elementKey: string, sectionId: string) => void;
  onRequestImageEdit?: (sectionId: string, elementKey: string) => void;
  className?: string;
  badgeLabel?: string;
  badgePosition?: "top-right" | "center" | "bottom-right" | "below" | "bottom-center";
  style?: React.CSSProperties;
}

function InteractiveImageWrapper({
  children,
  sectionId,
  elementKey,
  interactive,
  onSelectElement,
  onRequestImageEdit,
  className = "",
  badgeLabel = "Change Photo",
  badgePosition = "top-right",
  style,
}: InteractiveImageWrapperProps) {
  if (!interactive) {
    return <div className={className} style={style}>{children}</div>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectElement?.(elementKey, sectionId);
    onRequestImageEdit?.(sectionId, elementKey);
  };

  const posClasses =
    badgePosition === "center"
      ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      : badgePosition === "bottom-right"
      ? "bottom-2 right-2"
      : badgePosition === "below" || badgePosition === "bottom-center"
      ? "top-full left-1/2 -translate-x-1/2 mt-1.5"
      : "top-2 right-2";

  return (
    <div
      data-element-key={elementKey}
      onClick={handleClick}
      className={`relative group/img-interactive cursor-pointer ${className}`}
      style={style}
    >
      {children}
      <div
        style={{
          all: "initial",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          padding: "3px 7px",
          borderRadius: "6px",
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          border: "1px solid rgba(99, 102, 241, 0.5)",
          color: "#c7d2fe",
          fontSize: "10px",
          fontWeight: 600,
          boxShadow: "0 6px 16px rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
          pointerEvents: "none",
          fontFamily: "system-ui, -apple-system, sans-serif",
          whiteSpace: "nowrap",
          zIndex: 50,
        }}
        className={`absolute ${posClasses} opacity-0 group-hover/img-interactive:opacity-100 transition-opacity duration-200`}
      >
        <Camera size={11} className="text-indigo-400 shrink-0" />
        <span className="tracking-wide">{badgeLabel}</span>
      </div>
    </div>
  );
}

// ─── Section Renderers ───────────────────────────────────────────────────────

interface SectionRendererProps {
  section: Section;
  theme: SiteConfigJSON["theme"];
  selectedElementKey?: string | null;
  interactive?: boolean;
  siteSlug?: string;
  onAddToCart?: (item: { name: string; price: string }) => void;
  onSelectElement?: (elementKey: string, sectionId: string) => void;
  onRequestImageEdit?: (sectionId: string, elementKey: string) => void;
}

function NavbarSection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const content = section.content || {};
  const links: any[] = content.links || [];
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);
  const isDark = getIsDarkTheme(theme);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOffset, setMobileMenuOffset] = useState(0);
  const navRef = useRef<HTMLElement | null>(null);
  const menuAccent = theme.primaryColor || "#3B82F6";
  const mobileMenuItemCount = Math.max(links.length, 1) + (content.ctaText ? 1 : 0) + (interactive ? 1 : 0);
  const mobileMenuDesiredHeight = mobileMenuItemCount * 54 + 30;

  const logoImage = content.logoImage || content.logo || (section as any).logoImage;
  const logoWidth = content.logoWidth || (section as any).logoWidth || 36;
  const logoHeight = content.logoHeight || (section as any).logoHeight || "auto";

  const handleAddLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    useEditorStore.getState().pushHistorySnapshot();
    const cur = [...(content.links || [])];
    const next = [...cur, { label: `Link ${cur.length + 1}`, url: "#" }];
    useEditorStore.getState().updateSection(section.id, {
      content: { ...content, links: next },
    });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen && !interactive) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, interactive]);

  useEffect(() => {
    if (!isMounted || !mobileMenuOpen) return;

    const updateOffset = () => {
      const nav = navRef.current;
      if (!nav) return;
      setMobileMenuOffset(Math.max(0, Math.round(nav.getBoundingClientRect().bottom)));
    };

    updateOffset();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && navRef.current) {
      resizeObserver = new ResizeObserver(() => updateOffset());
      resizeObserver.observe(navRef.current);
    }

    window.addEventListener("resize", updateOffset);
    window.addEventListener("orientationchange", updateOffset);

    return () => {
      window.removeEventListener("resize", updateOffset);
      window.removeEventListener("orientationchange", updateOffset);
      resizeObserver?.disconnect();
    };
  }, [isMounted, mobileMenuOpen]);

  const mobileMenuPortal =
    isMounted && mobileMenuOpen
      ? createPortal(
          <>
            <div
              className="fixed left-0 right-0 bottom-0 bg-slate-950/40 backdrop-blur-sm md:hidden"
              style={{ top: mobileMenuOffset + 8, zIndex: 9999 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <div
              className="fixed left-0 right-0 md:hidden flex flex-col gap-2 overflow-y-auto overscroll-contain rounded-b-2xl border p-3 sm:p-4 shadow-2xl"
              style={{
                top: mobileMenuOffset + 8,
                maxHeight: `min(${mobileMenuDesiredHeight}px, 60dvh, calc(100dvh - ${mobileMenuOffset + 20}px))`,
                zIndex: 10000,
                backgroundColor: isDark ? "rgba(15, 23, 42, 0.96)" : "rgba(255, 255, 255, 0.96)",
                borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.10)",
                color: isDark ? "#F8FAFC" : "var(--text)",
                boxShadow: `0 24px 60px rgba(15, 23, 42, 0.18), 0 0 0 1px ${menuAccent}18`,
              }}
            >
              {/* Mobile Navigation Links */}
              {links && links.length > 0 ? (
                links.map((l: any, i: number) => {
                  const labelText = typeof l === "string" ? l : (l?.label || l?.name || `Link ${i + 1}`);
                  const linkUrl = typeof l === "string" ? "#" : (l?.url || "#");
                  const itemKey = `content.links.${i}.label`;
                  return (
                    <a
                      key={i}
                      {...sel(itemKey)}
                      href={linkUrl}
                      onClick={(e) => {
                        if (!interactive) {
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors active:scale-[0.99] touch-manipulation ${
                        isDark
                          ? "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                          : "bg-slate-50 border border-slate-200 text-slate-900 hover:bg-indigo-50 hover:text-indigo-700"
                      }`}
                      style={{ borderColor: `${menuAccent}22` }}
                    >
                      {labelText}
                    </a>
                  );
                })
              ) : (
                <div
                  className={`text-sm italic px-3.5 py-2.5 rounded-xl border ${
                    isDark ? "bg-white/5 border-white/10 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                  style={{ borderColor: `${menuAccent}22` }}
                >
                  No links configured
                </div>
              )}

              {/* Mobile Editor Add Link Button */}
              {interactive && (
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-indigo-500/50 bg-indigo-950/40 hover:bg-indigo-950/70 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={13} />
                  <span>Add Nav Link</span>
                </button>
              )}

              {/* Mobile CTA */}
              {content.ctaText && (
                <a
                  {...sel("content.ctaText")}
                  href={content.ctaLink || "#"}
                  onClick={() => {
                    if (!interactive) setMobileMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-all hover:scale-105 text-center touch-manipulation"
                  style={{ background: theme.primaryColor, boxShadow: `0 14px 28px ${menuAccent}33` }}
                >
                  {content.ctaText}
                </a>
              )}
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <nav
        ref={navRef}
        id={section.id}
        data-section-id={section.id}
        className="sticky top-0 z-50 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-3 border-b flex items-center justify-between gap-3"
        style={{
          backgroundColor: isDark ? "rgba(11, 15, 25, 0.75)" : "rgba(255, 255, 255, 0.85)",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)",
          color: "var(--text)",
        }}
      >
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 shrink-0">
          {logoImage ? (
            <img
              {...sel("content.logoImage")}
              src={logoImage}
              alt={section.title || "Logo"}
              loading="lazy"
              decoding="async"
              onClick={(e) => {
                if (!interactive) return;
                e.stopPropagation();
                onSelectElement?.("content.logoImage", section.id);
                onRequestImageEdit?.(section.id, "content.logoImage");
              }}
              className={`object-contain rounded shrink-0 transition-all ${
                interactive ? "cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-indigo-400/80" : ""
              }`}
              style={{
                width: typeof logoWidth === "number" ? `${logoWidth}px` : logoWidth,
                height: typeof logoHeight === "number" ? `${logoHeight}px` : logoHeight,
                maxHeight: "44px",
                ...getElementStyle(section, "content.logoImage"),
              }}
              title={interactive ? "Click to edit logo" : undefined}
            />
          ) : interactive ? (
            <div className="relative inline-flex flex-col items-center shrink-0 group/navbar-logo">
              <button
                type="button"
                {...sel("content.logoImage")}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement?.("content.logoImage", section.id);
                  onRequestImageEdit?.(section.id, "content.logoImage");
                }}
                style={{
                  all: "unset",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  border: "1px dashed rgba(148, 163, 184, 0.4)",
                  backgroundColor: "transparent",
                  color: "#94a3b8",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s ease",
                  flexShrink: 0,
                  boxSizing: "border-box",
                }}
                className="hover:!border-slate-300 hover:!text-white group shrink-0"
                title="Click to add brand logo (optional)"
              >
                <Camera size={13} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          ) : null}
          <span
            {...sel("title")}
            className="min-w-0 max-w-[50vw] sm:max-w-[280px] truncate font-extrabold text-base sm:text-xl tracking-tight"
            style={{
              fontFamily: "var(--font-heading)",
              color: isDark ? "#ffffff" : "var(--text)",
              ...getElementStyle(section, "title"),
            }}
          >
            {section.title || "Brand"}
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium opacity-80">
          {links && links.length > 0 ? (
            links.map((l: any, i: number) => {
              const labelText = typeof l === "string" ? l : (l?.label || l?.name || `Link ${i + 1}`);
              const linkUrl = typeof l === "string" ? "#" : (l?.url || "#");
              const itemKey = `content.links.${i}.label`;
              return (
                <a
                  key={i}
                  {...sel(itemKey)}
                  href={linkUrl}
                  className="hover:opacity-100 hover:text-indigo-400 transition-colors"
                  style={getNavElementStyle(section, itemKey)}
                >
                  {labelText}
                </a>
              );
            })
          ) : (
            <span className="text-xs text-slate-500 italic">No links configured</span>
          )}
        </div>

        {/* Desktop CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {content.ctaText && (
            <a
              {...sel("content.ctaText")}
              href={content.ctaLink || "#"}
              className="hidden md:block px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
              style={{ background: theme.primaryColor, ...getNavElementStyle(section, "content.ctaText") }}
            >
              {content.ctaText}
            </a>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[38px] min-h-[38px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors touch-manipulation"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {mobileMenuPortal}
    </>
  );
}

function HeroSection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const content = section.content || {};
  const stats: any[] = content.stats || [];
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  const bgImage = content.backgroundImage || content.bgImage;
  const bgPosition = content.backgroundPosition || "center";
  const overlayOpacity = typeof content.overlayOpacity === "number" ? content.overlayOpacity : 0.45;

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      className="relative px-6 py-20 lg:py-32 w-full mx-auto flex flex-col items-center text-center justify-center min-h-[75vh] overflow-hidden group/hero-sec"
      style={
        bgImage
          ? {
              backgroundImage: `url(${bgImage})`,
              backgroundPosition: bgPosition,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }
          : undefined
      }
    >
      {/* Hero Section Content */}

      {/* Dark Overlay when Background Image is active */}
      {bgImage && (
        <div
          className="absolute inset-0 bg-slate-950 pointer-events-none transition-opacity duration-300"
          style={{ opacity: overlayOpacity }}
        />
      )}

      {/* Background Subtle Glow (when no background image or as accent layer) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 blur-3xl -z-0"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${theme.primaryColor}, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center text-center justify-center w-full">
        {section.badge && (
          <div
            {...sel("badge")}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase mb-6 border shadow-sm backdrop-blur-sm"
            style={{
              borderColor: `${theme.primaryColor}40`,
              background: `${theme.primaryColor}20`,
              color: theme.primaryColor,
            }}
          >
            {section.badge}
          </div>
        )}

        <h1
          {...sel("title")}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl leading-none mb-6 text-white"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {section.title}
        </h1>

        {section.subtitle && (
          <p
            {...sel("subtitle")}
            className="text-lg sm:text-xl opacity-90 max-w-2xl font-normal leading-relaxed mb-10 text-slate-200"
            style={getElementStyle(section, "subtitle")}
          >
            {section.subtitle}
          </p>
        )}

        {/* Foreground Hero Image / Avatar (if not used as background) */}
        {!bgImage && (content.avatarUrl || content.image || content.imageUrl) && (
          <div className="w-full max-w-3xl mb-16 nexora-hero-image-wrapper">
            <InteractiveImageWrapper
              sectionId={section.id}
              elementKey="content.image"
              interactive={interactive}
              onSelectElement={onSelectElement}
              onRequestImageEdit={onRequestImageEdit}
              badgeLabel="Change Photo"
            >
              <img
                {...sel("content.image")}
                src={content.avatarUrl || content.image || content.imageUrl}
                alt={section.title || "Hero"}
                loading="lazy"
                decoding="async"
                className="nexora-hero-image w-full h-72 sm:h-96 object-cover rounded-2xl shadow-2xl"
                style={{ borderRadius: "var(--radius)" }}
              />
            </InteractiveImageWrapper>
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
              className="px-8 py-3.5 rounded-xl font-semibold border backdrop-blur-sm transition-all hover:bg-white/10 text-white"
              style={{
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "var(--radius)",
              }}
            >
              {content.secondaryCtaText}
            </a>
          )}
        </div>

        {stats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-white/15 w-full max-w-3xl">
            {stats.map((st: any, i: number) => (
              <div key={i} className="text-center">
                <div {...sel(`content.stats.${i}.value`)} className="text-3xl font-extrabold text-white" style={{ fontFamily: "var(--font-heading)" }}>
                  {st.value}
                </div>
                <div className="text-xs uppercase tracking-wider opacity-70 text-slate-300 mt-1">{st.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function AboutSection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const content = section.content || {};
  const skills: string[] = content.skills || [];
  const highlights: string[] = content.highlights || [];
  const socials = content.socials || (content.instagram || content.github || content.linkedin || content.twitter ? content : {});
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);
  const aboutImg = content.image || content.avatar || content.photo || content.imageUrl;

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {aboutImg ? (
          <div className="w-full md:w-80 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative group">
            <InteractiveImageWrapper
              sectionId={section.id}
              elementKey="content.image"
              interactive={interactive}
              onSelectElement={onSelectElement}
              onRequestImageEdit={onRequestImageEdit}
              badgeLabel="Change Photo"
            >
              <img
                {...sel("content.image")}
                src={aboutImg}
                alt={section.title || "About Photo"}
                className="w-full h-72 md:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </InteractiveImageWrapper>
          </div>
        ) : interactive ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement?.("content.image", section.id);
              onRequestImageEdit?.(section.id, "content.image");
            }}
            style={{ all: "unset", boxSizing: "border-box" }}
            className="w-full md:w-80 h-72 md:h-96 shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-indigo-700/50 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 text-indigo-300 transition-all cursor-pointer p-6 text-center"
            title="Click to add an About Profile Photo"
          >
            <Camera size={24} className="opacity-80" />
            <span className="text-xs font-bold">+ Add Profile Photo</span>
          </button>
        ) : null}
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
                <div key={i} className="flex items-start gap-3 text-sm opacity-90">
                  <CheckCircle2 size={18} style={{ color: theme.primaryColor }} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span {...sel(`content.highlights.${i}`)}>{h}</span>
                </div>
              ))}
            </div>
          )}

          {/* Social Profiles & Usernames in About Section */}
          <SocialLinksRow socials={socials} theme={theme} sel={sel} className="pt-2" />
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

function PricingSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const plans: any[] = section.content?.plans || [];
  const layout = section.variant || section.content?.layout || "grid";
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="opacity-75">{section.subtitle}</p>}
      </div>

      <div className={
        layout === "list"
          ? "space-y-6 max-w-3xl mx-auto"
          : layout === "compact"
          ? "grid grid-cols-1 md:grid-cols-3 gap-4"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      }>
        {plans.map((p: any, i: number) => (
          <div
            key={i}
            {...sel(`content.plans.${i}`)}
            className={`rounded-3xl border relative flex flex-col justify-between transition-all ${
              layout === "compact" ? "p-5" : "p-8"
            } ${
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
              <h3 {...sel(`content.plans.${i}.name`)} className={`font-bold mb-2 ${layout === "compact" ? "text-xl" : "text-2xl"}`}>{p.name}</h3>
              <p {...sel(`content.plans.${i}.desc`)} className="text-xs opacity-65 mb-6">{p.desc}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span {...sel(`content.plans.${i}.price`)} className={`font-extrabold tracking-tight ${layout === "compact" ? "text-3xl" : "text-4xl"}`} style={{ fontFamily: "var(--font-heading)" }}>
                  {p.price}
                </span>
                <span className="text-xs opacity-60">/ month</span>
              </div>
              <div className="space-y-3 mb-6">
                {(p.features || []).map((f: string, fi: number) => (
                  <div key={fi} className="flex items-center gap-3 text-sm opacity-85">
                    <CheckCircle2 size={16} style={{ color: theme.primaryColor }} aria-hidden="true" />
                    <span {...sel(`content.plans.${i}.features.${fi}`)}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <a
              href={p.url || p.ctaLink || p.buttonUrl || "#"}
              className="w-full py-3 block text-center font-bold text-white shadow-lg transition-all hover:opacity-90 cursor-pointer"
              style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
            >
              <span {...sel(`content.plans.${i}.buttonText`)}>{p.buttonText || p.ctaText || "Get Started"}</span>
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

function DigitalCardSection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const socials = section.content?.socials || {};
  const customLinks = section.content?.customLinks || [];
  const avatar = section.content?.avatar || "";
  const [clickedIdx, setClickedIdx] = useState<number | null>(null);
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);
  const isDark = getIsDarkTheme(theme);

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
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "var(--surface)",
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "var(--border)",
          color: "var(--text)",
          borderRadius: "var(--radius)",
        }}
      >
        {avatar ? (
          <InteractiveImageWrapper
            sectionId={section.id}
            elementKey="content.avatar"
            interactive={interactive}
            onSelectElement={onSelectElement}
            onRequestImageEdit={onRequestImageEdit}
            badgeLabel="Change Avatar"
            badgePosition="bottom-right"
            className="inline-block mx-auto mb-6"
          >
            <img
              {...sel("content.avatar")}
              src={avatar}
              alt={section.title || "Avatar"}
              className="w-28 h-28 rounded-full border-4 object-cover shadow-xl"
              style={{ borderColor: theme.primaryColor }}
            />
          </InteractiveImageWrapper>
        ) : interactive ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectElement?.("content.avatar", section.id);
              onRequestImageEdit?.(section.id, "content.avatar");
            }}
            style={{ all: "unset", boxSizing: "border-box" }}
            className="w-28 h-28 rounded-full flex flex-col items-center justify-center border-2 border-dashed border-indigo-400 bg-indigo-950/40 text-indigo-300 mx-auto mb-6 shadow-xl hover:scale-105 transition-all cursor-pointer group"
            title="Click to upload profile avatar photo"
          >
            <Camera size={22} className="text-indigo-400 group-hover:scale-110 transition-transform mb-1" />
            <span className="text-[10px] font-bold">+ Avatar</span>
          </button>
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
        <p {...sel("subtitle")} className="text-sm opacity-60 mb-8">{section.subtitle}</p>

        <div className="space-y-4">
          {customLinks.map((link: any, i: number) => (
            <a
              key={i}
              {...sel(`content.customLinks.${i}`)}
              href={link.url || "#"}
              onClick={(e) => handleLinkClick(i, link.url, e)}
              className="block w-full p-4 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98] border"
              style={{
                backgroundColor: clickedIdx === i ? theme.primaryColor : "rgba(255, 255, 255, 0.05)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                color: clickedIdx === i ? "white" : "inherit",
                borderRadius: "var(--radius)",
              }}
            >
              {link.text}
            </a>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <SocialLinksRow socials={socials} theme={theme} sel={sel} className="justify-center" />
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];
  const layout = section.variant || section.content?.layout || "grid";
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className={
        layout === "list"
          ? "space-y-6 max-w-4xl mx-auto"
          : layout === "compact"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      }>
        {items.map((item: any, i: number) => {
          const IconComponent = getIconComponent(item.icon, Sparkles);
          return (
            <div
              key={i}
              {...sel(`content.items.${i}`)}
              className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl overflow-hidden flex ${
                layout === "list" ? "flex-col sm:flex-row items-start sm:items-center gap-6 p-6" : "flex-col"
              }`}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--radius)",
              }}
            >
              {item.image && layout !== "compact" && (
                <div className={layout === "list" ? "w-full sm:w-48 h-36 shrink-0 overflow-hidden relative rounded-xl" : "h-44 overflow-hidden relative"}>
                  <InteractiveImageWrapper
                    sectionId={section.id}
                    elementKey={`content.items.${i}.image`}
                    interactive={interactive}
                    onSelectElement={onSelectElement}
                    onRequestImageEdit={onRequestImageEdit}
                    badgeLabel="Change Photo"
                    className="w-full h-full"
                  >
                    <img
                      {...sel(`content.items.${i}.image`)}
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </InteractiveImageWrapper>
                </div>
              )}
              <div className={layout === "list" ? "flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4" : layout === "compact" ? "p-5 flex-1 flex flex-col" : "p-8 flex-1 flex flex-col"}>
                <div className="flex-1">
                  <div
                    className={`rounded-xl flex items-center justify-center shadow-md ${layout === "compact" ? "w-9 h-9 mb-3" : "w-12 h-12 mb-4"}`}
                    style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
                  >
                    <IconComponent size={layout === "compact" ? 18 : 24} />
                  </div>
                  <h3 {...sel(`content.items.${i}.title`)} className={`font-bold ${layout === "compact" ? "text-base mb-1.5" : "text-xl mb-2"}`} style={{ fontFamily: "var(--font-heading)" }}>
                    {item.title}
                  </h3>
                  <p {...sel(`content.items.${i}.desc`)} className={`opacity-75 leading-relaxed ${layout === "compact" ? "text-xs" : "text-sm"}`}>{item.desc}</p>
                </div>
                {(item.buttonText || item.url || item.ctaLink) && (
                  <a
                    href={item.url || item.ctaLink || "#"}
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold hover:underline cursor-pointer shrink-0 ${layout === "list" ? "self-start sm:self-center" : "mt-4"}`}
                    style={{ color: theme.primaryColor }}
                  >
                    <span {...sel(`content.items.${i}.buttonText`)}>{item.buttonText || "Learn More"}</span>
                    <span aria-hidden="true">→</span>
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

function ServicesSection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];
  const layout = section.variant || section.content?.layout || "grid";
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className={
        layout === "list"
          ? "space-y-6 max-w-4xl mx-auto"
          : layout === "compact"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      }>
        {items.map((item: any, i: number) => {
          const IconComponent = getIconComponent(item.icon, Sparkles);
          return (
            <article
              key={i}
              {...sel(`content.items.${i}`)}
              className={`rounded-2xl border backdrop-blur-sm flex overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
                layout === "list" ? "flex-col sm:flex-row items-start sm:items-center gap-6 p-6" : "flex-col"
              }`}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.03)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                borderRadius: "var(--radius)",
              }}
            >
              {item.image && layout !== "compact" && (
                <div className={layout === "list" ? "w-full sm:w-56 h-40 shrink-0 overflow-hidden relative rounded-xl" : "h-52 overflow-hidden relative"}>
                  <InteractiveImageWrapper
                    sectionId={section.id}
                    elementKey={`content.items.${i}.image`}
                    interactive={interactive}
                    onSelectElement={onSelectElement}
                    onRequestImageEdit={onRequestImageEdit}
                    badgeLabel="Change Photo"
                    className="w-full h-full"
                  >
                    <img
                      {...sel(`content.items.${i}.image`)}
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </InteractiveImageWrapper>
                </div>
              )}
              <div className={layout === "list" ? "flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4" : layout === "compact" ? "p-5 flex-1 flex flex-col" : "p-6 flex-1 flex flex-col"}>
                <div className="flex-1">
                  <div
                    className={`rounded-xl flex items-center justify-center shadow-md ${layout === "compact" ? "w-9 h-9 mb-3" : "w-12 h-12 mb-4"}`}
                    style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
                  >
                    <IconComponent size={layout === "compact" ? 18 : 24} />
                  </div>
                  <h3 {...sel(`content.items.${i}.title`)} className={`font-bold ${layout === "compact" ? "text-base mb-1.5" : "text-xl mb-2"}`} style={{ fontFamily: "var(--font-heading)" }}>
                    {item.title}
                  </h3>
                  <p {...sel(`content.items.${i}.desc`)} className={`opacity-75 leading-relaxed ${layout === "compact" ? "text-xs" : "text-sm"}`}>{item.desc}</p>
                </div>
                {(item.buttonText || item.url || item.ctaLink) && (
                  <a
                    href={item.url || item.ctaLink || "#"}
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold hover:underline cursor-pointer shrink-0 ${layout === "list" ? "self-start sm:self-center" : "mt-4"}`}
                    style={{ color: theme.primaryColor }}
                  >
                    <span {...sel(`content.items.${i}.buttonText`)}>{item.buttonText || "Learn More"}</span>
                    <span aria-hidden="true">→</span>
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

function ProductsSection({ section, theme, selectedElementKey, interactive, onAddToCart, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];
  const layout = section.variant || section.content?.layout || "grid";
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className={
        layout === "list"
          ? "space-y-6 max-w-4xl mx-auto"
          : layout === "compact"
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      }>
        {items.map((item: any, i: number) => (
          <div
            key={i}
            {...sel(`content.items.${i}`)}
            className={`rounded-2xl border backdrop-blur-sm flex overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl nexora-card-glow ${
              layout === "list" ? "flex-col sm:flex-row items-start sm:items-center gap-6 p-6" : "flex-col"
            }`}
            style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)", borderRadius: "var(--radius)" }}
          >
            {item.image && (
              <div className={layout === "list" ? "w-full sm:w-48 h-36 shrink-0 overflow-hidden relative rounded-xl" : layout === "compact" ? "h-36 overflow-hidden relative" : "h-52 overflow-hidden relative"}>
                <InteractiveImageWrapper
                  sectionId={section.id}
                  elementKey={`content.items.${i}.image`}
                  interactive={interactive}
                  onSelectElement={onSelectElement}
                  onRequestImageEdit={onRequestImageEdit}
                  badgeLabel="Change Photo"
                  className="w-full h-full"
                >
                  <img
                    {...sel(`content.items.${i}.image`)}
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </InteractiveImageWrapper>
              </div>
            )}
            {item.badge && layout !== "list" && (
              <span
                className="mx-4 mt-4 w-fit px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow"
                style={{ background: theme.primaryColor }}
              >
                {item.badge}
              </span>
            )}
            <div className={layout === "list" ? "flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full" : layout === "compact" ? "p-4 flex-1 flex flex-col justify-between" : "p-6 flex-1 flex flex-col"}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 {...sel(`content.items.${i}.title`)} className={`font-bold ${layout === "compact" ? "text-base" : "text-xl"}`} style={{ fontFamily: "var(--font-heading)" }}>
                    {item.title}
                  </h3>
                  {item.badge && layout === "list" && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow"
                      style={{ background: theme.primaryColor }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <p {...sel(`content.items.${i}.desc`)} className={`opacity-75 leading-relaxed ${layout === "compact" ? "text-xs" : "text-sm"}`}>{item.desc}</p>
              </div>
              <div className={`flex items-center gap-3 ${layout === "list" ? "shrink-0" : "mt-4 justify-between"}`}>
                {item.price && (
                  <span {...sel(`content.items.${i}.price`)} className={`font-extrabold tracking-tight ${layout === "compact" ? "text-lg" : "text-2xl"}`} style={{ fontFamily: "var(--font-heading)", color: theme.primaryColor }}>
                    {item.price}
                  </span>
                )}
                {onAddToCart ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      if (!interactive) {
                        e.preventDefault();
                        onAddToCart({ name: item.title || `Product ${i + 1}`, price: item.price || "$0" });
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow transition-all hover:opacity-90 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
                  >
                    <span {...sel(`content.items.${i}.buttonText`)}>{item.buttonText || "Order Now"}</span>
                  </button>
                ) : (item.buttonText || item.url || item.ctaLink) ? (
                  <a
                    href={item.url || item.ctaLink || "#"}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-white shadow transition-all hover:opacity-90 cursor-pointer"
                    style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
                  >
                    <span {...sel(`content.items.${i}.buttonText`)}>{item.buttonText || "Buy Now"}</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GallerySection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
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
            <InteractiveImageWrapper
              sectionId={section.id}
              elementKey={`content.images.${i}.url`}
              interactive={interactive}
              onSelectElement={onSelectElement}
              onRequestImageEdit={onRequestImageEdit}
              badgeLabel="Change Photo"
              className="w-full h-full"
            >
              <img
                {...sel(`content.images.${i}.url`)}
                src={img.url}
                alt={img.alt || `Gallery image ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </InteractiveImageWrapper>
          </figure>
        ))}
      </div>
    </section>
  );
}

function PortfolioSection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const projects: any[] = section.content?.projects || [];
  const layout = section.variant || section.content?.layout || "grid";
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="mb-14 space-y-2">
        <h2 {...sel("title")} className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="opacity-75">{section.subtitle}</p>}
      </div>

      <div className={
        layout === "list"
          ? "space-y-6 max-w-4xl mx-auto"
          : layout === "compact"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      }>
        {projects.map((p: any, i: number) => (
          <div
            key={i}
            {...sel(`content.projects.${i}`)}
            className={`group overflow-hidden rounded-2xl border backdrop-blur-sm flex justify-between transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl ${
              layout === "list" ? "flex-col sm:flex-row items-stretch" : "flex-col"
            }`}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius)",
            }}
          >
            {p.image && (
              <div className={layout === "list" ? "w-full sm:w-60 h-44 shrink-0 overflow-hidden relative" : layout === "compact" ? "h-36 overflow-hidden relative" : "h-48 overflow-hidden relative"}>
                <InteractiveImageWrapper
                  sectionId={section.id}
                  elementKey={`content.projects.${i}.image`}
                  interactive={interactive}
                  onSelectElement={onSelectElement}
                  onRequestImageEdit={onRequestImageEdit}
                  badgeLabel="Change Photo"
                  className="w-full h-full"
                >
                  <img
                    {...sel(`content.projects.${i}.image`)}
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </InteractiveImageWrapper>
              </div>
            )}
            <div className={layout === "compact" ? "p-4 flex-1 flex flex-col justify-between" : "p-6 flex-1 flex flex-col justify-between"}>
              <div>
                {p.tag && (
                  <span
                    className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ background: `${theme.primaryColor}20`, color: theme.primaryColor }}
                  >
                    {p.tag}
                  </span>
                )}
                <h3 {...sel(`content.projects.${i}.name`)} className={`font-bold mb-1 group-hover:text-indigo-400 transition-colors ${layout === "compact" ? "text-base" : "text-xl"}`}>
                  {p.name}
                </h3>
                <p {...sel(`content.projects.${i}.desc`)} className={`opacity-75 leading-relaxed mb-4 ${layout === "compact" ? "text-xs line-clamp-2" : "text-sm"}`}>{p.desc}</p>
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

function MenuSection({ section, theme, selectedElementKey, interactive, onAddToCart, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
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
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-heading)" }}>
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
                      className="rounded-2xl border backdrop-blur-sm flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl nexora-card-glow"
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.03)", borderColor: "rgba(255, 255, 255, 0.08)", borderRadius: "var(--radius)" }}
                    >
                      {item.image && (
                        <div className="h-48 overflow-hidden relative">
                          <InteractiveImageWrapper
                            sectionId={section.id}
                            elementKey={`content.categories.${ci}.items.${ii}.image`}
                            interactive={interactive}
                            onSelectElement={onSelectElement}
                            onRequestImageEdit={onRequestImageEdit}
                            badgeLabel="Change Photo"
                            className="w-full h-full"
                          >
                            <img
                              {...sel(`content.categories.${ci}.items.${ii}.image`)}
                              src={item.image}
                              alt={item.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            />
                          </InteractiveImageWrapper>
                          {item.badge && (
                            <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow z-10" style={{ background: theme.primaryColor }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 {...sel(`content.categories.${ci}.items.${ii}.name`)} className="font-bold text-lg text-white" style={{ fontFamily: "var(--font-heading)" }}>
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
                        {onAddToCart ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              if (!interactive) {
                                e.preventDefault();
                                onAddToCart({ name: item.name || `Item ${ii + 1}`, price: item.price || "$0" });
                              }
                            }}
                            className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                            style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`, borderRadius: "var(--radius)" }}
                          >
                            <span {...sel(`content.categories.${ci}.items.${ii}.buttonText`)}>{item.buttonText || "Add to Order 🛍️"}</span>
                          </button>
                        ) : (item.url || item.buttonText) ? (
                          <a
                            href={item.url || "#"}
                            className="mt-2 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
                            style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor || theme.primaryColor})`, borderRadius: "var(--radius)" }}
                          >
                            <span {...sel(`content.categories.${ci}.items.${ii}.buttonText`)}>{item.buttonText || "Order Now"}</span>
                          </a>
                        ) : null}
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
                        <InteractiveImageWrapper
                          sectionId={section.id}
                          elementKey={`content.categories.${ci}.items.${ii}.image`}
                          interactive={interactive}
                          onSelectElement={onSelectElement}
                          onRequestImageEdit={onRequestImageEdit}
                          badgeLabel="Change"
                          badgePosition="bottom-right"
                          className="shrink-0"
                        >
                          <img
                            {...sel(`content.categories.${ci}.items.${ii}.image`)}
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            decoding="async"
                            className="w-16 h-16 rounded-xl object-cover shadow-md border border-white/10"
                          />
                        </InteractiveImageWrapper>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span {...sel(`content.categories.${ci}.items.${ii}.name`)} className="font-bold text-base truncate text-white">{item.name}</span>
                          <span {...sel(`content.categories.${ci}.items.${ii}.price`)} className="font-extrabold text-base shrink-0" style={{ color: theme.primaryColor }}>
                            {item.price}
                          </span>
                        </div>
                        {item.desc && <p {...sel(`content.categories.${ci}.items.${ii}.desc`)} className="text-xs opacity-65 truncate mt-0.5">{item.desc}</p>}
                        {onAddToCart ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              if (!interactive) {
                                e.preventDefault();
                                onAddToCart({ name: item.name || `Item ${ii + 1}`, price: item.price || "$0" });
                              }
                            }}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white shadow transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                            style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
                          >
                            <span {...sel(`content.categories.${ci}.items.${ii}.buttonText`)}>{item.buttonText || "+ Add"}</span>
                          </button>
                        ) : (item.url || item.buttonText) ? (
                          <a
                            href={item.url || "#"}
                            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white shadow transition-all hover:opacity-90"
                            style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
                          >
                            <span {...sel(`content.categories.${ci}.items.${ii}.buttonText`)}>{item.buttonText || "Order Now"}</span>
                          </a>
                        ) : null}
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
                        <InteractiveImageWrapper
                          sectionId={section.id}
                          elementKey={`content.categories.${ci}.items.${ii}.image`}
                          interactive={interactive}
                          onSelectElement={onSelectElement}
                          onRequestImageEdit={onRequestImageEdit}
                          badgeLabel="Change"
                          badgePosition="bottom-right"
                          className="shrink-0"
                        >
                          <img
                            {...sel(`content.categories.${ci}.items.${ii}.image`)}
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 rounded-xl object-cover shadow-md border border-white/10"
                          />
                        </InteractiveImageWrapper>
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
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0"
                                style={{ background: theme.primaryColor, borderRadius: "var(--radius)" }}
                              >
                                <span {...sel(`content.categories.${ci}.items.${ii}.buttonText`)}>{item.buttonText || "Order Now"}</span>
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

function TeamSection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const members: any[] = section.content?.members || [];
  const layout = section.variant || section.content?.layout || "grid";
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className={
        layout === "list"
          ? "space-y-4 max-w-3xl mx-auto"
          : layout === "compact"
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      }>
        {members.map((m: any, i: number) => (
          <article
            key={i}
            {...sel(`content.members.${i}`)}
            className={`rounded-2xl border backdrop-blur-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
              layout === "list" ? "flex items-center gap-5 p-4" : ""
            }`}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius)",
            }}
          >
            {m.avatar && (
              <div className={layout === "list" ? "w-16 h-16 rounded-full overflow-hidden shrink-0 relative" : "aspect-square overflow-hidden relative"}>
                <InteractiveImageWrapper
                  sectionId={section.id}
                  elementKey={`content.members.${i}.avatar`}
                  interactive={interactive}
                  onSelectElement={onSelectElement}
                  onRequestImageEdit={onRequestImageEdit}
                  badgeLabel="Change Photo"
                  className="w-full h-full"
                >
                  <img
                    {...sel(`content.members.${i}.avatar`)}
                    src={m.avatar}
                    alt={m.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </InteractiveImageWrapper>
              </div>
            )}
            <div className={layout === "list" ? "flex-1 min-w-0 text-left" : layout === "compact" ? "p-3 text-center" : "p-6 text-center"}>
              <h3 {...sel(`content.members.${i}.name`)} className={`font-bold ${layout === "compact" ? "text-sm truncate" : "text-lg"}`} style={{ fontFamily: "var(--font-heading)" }}>{m.name}</h3>
              <div {...sel(`content.members.${i}.role`)} className={`font-semibold uppercase tracking-wider ${layout === "compact" ? "text-[10px] mt-0.5" : "text-xs mt-1 mb-3"}`} style={{ color: theme.primaryColor }}>
                {m.role}
              </div>
              {m.bio && layout !== "compact" && <p {...sel(`content.members.${i}.bio`)} className="text-sm opacity-70 leading-relaxed">{m.bio}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TestimonialsSection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const items: any[] = section.content?.items || [];
  const layout = section.variant || section.content?.layout || "grid";
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);

  return (
    <section id={section.id} data-section-id={section.id} className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <h2 {...sel("title")} className="text-3xl sm:text-5xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-base sm:text-lg opacity-75">{section.subtitle}</p>}
      </div>

      <div className={
        layout === "list"
          ? "space-y-6 max-w-3xl mx-auto"
          : layout === "compact"
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      }>
        {items.map((t: any, i: number) => (
          <figure
            key={i}
            {...sel(`content.items.${i}`)}
            className={`rounded-2xl border backdrop-blur-sm flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
              layout === "compact" ? "p-5 gap-3" : "p-8"
            }`}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.03)",
              borderColor: "rgba(255, 255, 255, 0.08)",
              borderRadius: "var(--radius)",
            }}
          >
            <blockquote className={`opacity-85 leading-relaxed italic ${layout === "compact" ? "text-xs" : "text-sm md:text-base"}`}>
              <span aria-hidden="true">“</span>
              <span {...sel(`content.items.${i}.quote`)}>{t.quote}</span>
              <span aria-hidden="true">”</span>
            </blockquote>
            <figcaption className="flex items-center gap-3 mt-auto">
              {t.avatar && (
                <InteractiveImageWrapper
                  sectionId={section.id}
                  elementKey={`content.items.${i}.avatar`}
                  interactive={interactive}
                  onSelectElement={onSelectElement}
                  onRequestImageEdit={onRequestImageEdit}
                  badgeLabel="Change"
                  badgePosition="below"
                  className="shrink-0"
                >
                  <img
                    {...sel(`content.items.${i}.avatar`)}
                    src={t.avatar}
                    alt={t.author}
                    className="w-11 h-11 rounded-full object-cover border-2"
                    style={{ borderColor: `${theme.primaryColor}55` }}
                    loading="lazy"
                  />
                </InteractiveImageWrapper>
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

function ContactSection({ section, theme, selectedElementKey, interactive, siteSlug }: SectionRendererProps) {
  const c = section.content || {};
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);
  const formConfig = c.formConfig || {};

  const isFormEnabled = formConfig.enabled !== false;
  const submitText = formConfig.submitButtonText || c.buttonText || "Send Message";

  const isNameRequired = formConfig.nameRequired !== false;
  const isEmailRequired = formConfig.emailRequired !== false;
  const isPhoneEnabled = formConfig.phoneEnabled !== false;
  const isPhoneRequired = !!formConfig.phoneRequired;
  const isMessageEnabled = formConfig.messageEnabled !== false;
  const isMessageRequired = formConfig.messageRequired !== false;

  const namePlaceholder = formConfig.namePlaceholder || `Your Name${isNameRequired ? " *" : " (Optional)"}`;
  const emailPlaceholder = formConfig.emailPlaceholder || `Your Email${isEmailRequired ? " *" : " (Optional)"}`;
  const phonePlaceholder = formConfig.phonePlaceholder || `Phone Number${isPhoneRequired ? " *" : " (Optional)"}`;
  const messagePlaceholder = formConfig.messagePlaceholder || `Your Message...${isMessageRequired ? " *" : " (Optional)"}`;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    honeypot: "",
  });
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [successInfo, setSuccessInfo] = useState<{ message: string; whatsappUrl: string | null; redirectUrl: string | null } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (interactive) return; // Prevent live API post while clicking in the visual editor canvas

    if (isNameRequired && !formData.name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }

    if (isEmailRequired && (!formData.email.trim() || !formData.email.includes("@"))) {
      setErrorMsg("Please provide a valid email address.");
      return;
    }

    if (isPhoneEnabled && isPhoneRequired && !formData.phone.trim()) {
      setErrorMsg("Please enter your phone number.");
      return;
    }

    if (isMessageEnabled && isMessageRequired && !formData.message.trim()) {
      setErrorMsg("Please enter your message.");
      return;
    }

    // Validate any required custom fields
    if (Array.isArray(formConfig.fields)) {
      for (const f of formConfig.fields) {
        if (f.required && (!customFields[f.name] || !customFields[f.name].trim())) {
          setErrorMsg(`Please fill in the ${f.label || f.name} field.`);
          return;
        }
      }
    }

    setSubmitStatus("submitting");
    setErrorMsg(null);

    try {
      const targetSlug = siteSlug || "site";
      const utmParams = getUrlUtmParams();
      const res = await formsApi.submit(targetSlug, {
        name: formData.name || "Anonymous",
        email: formData.email || "no-email@visitor.com",
        phone: formData.phone,
        message: formData.message,
        customData: customFields,
        formId: section.id,
        referrer: typeof document !== "undefined" ? document.referrer : "",
        honeypot: formData.honeypot,
        utm: {
          source: utmParams.utmSource,
          medium: utmParams.utmMedium,
          campaign: utmParams.utmCampaign,
          term: utmParams.utmTerm,
          content: utmParams.utmContent,
        },
      });

      if (res?.success) {
        setSubmitStatus("success");
        setSuccessInfo({
          message: res.message || formConfig.successMessage || "Thank you! Your message has been received.",
          whatsappUrl: res.data?.whatsappUrl || null,
          redirectUrl: res.data?.redirectUrl || null,
        });

        // Directly redirect to WhatsApp without asking the user or delaying
        if (res.data?.whatsappUrl) {
          window.location.href = res.data.whatsappUrl;
          return;
        }

        // Redirect to custom target URL if configured
        if (res.data?.redirectUrl) {
          window.location.href = res.data.redirectUrl;
          return;
        }
      } else {
        throw new Error(res?.message || "Failed to submit message");
      }
    } catch (err: any) {
      setSubmitStatus("error");
      setErrorMsg(err.message || "Something went wrong while sending your message. Please try again.");
    }
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", phone: "", message: "", honeypot: "" });
    setCustomFields({});
    setSubmitStatus("idle");
    setSuccessInfo(null);
    setErrorMsg(null);
  };

  return (
    <section id={section.id} data-section-id={section.id} className="py-12 sm:py-20 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-8 sm:mb-12 space-y-2">
        <h2 {...sel("title")} className="text-2xl sm:text-4xl font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
          {section.title}
        </h2>
        {section.subtitle && <p {...sel("subtitle")} className="text-sm sm:text-base opacity-75">{section.subtitle}</p>}
      </div>

      <div className={`flex flex-wrap ${!isFormEnabled ? "justify-center max-w-md mx-auto" : ""} gap-8 sm:gap-12 items-start`}>
        {/* Contact Info Channels */}
        <div className="space-y-4 sm:space-y-6 flex-[1_1_280px]">
          {c.email && (
            <div
              {...selectOnly("content.email", selectedElementKey)}
              className="flex items-center gap-3.5 sm:gap-4"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                <Mail size={18} style={{ color: theme.primaryColor }} />
              </div>
              <div className="min-w-0">
                <div className="text-xs opacity-60">Email Us</div>
                <a href={`mailto:${c.email}`} className="font-semibold hover:underline truncate block">
                  {c.email}
                </a>
              </div>
            </div>
          )}
          {c.phone && (
            <div {...selectOnly("content.phone", selectedElementKey)} className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                <Phone size={18} style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <div className="text-xs opacity-60">Call Directly</div>
                <a href={`tel:${c.phone}`} className="font-semibold hover:underline">
                  {c.phone}
                </a>
              </div>
            </div>
          )}
          {c.address && (
            <div {...selectOnly("content.address", selectedElementKey)} className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                <MapPin size={18} style={{ color: theme.primaryColor }} />
              </div>
              <div>
                <div className="text-xs opacity-60">Location</div>
                <div className="font-semibold text-sm sm:text-base">{c.address}</div>
              </div>
            </div>
          )}
          {(c.publicWhatsapp || c.whatsapp) && (
            <div className="flex items-center gap-3.5 sm:gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                <MessageCircle size={18} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-xs opacity-60">WhatsApp Chat</div>
                <a
                  href={`https://wa.me/${(c.publicWhatsapp || c.whatsapp).replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-400 hover:underline"
                >
                  {c.publicWhatsapp || c.whatsapp}
                </a>
              </div>
            </div>
          )}

          {/* Social Profiles in Contact Section */}
          <SocialLinksRow
            socials={c.socials || (c.instagram || c.github || c.linkedin || c.twitter ? c : undefined)}
            theme={theme}
            sel={sel}
            className="pt-2"
          />
        </div>

        {/* Interactive Form Card */}
        {isFormEnabled && (
          <div {...sel("form")} className="flex-[1_1_280px] relative rounded-2xl border bg-white/5 backdrop-blur-sm p-4 sm:p-6 overflow-hidden transition-all duration-500 shadow-xl w-full">
            {submitStatus === "success" ? (
              <div className="py-8 px-4 text-center space-y-5 animate-in fade-in zoom-in-95 duration-500">
                {/* Celebratory animated pulse icon */}
                <div className="relative inline-flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
                  <div className="relative w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                    <CheckCircle className="w-9 h-9" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-100">Message Received!</h3>
                  <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                    {successInfo?.message || "Thank you for getting in touch. We will get back to you shortly."}
                  </p>
                </div>

                {successInfo?.whatsappUrl && (
                  <div className="pt-2">
                    <a
                      href={successInfo.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <MessageCircle className="w-4 h-4" /> Open in WhatsApp
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors underline"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Anti-spam honeypot (hidden from real users) */}
                <input
                  type="text"
                  name="user_note_extra"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
                    {errorMsg}
                  </div>
                )}

                {/* Name field */}
                <div>
                  <input
                    type="text"
                    required={isNameRequired}
                    placeholder={namePlaceholder}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={submitStatus === "submitting"}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Email field */}
                <div>
                  <input
                    type="email"
                    required={isEmailRequired}
                    placeholder={emailPlaceholder}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={submitStatus === "submitting"}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                  />
                </div>

                {/* Optional/Compulsory Phone field */}
                {isPhoneEnabled && (
                  <div>
                    <input
                      type="tel"
                      required={isPhoneRequired}
                      placeholder={phonePlaceholder}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={submitStatus === "submitting"}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50 font-mono"
                    />
                  </div>
                )}

                {/* Custom fields if configured */}
                {Array.isArray(formConfig.fields) &&
                  formConfig.fields.map((f: any) => (
                    <div key={f.id || f.name}>
                      <input
                        type={f.type === "tel" ? "tel" : f.type === "email" ? "email" : "text"}
                        required={f.required}
                        placeholder={`${f.label || f.name}${f.required ? " *" : " (Optional)"}`}
                        value={customFields[f.name] || ""}
                        onChange={(e) => setCustomFields({ ...customFields, [f.name]: e.target.value })}
                        disabled={submitStatus === "submitting"}
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                      />
                    </div>
                  ))}

                {/* Message field */}
                {isMessageEnabled && (
                  <div>
                    <textarea
                      rows={4}
                      required={isMessageRequired}
                      placeholder={messagePlaceholder}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      disabled={submitStatus === "submitting"}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 resize-none transition-colors disabled:opacity-50"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitStatus === "submitting"}
                  className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                  style={{ background: theme.primaryColor }}
                >
                  {submitStatus === "submitting" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{submitText}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function FooterSection({ section, theme, selectedElementKey, interactive }: SectionRendererProps) {
  const content = section.content || {};
  const socials = content.socials || (content.instagram || content.github || content.linkedin || content.twitter ? content : {});
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);
  return (
    <footer id={section.id} data-section-id={section.id} className="py-12 px-6 border-t border-white/10 text-center text-xs opacity-80 space-y-4">
      <SocialLinksRow socials={socials} theme={theme} sel={sel} className="justify-center" />
      <p className="opacity-60">© {new Date().getFullYear()} <span {...sel("title")}>{section.title || "Nexora AI"}</span>. All rights reserved.</p>
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
        <p
          // MapPin icon is outside editable span to avoid being captured by innerText on blur
          className="text-center text-sm mb-6 opacity-80 flex items-center justify-center gap-2"
        >
          <MapPin size={16} style={{ color: theme.primaryColor }} aria-hidden="true" />
          <span {...sel("address")}>{c.address}</span>
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
        {...selectOnly("phone", selectedElementKey)}
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
        <p className="text-xs opacity-60 mt-4 flex items-center justify-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
          <span {...sel("availability")}>{c.availability}</span>
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
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline cursor-pointer"
                  style={{ color: theme.primaryColor }}
                >
                  <span {...sel(`content.posts.${i}.buttonText`)}>{post.buttonText || "Read Article"}</span>
                  <span aria-hidden="true">{"\u2192"}</span>
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

function CtaSection({ section, theme, selectedElementKey, interactive, onSelectElement, onRequestImageEdit }: SectionRendererProps) {
  const content = section.content || {};
  const sel = (key: string) => elementSel(key, selectedElementKey, section.id, interactive);
  const isDark = getIsDarkTheme(theme);

  const ctaImage = content.image || content.imageUrl || content.bgImage || content.coverImage;
  const description = content.bio || content.description || content.desc || section.subtitle;

  return (
    <section
      id={section.id}
      data-section-id={section.id}
      className="nexora-cta-section relative py-20 px-6 max-w-6xl mx-auto overflow-hidden"
    >
      <div
        className="nexora-cta-container rounded-3xl p-8 sm:p-14 border backdrop-blur-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl"
        style={{
          backgroundColor: isDark ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.8)",
          borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)",
          borderRadius: "var(--radius)",
        }}
      >
        <div
          className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: theme.primaryColor || "#3B82F6" }}
        />

        <div className="flex-1 space-y-4 text-center lg:text-left z-10">
          {section.badge && (
            <span
              {...sel("badge")}
              className="nexora-cta-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border"
              style={{
                borderColor: `${theme.primaryColor}40`,
                background: `${theme.primaryColor}15`,
                color: theme.primaryColor,
              }}
            >
              {section.badge}
            </span>
          )}

          {section.title && (
            <h2
              {...sel("title")}
              className="nexora-cta-title text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {section.title}
            </h2>
          )}

          {description && (
            <p {...sel("content.bio")} className="nexora-cta-desc text-base sm:text-lg opacity-80 leading-relaxed max-w-xl">
              {description}
            </p>
          )}

          <div className="pt-4 flex flex-wrap gap-3 justify-center lg:justify-start items-center">
            {content.ctaText && (
              <a
                {...sel("content.ctaText")}
                href={content.ctaLink || "#"}
                className="nexora-cta-btn-primary px-8 py-3.5 rounded-xl text-sm font-extrabold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor || "#3B82F6"}, ${theme.secondaryColor || theme.primaryColor || "#8B5CF6"})`,
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
                className="nexora-cta-btn-secondary px-6 py-3.5 rounded-xl text-sm font-bold border transition-all duration-300 hover:bg-white/10"
                style={{
                  borderColor: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)",
                  borderRadius: "var(--radius)",
                }}
              >
                {content.secondaryCtaText}
              </a>
            )}
          </div>
        </div>

        {ctaImage && (
          <div className="nexora-cta-image-wrapper relative shrink-0 z-10 max-w-xs lg:max-w-md w-full">
            <InteractiveImageWrapper
              sectionId={section.id}
              elementKey="content.image"
              interactive={interactive}
              onSelectElement={onSelectElement}
              onRequestImageEdit={onRequestImageEdit}
              badgeLabel="Change Photo"
            >
              <div
                className="nexora-cta-image-card p-3 bg-white/10 dark:bg-slate-900/60 border border-white/20 rounded-2xl shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500"
                style={{ borderRadius: "var(--radius)" }}
              >
                <img
                  {...sel("content.image")}
                  src={ctaImage}
                  alt={section.title || "CTA image"}
                  className="nexora-cta-image w-full h-64 lg:h-72 object-cover rounded-xl shadow-inner"
                  loading="lazy"
                />
                {content.caption && (
                  <p {...sel("content.caption")} className="text-center text-xs opacity-75 mt-2 font-mono">
                    {content.caption}
                  </p>
                )}
              </div>
            </InteractiveImageWrapper>
          </div>
        )}
      </div>
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
  siteSlug?: string;
  onAddToCart?: (item: { name: string; price: string }) => void;
  onSelectElement?: (elementKey: string, sectionId: string) => void;
  onRequestImageEdit?: (sectionId: string, elementKey: string) => void;
}

function RenderSection({ section, theme, selectedElementKey, interactive, siteSlug, onAddToCart, onSelectElement, onRequestImageEdit }: RenderSectionProps) {
  if (section.visible === false) return null;

  const rendererProps = {
    section,
    theme,
    selectedElementKey,
    interactive: !!interactive,
    siteSlug,
    onAddToCart,
    onSelectElement,
    onRequestImageEdit,
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
    case "cta":
      return <CtaSection {...rendererProps} />;
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
  siteSlug?: string;
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
  siteSlug,
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

    const validSnippets: string[] = [];
    const rawSnippets = [cc?.js || "", ...inlineScripts].filter(Boolean);

    for (const snippet of rawSnippets) {
      try {
        // Validate JS syntax before injecting to prevent DOM appendChild SyntaxError
        new Function(snippet);
        validSnippets.push(snippet);
      } catch (err: any) {
        console.warn("[Nexora Custom JS Syntax Error in custom code]:", err?.message);
      }
    }

    if (validSnippets.length === 0) {
      const prev = document.querySelector("script[data-nexora-custom]");
      if (prev) prev.remove();
      return;
    }

    const combinedJs = validSnippets.join("\n;\n");

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

  // Live WhatsApp Ordering Cart for Products / Menu
  const [cart, setCart] = useState<Record<string, { name: string; price: string; count: number }>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (item: { name: string; price: string }) => {
    setCart((prev) => {
      const existing = prev[item.name];
      const count = existing ? existing.count + 1 : 1;
      return { ...prev, [item.name]: { name: item.name, price: item.price, count } };
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartCount = (name: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[name];
      if (!existing) return prev;
      const nextCount = existing.count + delta;
      if (nextCount <= 0) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: { ...existing, count: nextCount } };
    });
  };

  const totalItemCount = Object.values(cart).reduce((sum, item) => sum + item.count, 0);
  const totalPrice = Object.values(cart).reduce((sum, item) => {
    const numeric = parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
    return sum + numeric * item.count;
  }, 0);

  const handleCheckoutWhatsApp = () => {
    let whatsappNum = "";
    for (const s of config.sections || []) {
      const c = s.content || {};
      if (c.whatsapp) { whatsappNum = String(c.whatsapp).replace(/[^0-9]/g, ""); break; }
      if (c.publicWhatsapp) { whatsappNum = String(c.publicWhatsapp).replace(/[^0-9]/g, ""); break; }
      if (c.formConfig?.whatsappNumber) { whatsappNum = String(c.formConfig.whatsappNumber).replace(/[^0-9]/g, ""); break; }
      if (c.phone) { whatsappNum = String(c.phone).replace(/[^0-9]/g, ""); break; }
    }

    const lines = Object.values(cart).map((item) => `• ${item.count}x ${item.name} (${item.price})`);
    const message = `Hello! I would like to place an order from *${config.meta?.title || "your site"}*:\n\n${lines.join("\n")}\n\n*Total: $${totalPrice.toFixed(2)}*\n\nPlease confirm availability and details!`;
    const targetUrl = whatsappNum
      ? `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`${containerClass} min-h-full w-full flex flex-col flex-1 relative`}
      style={buildCssVariables(config.theme, interactive)}
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
      {elementColorCss && <style dangerouslySetInnerHTML={{ __html: elementColorCss }} />}
      {elementStyleCss && <style dangerouslySetInnerHTML={{ __html: elementStyleCss }} />}

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

            const sectionBgImage = section.content?.backgroundImage || (section as any).backgroundImage || (section.type === "hero" ? (section.content?.bgImage || (section as any).bgImage) : null);

            return (
              <div
                key={section.id}
                id={section.id}
                data-section-id={section.id}
                onClick={(e) => {
                  if (!interactive) return;
                  e.stopPropagation();

                  if (onSelectSection) onSelectSection(section.id);

                  const target = (e.target as HTMLElement)?.closest?.("[data-element-key]");
                  if (target) {
                    const elKey = target.getAttribute("data-element-key");
                    if (elKey) {
                      onSelectElement?.(elKey, section.id);

                      const isImage =
                        (e.target as HTMLElement)?.tagName?.toLowerCase() === "img" ||
                        target.tagName?.toLowerCase() === "img" ||
                        (e.target as HTMLElement)?.closest?.("img") !== null ||
                        /image|avatar|photo|logo/i.test(elKey);

                      if (isImage) {
                        onRequestImageEdit?.(section.id, elKey);
                      }
                    }
                  }
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
                style={
                  sectionBgImage && section.type !== "hero"
                    ? {
                        backgroundImage: `url(${sectionBgImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }
                    : undefined
                }
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
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "2px",
                      height: "26px",
                      padding: "0 4px",
                      borderRadius: "6px",
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(71, 85, 105, 0.5)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                      backdropFilter: "blur(8px)",
                      zIndex: 40,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      boxSizing: "border-box",
                    }}
                    className={`absolute top-2 right-3 transition-all duration-150 ${
                      isSelected
                        ? "opacity-100 scale-100 pointer-events-auto"
                        : "opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 pointer-events-none group-hover:pointer-events-auto"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-1 px-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-200" title="Drag to reorder section">
                      <GripVertical size={11} />
                      <span className="font-mono text-[9px] font-bold text-indigo-300 uppercase tracking-wider">
                        {section.type}
                      </span>
                    </div>

                    <div style={{ width: "1px", height: "12px", backgroundColor: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

                    {/* Navbar Logo Edit Button */}
                    {section.type === "navbar" && (
                      <>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectElement?.("content.logoImage", section.id);
                            onRequestImageEdit?.(section.id, "content.logoImage");
                          }}
                          title="Change Navbar Logo Image"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "22px",
                            height: "22px",
                            borderRadius: "4px",
                            color: "#818cf8",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          className="hover:!text-white hover:!bg-indigo-950/80"
                        >
                          <Camera size={12} />
                        </span>
                        <div style={{ width: "1px", height: "12px", backgroundColor: "rgba(255,255,255,0.15)", margin: "0 2px" }} />
                      </>
                    )}

                    {/* Section Background Image Button */}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectElement?.("content.backgroundImage", section.id);
                        onRequestImageEdit?.(section.id, "content.backgroundImage");
                      }}
                      title="Set Section Background Photo"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        color: sectionBgImage ? "#818cf8" : "#94a3b8",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      className="hover:!text-white hover:!bg-slate-800"
                    >
                      <ImageIcon size={12} />
                    </span>

                    <div style={{ width: "1px", height: "12px", backgroundColor: "rgba(255,255,255,0.15)", margin: "0 2px" }} />

                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        const idx = config.sections.findIndex((s) => s.id === section.id);
                        if (idx > 0) moveSection(section.id, config.sections[idx - 1].id);
                      }}
                      title="Move Section Up"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        color: "#94a3b8",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      className="hover:!text-white hover:!bg-slate-800"
                    >
                      <ChevronUp size={12} />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        const idx = config.sections.findIndex((s) => s.id === section.id);
                        if (idx < config.sections.length - 1) moveSection(section.id, config.sections[idx + 1].id);
                      }}
                      title="Move Section Down"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        color: "#94a3b8",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      className="hover:!text-white hover:!bg-slate-800"
                    >
                      <ChevronDown size={12} />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateSection(section.id);
                      }}
                      title="Duplicate Section"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        color: "#94a3b8",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      className="hover:!text-white hover:!bg-slate-800"
                    >
                      <Copy size={12} />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      title="Delete Section"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "22px",
                        height: "22px",
                        borderRadius: "4px",
                        color: "#f87171",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      className="hover:!text-red-300 hover:!bg-red-950/60"
                    >
                      <Trash2 size={12} />
                    </span>
                  </div>
                )}
            <RenderSection
              section={section}
              theme={config.theme}
              selectedElementKey={selectedElementKey}
              interactive={interactive}
              siteSlug={siteSlug || config?.meta?.slug || config?.meta?.id}
              onAddToCart={handleAddToCart}
              onSelectElement={onSelectElement}
              onRequestImageEdit={onRequestImageEdit}
            />
          </div>
        );
      })}

      {/* ─── Floating WhatsApp Order Cart ─── */}
      {totalItemCount > 0 && !interactive && (
        <div className="fixed bottom-5 right-5 z-50 animate-slide-up select-none">
          {isCartOpen ? (
            <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl w-72 text-white space-y-3 mb-2 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white">Order Summary</h4>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {Object.values(cart).map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{item.price}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-1 py-0.5">
                      <button
                        type="button"
                        onClick={() => handleUpdateCartCount(item.name, -1)}
                        className="w-5 h-5 rounded flex items-center justify-center font-bold text-slate-400 hover:text-white"
                      >
                        −
                      </button>
                      <span className="text-xs font-bold font-mono w-4 text-center">{item.count}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateCartCount(item.name, 1)}
                        className="w-5 h-5 rounded flex items-center justify-center font-bold text-slate-400 hover:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total</span>
                <span className="text-base font-black text-white font-mono">${totalPrice.toFixed(2)}</span>
              </div>

              <button
                type="button"
                onClick={handleCheckoutWhatsApp}
                className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <MessageCircle size={14} />
                <span>Place Order via WhatsApp</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="h-10 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle size={14} />
              <span>{totalItemCount} item{totalItemCount !== 1 ? "s" : ""} · View Order</span>
            </button>
          )}
        </div>
      )}

      {(customCode?.html || config.customCode?.html) && (
        <div dangerouslySetInnerHTML={{ __html: customCode?.html || config.customCode?.html || "" }} />
      )}
    </div>
  );
}
