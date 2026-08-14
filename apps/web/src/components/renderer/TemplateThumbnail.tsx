"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { Component, ErrorInfo, ReactNode } from "react";
import { SiteConfigJSON } from "@ai-platform/shared";
import { SiteRenderer } from "./SiteRenderer";
import { LayoutTemplate, Loader2 } from "lucide-react";

// ─── Inline error boundary ─────────────────────────────────────────────────
// Prevents a single bad template preview from crashing the whole grid.
interface BoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}
interface BoundaryState {
  hasError: boolean;
}

class PreviewErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn("[TemplateThumbnail] Preview render failed", error.message, info);
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
  /** Optional fallback height (px). When omitted the preview uses a 16:10 ratio. */
  height?: number;
}

// Fixed standard desktop width for isolated responsive scaling.
// Scaling by (containerWidth / RENDER_WIDTH) guarantees 100% edge-to-edge fit
// without horizontal cropping, aspect ratio distortion, or section overflow.
const RENDER_WIDTH = 1280;
const PAGE_BG = "#090D16";

const FALLBACK_BG = "bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950";

/**
 * Renders an isolated, perfectly scaled preview of the template's HERO / 1st section.
 *
 * Highlights the template's signature hero section (badge, title, CTA, design)
 * scaled 1:1 edge-to-edge across all device widths and aspect ratios.
 */
function TemplateThumbnailBase({ config, name, category, height }: TemplateThumbnailProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [box, setBox] = useState({ width: 0, height: 0 });

  // Extract Hero / Primary section so only the 1st section design is displayed
  const heroConfig = useMemo(() => {
    if (!config || !Array.isArray(config.sections) || config.sections.length === 0) {
      return config;
    }
    const visibleSections = config.sections.filter((s) => s.visible !== false);
    if (visibleSections.length === 0) return config;

    const primarySection =
      visibleSections.find((s) => /hero|main|header|banner|intro/i.test(s.type || s.id || "")) ||
      visibleSections[0];

    return {
      ...config,
      sections: [primarySection],
    };
  }, [config]);

  // Lazy-mount only when card enters viewport
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;

    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setInView(true);
              observer.disconnect();
              break;
            }
          }
        },
        { rootMargin: "240px 0px" }
      );
      observer.observe(node);
      return () => observer.disconnect();
    }

    setInView(true);
  }, []);

  // Track container width/height for exact 1:1 responsive scaling
  useEffect(() => {
    const node = wrapperRef.current;
    if (!node) return;
    if (typeof window === "undefined") return;

    const measure = () =>
      setBox({ width: node.clientWidth, height: node.clientHeight });

    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(node);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const fallback = (
    <div className={`absolute inset-0 flex items-center justify-center ${FALLBACK_BG}`}>
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <LayoutTemplate size={24} className="text-indigo-400 opacity-80" />
        <span className="text-xs font-semibold capitalize tracking-wide text-slate-300">
          {category || name || "Template Preview"}
        </span>
      </div>
    </div>
  );

  const showPreview = inView && heroConfig && box.width > 0 && box.height > 0;

  // Exact 1:1 edge-to-edge horizontal scale
  const scale = box.width > 0 ? box.width / RENDER_WIDTH : 1;
  const innerHeight = box.height > 0 ? Math.ceil(box.height / scale) : 800;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden bg-slate-950 select-none group"
      style={
        height
          ? { minHeight: height, maxHeight: height }
          : { aspectRatio: "16 / 10", width: "100%" }
      }
      aria-hidden="true"
    >
      {!inView ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 animate-pulse">
          <Loader2 size={20} className="text-indigo-500 animate-spin" />
        </div>
      ) : showPreview ? (
        <PreviewErrorBoundary fallback={fallback}>
          <div
            className="pointer-events-none will-change-transform transition-transform duration-500 ease-out group-hover:scale-[1.025]"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: RENDER_WIDTH,
              height: innerHeight,
              backgroundColor: config?.theme?.backgroundColor || PAGE_BG,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <SiteRenderer config={heroConfig} />
          </div>
        </PreviewErrorBoundary>
      ) : (
        fallback
      )}

      {/* Subtle depth inner shadow */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_-16px_24px_-12px_rgba(0,0,0,0.4)]" />

      {/* Subtle hover gradient accent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
}

// Memoized for fast grid scrolling
const TemplateThumbnail = memo(TemplateThumbnailBase);

export { TemplateThumbnail };
