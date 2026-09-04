"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Component, ErrorInfo, ReactNode } from "react";
import { SiteConfigJSON } from "@ai-platform/shared";
import { SiteRenderer } from "./SiteRenderer";
import { LayoutTemplate, Loader2 } from "lucide-react";

// ─── Error boundary ────────────────────────────────────────────────────────
interface BoundaryProps { fallback: ReactNode; children: ReactNode; }
interface BoundaryState { hasError: boolean; }

class PreviewErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };
  static getDerivedStateFromError(): BoundaryState { return { hasError: true }; }
  componentDidCatch(error: Error) {
    if (typeof window !== "undefined") {
      console.warn("[TemplateThumbnail] render failed", error.message);
    }
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── Props ─────────────────────────────────────────────────────────────────
export interface TemplateThumbnailProps {
  config?: SiteConfigJSON;
  name?: string;
  category?: string;
  height?: number;
}

/**
 * Desktop viewport width. The iframe is this wide internally, so
 * every CSS media query / Tailwind responsive class evaluates as if
 * the user is on a 1280px desktop — even on a 360px Android phone.
 */
const CANVAS_W = 1280;
const CANVAS_H = 900;
const PAGE_BG = "#0B1120";
const FALLBACK_BG = "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950";

/**
 * IframeCanvas — renders React children inside an isolated iframe.
 *
 * The iframe has its own viewport (1280px wide), so CSS media queries
 * and Tailwind responsive prefixes (md:, lg:, xl:) all evaluate at
 * desktop width. Parent stylesheets are cloned into the iframe head
 * so all CSS classes work identically.
 */
function IframeCanvas({
  children,
  canvasWidth,
  canvasHeight,
  scale,
  bgColor,
}: {
  children: ReactNode;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  bgColor: string;
}) {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const didInit = useRef(false);

  const handleLoad = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || didInit.current) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    const head = doc.head || doc.getElementsByTagName("head")[0];
    const body = doc.body || doc.getElementsByTagName("body")[0];
    if (!head || !body) return;

    didInit.current = true;

    // ── Set base URL so relative stylesheet and asset links resolve ──
    try {
      if (typeof window !== "undefined") {
        const baseEl = doc.createElement("base");
        baseEl.href = `${window.location.origin}/`;
        head.appendChild(baseEl);
      }
    } catch {
      // ignore
    }

    // ── Copy ALL parent stylesheets into the iframe ──────────────────
    // This ensures Tailwind classes, custom CSS, Google Fonts, etc.
    // all work identically inside the iframe.
    try {
      const parentStyles = document.querySelectorAll(
        'style, link[rel="stylesheet"]'
      );
      parentStyles.forEach((el) => {
        try {
          head.appendChild(el.cloneNode(true));
        } catch {
          // cross-origin link tags may fail to clone — skip silently
        }
      });
    } catch {
      // fallback
    }

    // Also copy document.styleSheets cssRules directly to avoid any network delay
    try {
      const styleSheets = Array.from(document.styleSheets);
      const inlineCssTag = doc.createElement("style");
      let combinedRules = "";
      styleSheets.forEach((sheet) => {
        try {
          const rules = Array.from((sheet as CSSStyleSheet).cssRules || []);
          rules.forEach((r) => { combinedRules += r.cssText + "\n"; });
        } catch {
          // cross-origin stylesheets cannot be read
        }
      });
      if (combinedRules) {
        inlineCssTag.textContent = combinedRules;
        head.appendChild(inlineCssTag);
      }
    } catch {
      // fallback
    }

    // ── Base reset styles for the iframe body ───────────────────────
    try {
      const resetStyle = doc.createElement("style");
      resetStyle.textContent = `
        html, body {
          margin: 0;
          padding: 0;
          width: ${canvasWidth}px;
          min-height: ${canvasHeight}px;
          overflow: hidden;
          background: ${bgColor};
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        *, *::before, *::after { box-sizing: border-box; }
        ::-webkit-scrollbar { display: none; }
      `;
      head.appendChild(resetStyle);
    } catch {
      // fallback
    }

    // ── Mount point for React portal ────────────────────────────────
    let mount = doc.getElementById("tmb-root");
    if (!mount) {
      try {
        mount = doc.createElement("div");
        mount.id = "tmb-root";
        mount.style.width = `${canvasWidth}px`;
        mount.style.minHeight = `${canvasHeight}px`;
        mount.style.overflow = "hidden";
        body.appendChild(mount);
      } catch {
        mount = null;
      }
    }
    if (mount) {
      setMountNode(mount);
    }
  }, [canvasWidth, canvasHeight, bgColor]);

  // Trigger init on mount (about:blank loads synchronously)
  useEffect(() => {
    // Small delay to let iframe document become available
    const t = setTimeout(handleLoad, 50);
    return () => clearTimeout(t);
  }, [handleLoad]);

  return (
    <>
      <iframe
        ref={iframeRef}
        title="preview"
        tabIndex={-1}
        aria-hidden="true"
        srcDoc="<!DOCTYPE html><html><head></head><body></body></html>"
        onLoad={handleLoad}
        sandbox="allow-same-origin"
        className="pointer-events-none border-0 select-none block transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: canvasWidth,
          height: canvasHeight,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          colorScheme: "normal",
        }}
      />
      {mountNode && createPortal(children, mountNode)}
    </>
  );
}

/**
 * TemplateThumbnail — pixel-perfect miniature desktop preview.
 *
 * Uses an iframe so the template's CSS media queries see a 1280px
 * viewport width on ALL devices (mobile, tablet, desktop). The result
 * is always a tiny desktop screenshot — never a collapsed mobile layout.
 */
function TemplateThumbnailBase({ config, name, category, height }: TemplateThumbnailProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [box, setBox] = useState({ width: 0, height: 0 });

  // Use all visible sections for tall/scrollable previews; limit to 3 for small thumbnails
  const isScrollable = height !== undefined && height > 600;
  const heroConfig = useMemo(() => {
    if (!config || !Array.isArray(config.sections) || config.sections.length === 0) {
      return config;
    }
    const visible = config.sections.filter((s) => s.visible !== false);
    if (visible.length === 0) return config;
    if (isScrollable) return { ...config, sections: visible };

    const isBio = category === "link_in_bio" || config.meta?.category === "link_in_bio";
    if (isBio) {
      // Prioritize creator header/hero and the links section so the template card prominently displays link buttons!
      const heroSec = visible.find((s) => s.type === "hero" || s.type === "navbar" || s.type === "digital_card");
      const linksSec = visible.find((s) => s.type === "links");
      if (heroSec && linksSec && heroSec.id !== linksSec.id) {
        return { ...config, sections: [heroSec, linksSec] };
      }
      if (linksSec) {
        return { ...config, sections: [linksSec] };
      }
    }

    return { ...config, sections: visible.slice(0, 3) };
  }, [config, isScrollable, category]);

  // Lazy-mount
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            setInView(true);
            obs.disconnect();
          }
        },
        { rootMargin: "200px 0px" }
      );
      obs.observe(node);
      return () => obs.disconnect();
    }
    setInView(true);
  }, []);

  // Track wrapper size
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || typeof window === "undefined") return;
    const measure = () => setBox({ width: node.clientWidth, height: node.clientHeight });
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(node);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const bg = config?.theme?.backgroundColor || PAGE_BG;

  const fallback = (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: bg }}>
      <div className="flex flex-col items-center gap-2" style={{ color: config?.theme?.primaryColor || "#6366f1" }}>
        <LayoutTemplate size={24} className="opacity-80" />
        <span className="text-xs font-semibold capitalize tracking-wide opacity-90">
          {category || name || "Template Preview"}
        </span>
      </div>
    </div>
  );

  const ready = inView && heroConfig && box.width > 0 && box.height > 0;
  const scale = box.width > 0 ? box.width / CANVAS_W : 0.25;
  // For scrollable tall previews, render the full height; otherwise use CANVAS_H default
  const canvasHeight = (isScrollable && height) ? height : CANVAS_H;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden select-none group"
      style={{
        ...(height
          ? { minHeight: height, maxHeight: height }
          : { aspectRatio: "16 / 10", width: "100%" }),
        backgroundColor: bg,
      }}
      aria-hidden="true"
    >
      {!ready ? (
        !inView ? (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse" style={{ backgroundColor: bg }}>
            <Loader2 size={20} className="text-indigo-500 animate-spin" />
          </div>
        ) : (
          fallback
        )
      ) : (
        <PreviewErrorBoundary fallback={fallback}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit" }}>
            <IframeCanvas
              canvasWidth={CANVAS_W}
              canvasHeight={canvasHeight}
              scale={scale}
              bgColor={bg}
            >
              <SiteRenderer config={heroConfig} />
            </IframeCanvas>
          </div>
        </PreviewErrorBoundary>
      )}

      {/* Depth shadow */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_-20px_30px_-12px_rgba(0,0,0,0.3)]" />

      {/* Subtle hover gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

const TemplateThumbnail = memo(TemplateThumbnailBase);
export { TemplateThumbnail };
