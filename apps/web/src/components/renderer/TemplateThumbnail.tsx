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
  /** Optional fallback height (px). When omitted the preview uses a wide 16:9 ratio. */
  height?: number;
}

// The miniature is rendered at a real desktop resolution (1440×900) and then
// uniformly scaled DOWN to fit the card WIDTH. This reproduces the actual
// desktop first viewport — from the top navigation through the main hero —
// exactly as it would appear on a real monitor. Nothing is re-layed-out into a
// card or mobile composition; the finished website is simply scaled to fit.
const RENDER_WIDTH = 1440;
const RENDER_HEIGHT = 900; // ≈ desktop first viewport
const PAGE_BG = "#ffffff";

const FALLBACK_BG = "bg-gradient-to-br from-slate-800 to-slate-950";

/**
 * Renders an authentic, scaled-down desktop screenshot of a template config —
 * the way the finished website actually looks on a desktop monitor.
 *
 * The site is rendered at 1440×900 and uniformly scaled to fill the card WIDTH
 * (proportional, aspect-ratio preserved, never stretched), anchored to the top
 * so the desktop navigation and hero are always visible — reproducing the real
 * first viewport rather than a narrow portrait crop.
 *
 * Performance:
 *  - Intersection Observer lazy-mounts the render only when inside the viewport.
 *  - React.memo prevents re-renders on unrelated state changes.
 *  - pointer-events:none + aria-hidden keep the preview inert & cheap.
 *  - ResizeObserver keeps the preview in sync with the card width.
 *  - transforms + will-change:transform use the GPU (60fps safe).
 *  - Error boundary + graceful fallback: a broken config never crashes the grid.
 */
function TemplateThumbnailBase({ config, name, category, height }: TemplateThumbnailProps) {
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

const showPreview = inView && config && box.width > 0 && box.height > 0;

  // "Cover" scaling: scale by the LARGER of the width/height ratios so the
  // desktop render (1440×900) ALWAYS fills the entire card area on every device
  // and card size — no empty gaps, no clipping on the sides. The overflow is
  // distributed evenly by centering, and the preview is anchored toward the top
  // so the nav + hero (first viewport) remain visible.
  const scaleX = box.width > 0 ? box.width / RENDER_WIDTH : 0;
  const scaleY = box.height > 0 ? box.height / RENDER_HEIGHT : 0;
  const scale = Math.max(scaleX, scaleY);

  // Center the scaled render both ways so overfill is split symmetrically.
  const offsetX = (box.width - RENDER_WIDTH * scale) / 2;
  const offsetY = (box.height - RENDER_HEIGHT * scale) / 2;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full overflow-hidden bg-slate-900 select-none"
      style={
        height
          ? { minHeight: height, maxHeight: height }
          : { aspectRatio: "16 / 9", width: "100%" }
      }
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
