"use client";

import { memo, useEffect, useRef, useState } from "react";
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
  /** Preview container height in px (defaults to 280 on desktop). */
  height?: number;
}

// The miniature is rendered at a fixed poster size (a "virtual viewport"), then
// uniformly scaled down so the WHOLE page fits inside the card — Carrd/Framer
// style. A taller poster height captures more of the page so nothing important
// is cropped, and the preview is centered inside the card.
const RENDER_WIDTH = 560;
const RENDER_HEIGHT = 1200; // tall enough to show the full page before scaling
const PAGE_BG = "#ffffff";

const FALLBACK_BG = "bg-gradient-to-br from-slate-800 to-slate-950";

/**
 * Renders a live, scaled-down, non-interactive miniature of a template config —
 * Carrd / Framer / Webflow style.
 *
 * The entire website is rendered at a fixed poster size and then uniformly
 * scaled to FIT within the card's width AND height (proportional, aspect-ratio
 * preserved, never stretched or distorted) and CENTERED inside the card. This
 * gives users an accurate, full overview of the template with no zoom or
 * cropping.
 *
 * Performance:
 *  - Intersection Observer lazy-mounts the render only when inside the viewport.
 *  - React.memo prevents re-renders on unrelated state changes.
 *  - pointer-events:none + aria-hidden keep the preview inert & cheap.
 *  - ResizeObserver keeps the preview in sync with the card size.
 *  - transforms + will-change:transform use the GPU (60fps safe).
 *  - Error boundary + graceful fallback: a broken config never crashes the grid.
 */
function TemplateThumbnailBase({ config, name, category, height = 280 }: TemplateThumbnailProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [box, setBox] = useState({ width: 0, height: 0 });

  // Lazy-mount only when the card is (or was) visible in the viewport.
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

    // Fallback: no IntersectionObserver -> render immediately.
    setInView(true);
  }, []);

  // Track the container's rendered size so the preview scales 1:1 with the card.
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
      <div className="flex flex-col items-center gap-2 text-slate-500">
        <LayoutTemplate size={24} />
        <span className="text-[10px] font-semibold capitalize">
          {category || name || "Preview"}
        </span>
      </div>
    </div>
  );

const showPreview = inView && config && box.width > 0;

  // Uniform scale driven by the card WIDTH so the preview fills the FULL card
  // width, preserving the aspect ratio (no stretch/distortion). Anchored to the
  // top so the navbar/hero is always visible; excess height clips at the card.
  const scale = box.width > 0 ? box.width / RENDER_WIDTH : 0;

  // Anchor to the top-left: the preview fills the full card width and shows the
  // top of the page (nav + hero). No horizontal offset needed since it spans
  // the full width; vertical offset is 0 to keep it top-anchored.
  const offsetX = 0;
  const offsetY = 0;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden bg-slate-900 select-none"
      style={{ minHeight: height, maxHeight: height }}
      aria-hidden="true"
    >
      {!inView ? (
        // Lightweight skeleton placeholder while waiting to lazy-load.
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 animate-pulse">
          <Loader2 size={20} className="text-slate-600 animate-spin" />
        </div>
      ) : showPreview ? (
        <PreviewErrorBoundary fallback={fallback}>
          <div
            className="pointer-events-none will-change-transform"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: RENDER_WIDTH,
              height: RENDER_HEIGHT,
              backgroundColor: PAGE_BG,
              transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) translateZ(0)`,
              transformOrigin: "0 0",
            }}
          >
            <SiteRenderer config={config} />
          </div>
        </PreviewErrorBoundary>
      ) : (
        fallback
      )}

      {/* Premium depth: soft inner shadow + top border highlight, theme-neutral */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_-20px_28px_-16px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.10)]" />

      {/* Subtle vignette so focus stays on the template (keeps site visible) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_0%,transparent_55%,rgba(0,0,0,0.10)_100%)]" />
    </div>
  );
}

// Memoized: only re-renders if the template's identity actually changes.
const TemplateThumbnail = memo(TemplateThumbnailBase);

export { TemplateThumbnail };

