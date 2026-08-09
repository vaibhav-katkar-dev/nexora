"use client";

import { useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editorStore";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { DeviceFrame } from "@/components/editor/DeviceFrame";
import { Layers } from "lucide-react";

interface CanvasPreviewProps {
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  selectedElementKey?: string | null;
  onSelectElement?: (elementKey: string, sectionId: string) => void;
}

export function CanvasPreview({
  selectedSectionId,
  onSelectSection,
  selectedElementKey,
  onSelectElement,
}: CanvasPreviewProps) {
  const { config, customCode, viewport } = useEditorStore();

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
    <div className="flex-1 h-full bg-slate-950 overflow-hidden flex items-center justify-center relative">
      {/* Device Frame — content scrolls INSIDE the device screen, not the canvas */}
      <DeviceFrame viewport={viewport} scrollRef={scrollContainerRef}>
        {config ? (
          <SiteRenderer
            config={config}
            customCode={customCode}
            selectedSectionId={selectedSectionId}
            onSelectSection={onSelectSection}
            selectedElementKey={selectedElementKey}
            onSelectElement={onSelectElement}
            interactive={true}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500 gap-3">
            <Layers size={40} className="opacity-30" />
            <p className="text-sm font-medium">No site configuration loaded.</p>
          </div>
        )}
      </DeviceFrame>
    </div>
  );
}
