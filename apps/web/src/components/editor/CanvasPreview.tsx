"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "@/store/editorStore";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { ContextToolbar } from "@/components/editor/ContextToolbar";
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Hand,
  MousePointer,
  RotateCcw,
  Maximize2,
} from "lucide-react";

interface CanvasPreviewProps {
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  selectedElementKey?: string | null;
  onSelectElement?: (elementKey: string, sectionId: string) => void;
  onRequestImageEdit?: (sectionId: string, elementKey: string) => void;
}

export function CanvasPreview({
  selectedSectionId,
  onSelectSection,
  selectedElementKey,
  onSelectElement,
  onRequestImageEdit,
}: CanvasPreviewProps) {
  const config = useEditorStore((state) => state.config);
  const customCode = useEditorStore((state) => state.customCode);

  // Displayed state (drives React re-renders only for UI badge & buttons)
  const [displayZoom, setDisplayZoom] = useState(100);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchFeedback, setPinchFeedback] = useState<number | null>(null);
  const [hasPan, setHasPan] = useState(false);

  // Live gesture values — stored in refs so we can update the DOM directly
  // via RAF without triggering React re-renders on every frame.
  const zoomRef = useRef(100);
  const panRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const isGesturing = useRef(false); // pinch or mouse-drag active

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canvasContentRef = useRef<HTMLDivElement>(null);

  // Gesture state
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const isDraggingRef = useRef(false);
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    initialCenter: { x: number; y: number };
    initialPan: { x: number; y: number };
  } | null>(null);

  const pinchFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Apply transform directly to DOM (no React re-render) ─────────────────
  const applyTransform = useCallback((z: number, p: { x: number; y: number }, animate = false) => {
    const el = canvasContentRef.current;
    if (!el) return;

    const cz = Math.min(200, Math.max(30, z));

    if (animate) {
      // Force a reflow so the browser registers the new transition even if
      // the previous gesture left transition:"none" baked in.
      el.style.transition = "none";
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetHeight; // trigger reflow
      el.style.transition =
        "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
    } else {
      el.style.transition = "none";
    }

    el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${cz / 100})`;
    el.style.width = `${100 / (cz / 100)}%`;
  }, []);

  // ── Batch RAF — called every animation frame during gesture ──────────────
  const scheduleApply = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      applyTransform(zoomRef.current, panRef.current, false);
    });
  }, [applyTransform]);

  // ── Commit final values to React state (only after gesture ends) ─────────
  const commitGestureEnd = useCallback(() => {
    const finalZoom = Math.min(200, Math.max(30, Math.round(zoomRef.current)));
    zoomRef.current = finalZoom;
    setDisplayZoom(finalZoom);
    setHasPan(panRef.current.x !== 0 || panRef.current.y !== 0);
    applyTransform(finalZoom, panRef.current, false);
  }, [applyTransform]);

  // ── Reset / Fit helpers ───────────────────────────────────────────────────
  const resetView = useCallback(() => {
    zoomRef.current = 100;
    panRef.current = { x: 0, y: 0 };
    setDisplayZoom(100);
    setHasPan(false);
    applyTransform(100, { x: 0, y: 0 }, true); // animated spring back
  }, [applyTransform]);

  const fitToScreen = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const containerWidth = scrollContainerRef.current.clientWidth;
    const optimalZoom =
      containerWidth < 768
        ? Math.min(100, Math.max(40, Math.round((containerWidth / 420) * 100)))
        : 100;
    zoomRef.current = optimalZoom;
    panRef.current = { x: 0, y: 0 };
    setDisplayZoom(optimalZoom);
    setHasPan(false);
    applyTransform(optimalZoom, { x: 0, y: 0 }, true); // animated spring
  }, [applyTransform]);

  const stepZoom = useCallback((delta: number) => {
    const next = Math.min(200, Math.max(30, Math.round(zoomRef.current + delta)));
    zoomRef.current = next;
    setDisplayZoom(next);
    applyTransform(next, panRef.current, true);
  }, [applyTransform]);

  // ── Auto-scroll to selected section ─────────────────────────────────────
  useEffect(() => {
    if (!selectedSectionId || !scrollContainerRef.current) return;
    const timer = setTimeout(() => {
      const el = scrollContainerRef.current?.querySelector(
        `[id="${selectedSectionId}"], [data-section-id="${selectedSectionId}"]`
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-indigo-500/80", "transition-all", "duration-500");
        const pt = setTimeout(() => el.classList.remove("ring-4", "ring-indigo-500/80"), 1200);
        return () => clearTimeout(pt);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedSectionId]);

  // ── Element pulse ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedElementKey || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current.querySelector(
      `[data-element-key="${selectedElementKey}"]`
    ) as HTMLElement | null;
    if (!el) return;
    el.classList.add("Oninsite-el-pulse");
    const timer = setTimeout(() => el.classList.remove("Oninsite-el-pulse"), 1500);
    return () => clearTimeout(timer);
  }, [selectedElementKey]);

  // ── Touch helpers ────────────────────────────────────────────────────────
  const getTouchDist = (t1: React.Touch | Touch, t2: React.Touch | Touch) =>
    Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

  const getTouchCenter = (t1: React.Touch | Touch, t2: React.Touch | Touch) => ({
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  });

  // ── Touch Event Handlers ─────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dist = getTouchDist(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      touchStateRef.current = {
        initialDist: dist,
        initialZoom: zoomRef.current,
        initialCenter: center,
        initialPan: { ...panRef.current },
      };
      isGesturing.current = true;
      setIsPinching(true);

      if (pinchFeedbackTimerRef.current) clearTimeout(pinchFeedbackTimerRef.current);
      setPinchFeedback(Math.round(zoomRef.current));
    } else if (e.touches.length === 1 && isPanMode) {
      const touch = e.touches[0];
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
      isDraggingRef.current = true;
      isGesturing.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStateRef.current) {
      e.preventDefault();

      const currentDist = getTouchDist(e.touches[0], e.touches[1]);
      const currentCenter = getTouchCenter(e.touches[0], e.touches[1]);

      // Use raw float — no rounding during gesture for glass-smooth pinch
      const scaleFactor = currentDist / touchStateRef.current.initialDist;
      const rawZoom = touchStateRef.current.initialZoom * scaleFactor;
      const newZoom = Math.min(200, Math.max(30, rawZoom));

      const dx = currentCenter.x - touchStateRef.current.initialCenter.x;
      const dy = currentCenter.y - touchStateRef.current.initialCenter.y;

      // Write directly to refs — no setState → no re-render → no jank
      zoomRef.current = newZoom;
      panRef.current = {
        x: touchStateRef.current.initialPan.x + dx,
        y: touchStateRef.current.initialPan.y + dy,
      };

      scheduleApply();

      // Badge feedback (throttled via ref)
      setPinchFeedback(Math.round(newZoom));

    } else if (e.touches.length === 1 && isPanMode && dragStartRef.current) {
      e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.x;
      const dy = touch.clientY - dragStartRef.current.y;

      panRef.current = {
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      };
      scheduleApply();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      touchStateRef.current = null;
      isGesturing.current = false;
      setIsPinching(false);
      commitGestureEnd();

      if (pinchFeedbackTimerRef.current) clearTimeout(pinchFeedbackTimerRef.current);
      pinchFeedbackTimerRef.current = setTimeout(() => setPinchFeedback(null), 900);
    }
    if (e.touches.length === 0) {
      dragStartRef.current = null;
      isDraggingRef.current = false;
      isGesturing.current = false;
    }
  };

  // ── Mouse Drag Handlers ─────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const isMiddleClick = e.button === 1;
    const isPanDrag = isPanMode && e.button === 0;
    if (isMiddleClick || isPanDrag) {
      e.preventDefault();
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: panRef.current.x,
        panY: panRef.current.y,
      };
      isDraggingRef.current = true;
      isGesturing.current = true;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !dragStartRef.current) return;
    e.preventDefault();
    panRef.current = {
      x: dragStartRef.current.panX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.panY + (e.clientY - dragStartRef.current.y),
    };
    scheduleApply();
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      isGesturing.current = false;
      dragStartRef.current = null;
      commitGestureEnd();
    }
  };

  // ── Ctrl/Meta + Wheel Zoom ───────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // Proportional delta — feels like native browser zoom
      const factor = e.deltaY < 0 ? 1.06 : 0.94;
      const newZoom = Math.min(200, Math.max(30, zoomRef.current * factor));
      zoomRef.current = newZoom;
      scheduleApply();

      // Debounce commit to React state
      if (pinchFeedbackTimerRef.current) clearTimeout(pinchFeedbackTimerRef.current);
      setPinchFeedback(Math.round(newZoom));
      pinchFeedbackTimerRef.current = setTimeout(() => {
        commitGestureEnd();
        setPinchFeedback(null);
      }, 600);
    }
  };

  // ── Spacebar Pan Toggle ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        !(document.activeElement as HTMLElement)?.isContentEditable
      ) {
        setIsPanMode(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsPanMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // ── Cancel pending RAF on unmount ────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (pinchFeedbackTimerRef.current) clearTimeout(pinchFeedbackTimerRef.current);
    };
  }, []);

  return (
    <div className="flex-1 h-full w-full bg-slate-950 flex flex-col relative overflow-hidden select-none">
      {/* Context-Aware Top Formatting Bar */}
      <ContextToolbar
        scrollRef={scrollContainerRef}
        onRequestImageEdit={onRequestImageEdit}
      />

      {/* Pinch/zoom feedback badge */}
      {pinchFeedback !== null && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none bg-indigo-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-2xl backdrop-blur animate-fade-in flex items-center gap-1.5">
          <ZoomIn size={13} />
          <span>Zoom: {pinchFeedback}%</span>
        </div>
      )}

      {/* Canvas Workspace */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isPanMode ? (isDraggingRef.current ? "grabbing" : "grab") : "default",
          touchAction: isPanMode || isPinching ? "none" : "pan-y",
          backgroundColor: "#060a14",
          backgroundImage: "radial-gradient(circle, rgba(148,163,184,0.12) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
        className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative"
      >
        {config ? (
          <div
            ref={canvasContentRef}
            style={{
              // Initial values — gesture handler will override via applyTransform()
              transform: `translate3d(0px, 0px, 0) scale(1)`,
              transformOrigin: "top center",
              width: "100%",
              minHeight: "100%",
              // Use smooth cubic-bezier only when not gesturing (button clicks, reset, fit)
              transition: "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              // GPU-composite the transform — keeps it off the main thread
              willChange: "transform",
              backfaceVisibility: "hidden",
            }}
            className="origin-top"
          >
            <SiteRenderer
              config={config}
              customCode={customCode}
              selectedSectionId={selectedSectionId}
              onSelectSection={onSelectSection}
              selectedElementKey={selectedElementKey}
              onSelectElement={onSelectElement}
              onRequestImageEdit={onRequestImageEdit}
              interactive={true}
            />
          </div>
        ) : (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center text-slate-500 gap-3">
            <Layers size={40} className="opacity-30" />
            <p className="text-sm font-medium">No site loaded.</p>
          </div>
        )}
      </div>

      {/* Floating Canvas Controls */}
      {config && (
        <div className="absolute bottom-20 md:bottom-4 left-3 md:left-4 z-30 flex items-center gap-1 bg-slate-900/95 border border-slate-700/80 rounded-full px-2 py-1 text-xs text-slate-300 shadow-2xl backdrop-blur-md select-none touch-manipulation">
          {/* Pan / Edit Toggle */}
          <button
            type="button"
            onClick={() => setIsPanMode((p) => !p)}
            className={`p-1.5 rounded-full transition-all ${
              isPanMode
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title={isPanMode ? "Pan Mode — drag canvas freely" : "Switch to Pan Mode"}
          >
            {isPanMode ? <Hand size={13} /> : <MousePointer size={13} />}
          </button>

          <div className="w-px h-3.5 bg-slate-800 mx-0.5" />

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => stepZoom(-10)}
            disabled={displayZoom <= 30}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Zoom Out (-10%)"
          >
            <ZoomOut size={13} />
          </button>

          {/* Reset Zoom */}
          <button
            type="button"
            onClick={resetView}
            className="px-1.5 font-mono text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
            title="Reset to 100%"
          >
            {displayZoom}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => stepZoom(10)}
            disabled={displayZoom >= 200}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Zoom In (+10%)"
          >
            <ZoomIn size={13} />
          </button>

          {/* Fit to Screen */}
          <button
            type="button"
            onClick={fitToScreen}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fit to Screen"
          >
            <Maximize2 size={12} />
          </button>

          {/* Reset Pan */}
          {hasPan && (
            <button
              type="button"
              onClick={() => {
                panRef.current = { x: 0, y: 0 };
                setHasPan(false);
                applyTransform(zoomRef.current, { x: 0, y: 0 }, true);
              }}
              className="p-1 rounded-full text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              title="Reset Pan to Center"
            >
              <RotateCcw size={12} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
