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

  const [zoomLevel, setZoomLevel] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [pinchFeedback, setPinchFeedback] = useState<number | null>(null);

  // Gesture refs
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canvasContentRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    initialCenter: { x: number; y: number };
    initialPan: { x: number; y: number };
  } | null>(null);

  const resetView = useCallback(() => {
    setZoomLevel(100);
    setPan({ x: 0, y: 0 });
  }, []);

  const fitToScreen = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const containerWidth = scrollContainerRef.current.clientWidth;
    // Base width of site canvas is around 1200px or full container
    if (containerWidth < 768) {
      const optimalZoom = Math.min(100, Math.max(40, Math.round((containerWidth / 420) * 100)));
      setZoomLevel(optimalZoom);
    } else {
      setZoomLevel(100);
    }
    setPan({ x: 0, y: 0 });
  }, []);

  // Auto-scroll to a section whenever it becomes selected (including after add)
  useEffect(() => {
    if (!selectedSectionId || !scrollContainerRef.current) return;

    // Allow React to finish painting the newly added section DOM node
    const timer = setTimeout(() => {
      const el = scrollContainerRef.current?.querySelector(
        `[id="${selectedSectionId}"], [data-section-id="${selectedSectionId}"]`
      ) as HTMLElement | null;

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-indigo-500/80", "transition-all", "duration-500");
        const pulseTimer = setTimeout(() => {
          el.classList.remove("ring-4", "ring-indigo-500/80");
        }, 1200);
        return () => clearTimeout(pulseTimer);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedSectionId]);

  // Pulse animation on exact clicked element for visual feedback
  useEffect(() => {
    if (!selectedElementKey || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current.querySelector(
      `[data-element-key="${selectedElementKey}"]`
    ) as HTMLElement | null;
    if (!el) return;
    el.classList.add("nexora-el-pulse");
    const timer = setTimeout(() => {
      el.classList.remove("nexora-el-pulse");
    }, 1500);
    return () => clearTimeout(timer);
  }, [selectedElementKey]);

  // ── Multi-Touch Pinch-to-Zoom & 2D Free Pan Handlers ───────────────────────
  const getTouchDistance = (t1: React.Touch | Touch, t2: React.Touch | Touch) => {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
  };

  const getTouchCenter = (t1: React.Touch | Touch, t2: React.Touch | Touch) => {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    };
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Pinch gesture start
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getTouchCenter(e.touches[0], e.touches[1]);
      touchStateRef.current = {
        initialDist: dist,
        initialZoom: zoomLevel,
        initialCenter: center,
        initialPan: { ...pan },
      };
      setIsPinching(true);
      setPinchFeedback(zoomLevel);
    } else if (e.touches.length === 1 && isPanMode) {
      // 1-finger pan start if Pan Mode is enabled
      const touch = e.touches[0];
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && touchStateRef.current) {
      // Multi-touch pinch & pan
      e.preventDefault();
      const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
      const currentCenter = getTouchCenter(e.touches[0], e.touches[1]);

      const scaleFactor = currentDist / touchStateRef.current.initialDist;
      const rawNewZoom = touchStateRef.current.initialZoom * scaleFactor;
      // Clamp zoom smoothly between 30% and 200%
      const newZoom = Math.min(200, Math.max(30, Math.round(rawNewZoom)));

      // Calculate 2-finger pan delta
      const deltaX = currentCenter.x - touchStateRef.current.initialCenter.x;
      const deltaY = currentCenter.y - touchStateRef.current.initialCenter.y;

      setZoomLevel(newZoom);
      setPan({
        x: touchStateRef.current.initialPan.x + deltaX,
        y: touchStateRef.current.initialPan.y + deltaY,
      });
      setPinchFeedback(newZoom);
    } else if (e.touches.length === 1 && isPanMode && dragStartRef.current) {
      // 1-finger pan move
      e.preventDefault();
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      setPan({
        x: dragStartRef.current.panX + deltaX,
        y: dragStartRef.current.panY + deltaY,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length < 2) {
      touchStateRef.current = null;
      setIsPinching(false);
      setTimeout(() => setPinchFeedback(null), 800);
    }
    if (e.touches.length === 0) {
      dragStartRef.current = null;
      setIsDragging(false);
    }
  };

  // ── Desktop Mouse Drag & Wheel Zoom Handlers ──────────────────────────────
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Enable dragging if Pan Mode is active or Middle mouse button / Spacebar is held
    const isMiddleClick = e.button === 1;
    const isPanDrag = isPanMode && e.button === 0;

    if (isMiddleClick || isPanDrag) {
      e.preventDefault();
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    e.preventDefault();
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + deltaX,
      y: dragStartRef.current.panY + deltaY,
    });
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
    setIsDragging(false);
  };

  // Ctrl + Wheel to zoom & trackpad pinch support
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 5 : -5;
      setZoomLevel((z) => Math.min(200, Math.max(30, z + zoomDelta)));
      setPinchFeedback((z) => Math.min(200, Math.max(30, (z || zoomLevel) + zoomDelta)));
      setTimeout(() => setPinchFeedback(null), 800);
    }
  };

  // Keyboard Spacebar for momentary pan tool toggle
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
      if (e.code === "Space") {
        setIsPanMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className="flex-1 h-full w-full bg-slate-950 flex flex-col relative overflow-hidden select-none">
      {/* Context-Aware Top Formatting Bar */}
      <ContextToolbar
        scrollRef={scrollContainerRef}
        onRequestImageEdit={onRequestImageEdit}
      />

      {/* Pinch feedback indicator badge */}
      {pinchFeedback !== null && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none bg-indigo-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-2xl backdrop-blur animate-fade-in flex items-center gap-1.5">
          <ZoomIn size={13} />
          <span>Zoom: {pinchFeedback}%</span>
        </div>
      )}

      {/* Full-width Direct Editable Preview Workspace */}
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
          cursor: isPanMode ? (isDragging ? "grabbing" : "grab") : "default",
          touchAction: isPanMode || isPinching ? "none" : "pan-y",
        }}
        className="flex-1 w-full h-full overflow-y-auto overflow-x-auto bg-slate-950 custom-scrollbar relative"
      >
        {config ? (
          <div
            ref={canvasContentRef}
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
              width: zoomLevel !== 100 ? `${100 / (zoomLevel / 100)}%` : "100%",
              minHeight: "100%",
              transition: isDragging || isPinching ? "none" : "transform 0.12s ease-out, width 0.12s ease-out",
              willChange: "transform",
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

      {/* Floating Canvas Controls (Zoom, Free Pan & Reset) - Positioned at bottom-left to avoid overlap with AI Assistant */}
      {config && (
        <div className="absolute bottom-20 md:bottom-4 left-3 md:left-4 z-30 flex items-center gap-1 bg-slate-900/95 border border-slate-700/80 rounded-full px-2 py-1 text-xs text-slate-300 shadow-2xl backdrop-blur-md select-none touch-manipulation">
          {/* Pan / Edit Tool Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsPanMode((p) => !p)}
            className={`p-1.5 rounded-full transition-all ${
              isPanMode
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
            title={isPanMode ? "Pan Mode Active (Drag canvas freely)" : "Switch to Pan Mode"}
          >
            {isPanMode ? <Hand size={13} /> : <MousePointer size={13} />}
          </button>

          <div className="w-px h-3.5 bg-slate-800 mx-0.5" />

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(30, z - 10))}
            disabled={zoomLevel <= 30}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Zoom Out (-10%)"
          >
            <ZoomOut size={13} />
          </button>

          {/* Reset Zoom & Center */}
          <button
            type="button"
            onClick={resetView}
            className="px-1.5 font-mono text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
            title="Reset Zoom to 100% & Center (Tap to reset)"
          >
            {zoomLevel}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
            disabled={zoomLevel >= 200}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Zoom In (+10%)"
          >
            <ZoomIn size={13} />
          </button>

          {/* Fit to screen */}
          <button
            type="button"
            onClick={fitToScreen}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fit to Screen"
          >
            <Maximize2 size={12} />
          </button>

          {/* Reset Pan only if panned */}
          {(pan.x !== 0 || pan.y !== 0) && (
            <button
              type="button"
              onClick={() => setPan({ x: 0, y: 0 })}
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
