"use client";

import { useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { ContextToolbar } from "@/components/editor/ContextToolbar";
import { Layers, ZoomIn, ZoomOut } from "lucide-react";

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

  // Ref to the scroll container — used for scroll-to-section behavior
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to a section whenever it becomes selected (including after add)
  useEffect(() => {
    if (!selectedSectionId || !scrollContainerRef.current) return;

    // Allow React to finish painting the newly added section DOM node
    const timer = setTimeout(() => {
      // The section components render with id={section.id} / data-section-id on their root element
      const el = scrollContainerRef.current?.querySelector(
        `[id="${selectedSectionId}"], [data-section-id="${selectedSectionId}"]`
      ) as HTMLElement | null;

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Brief pulse animation for immediate visual feedback after add or select
        el.classList.add("ring-4", "ring-indigo-500/80", "transition-all", "duration-500");
        const pulseTimer = setTimeout(() => {
          el.classList.remove("ring-4", "ring-indigo-500/80");
        }, 1200);
        return () => clearTimeout(pulseTimer);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedSectionId]);

  // Brief pulse animation on the exact clicked element for visual feedback
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

  return (
    <div className="flex-1 h-full w-full bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Context-Aware Top Formatting Bar */}
      <ContextToolbar
        scrollRef={scrollContainerRef}
        onRequestImageEdit={onRequestImageEdit}
      />

      {/* Full-width Direct Editable Preview */}
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden bg-slate-950 custom-scrollbar relative"
      >
        {config ? (
          <div
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "top center",
              width: zoomLevel !== 100 ? `${100 / (zoomLevel / 100)}%` : "100%",
              minHeight: "100%",
              transition: "transform 0.15s ease-out, width 0.15s ease-out",
            }}
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

      {/* Live Preview Zoom Controls */}
      {config && (
        <div className="absolute bottom-4 right-4 z-40 flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-full px-2.5 py-1 text-xs text-slate-300 shadow-2xl backdrop-blur select-none">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
            disabled={zoomLevel <= 50}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Zoom Out (-10%)"
          >
            <ZoomOut size={13} />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel(100)}
            className="px-1.5 font-mono text-[11px] font-semibold text-indigo-300 hover:text-indigo-200 transition-colors"
            title="Reset Zoom to 100%"
          >
            {zoomLevel}%
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(150, z + 10))}
            disabled={zoomLevel >= 150}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Zoom In (+10%)"
          >
            <ZoomIn size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
