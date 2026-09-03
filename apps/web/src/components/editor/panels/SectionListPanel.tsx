"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Section } from "@ai-platform/shared";
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Plus,
  SlidersHorizontal,
  Sparkles,
  User,
  Zap,
  Palette,
  UtensilsCrossed,
  Layers,
  CreditCard,
  AlignLeft,
  Mail,
  Link2,
  Code2,
} from "lucide-react";

interface SectionListPanelProps {
  activeSectionId: string | null;
  onSelectSection: (id: string) => void;
  onOpenAddPanel: () => void;
}

const SECTION_ICON_MAP: Record<string, any> = {
  hero: Sparkles,
  about: User,
  features: Zap,
  portfolio_grid: Palette,
  menu_list: UtensilsCrossed,
  timeline: Layers,
  pricing: CreditCard,
  faq: AlignLeft,
  contact: Mail,
  links: Link2,
  digital_card: CreditCard,
  custom_html: Code2,
};

const SECTION_DESC_MAP: Record<string, string> = {
  hero: "Profile header with avatar & bio",
  about: "Name, title & bio story",
  features: "Highlights & capabilities",
  portfolio_grid: "Gallery & showcase projects",
  menu_list: "Menu, food & catalog items",
  timeline: "Experience & journey milestones",
  pricing: "Pricing plans & tiers",
  faq: "Questions & answers accordion",
  contact: "Inquiry forms & contact buttons",
  links: "Link in bio buttons",
  digital_card: "Digital business card details",
  custom_html: "Custom embed code",
};

export function SectionListPanel({
  activeSectionId,
  onSelectSection,
  onOpenAddPanel,
}: SectionListPanelProps) {
  const { config, setConfig, removeSection, addSection } = useEditorStore();
  const sections = config?.sections || [];
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!config) return;
    const newSections = [...config.sections];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;
    setConfig({ ...config, sections: newSections });
  };

  const toggleVisibility = (index: number) => {
    if (!config) return;
    const newSections = [...config.sections];
    newSections[index] = {
      ...newSections[index],
      visible: newSections[index].visible === false ? true : false,
    };
    setConfig({ ...config, sections: newSections });
  };

  const duplicateSection = (sec: Section) => {
    const newId = `${sec.type}-${Date.now()}`;
    addSection({
      ...sec,
      id: newId,
      title: sec.title ? `${sec.title} (Copy)` : undefined,
    });
  };

  const reorderSections = (fromId: string, toId: string) => {
    if (!config || fromId === toId) return;

    const currentSections = [...config.sections];
    const fromIndex = currentSections.findIndex((sec) => sec.id === fromId);
    const toIndex = currentSections.findIndex((sec) => sec.id === toId);

    if (fromIndex < 0 || toIndex < 0) return;

    const [movedSection] = currentSections.splice(fromIndex, 1);
    const adjustedIndex = toIndex > fromIndex ? toIndex - 1 : toIndex;
    currentSections.splice(adjustedIndex, 0, movedSection);

    setConfig({ ...config, sections: currentSections });
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] border-r border-slate-800/80 w-full flex-shrink-0 select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">Page Sections</h2>
          <p className="text-[11px] text-slate-400">Reorder, inspect & customize</p>
        </div>
        <button
          onClick={onOpenAddPanel}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 transition-all shadow-sm active:scale-95"
        >
          <Plus size={14} /> Add Section
        </button>
      </div>

      {/* Section List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {sections.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 space-y-3">
            <Layers className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs font-medium">No sections added yet.</p>
            <button
              onClick={onOpenAddPanel}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-400 bg-indigo-950/50 border border-indigo-800/40 hover:bg-indigo-900/50"
            >
              + Add Section
            </button>
          </div>
        ) : (
          sections.map((sec, idx) => {
            const isSelected = activeSectionId === sec.id;
            const IconComponent = SECTION_ICON_MAP[sec.type] || Layers;
            const isHidden = sec.visible === false;
            const subDesc = SECTION_DESC_MAP[sec.type] || "Custom block content";

            return (
              <div
                key={sec.id}
                draggable
                onDragStart={() => setDraggedSectionId(sec.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTargetId(sec.id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedSectionId) {
                    reorderSections(draggedSectionId, sec.id);
                  }
                  setDraggedSectionId(null);
                  setDropTargetId(null);
                }}
                onDragEnd={() => {
                  setDraggedSectionId(null);
                  setDropTargetId(null);
                }}
                onClick={() => onSelectSection(sec.id)}
                className={`group relative p-3 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                  draggedSectionId === sec.id
                    ? "opacity-50 scale-[0.99] border-indigo-500/40"
                    : dropTargetId === sec.id && draggedSectionId && draggedSectionId !== sec.id
                    ? "border-indigo-400/80 bg-indigo-950/40 shadow-lg"
                    : isSelected
                    ? "bg-[#11192e] border-indigo-500/60 shadow-md shadow-indigo-950/40 ring-1 ring-indigo-500/20"
                    : isHidden
                    ? "bg-[#080d19]/60 border-slate-800/60 opacity-60"
                    : "bg-[#0d1424] border-slate-800/80 hover:border-slate-700 hover:bg-[#10182c]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-2 rounded-xl transition-colors ${
                        isSelected
                          ? "bg-indigo-600/30 text-indigo-300"
                          : "bg-slate-900 text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate max-w-[130px] sm:max-w-[150px]">
                        {sec.title || sec.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate max-w-[130px] sm:max-w-[150px]">
                        {subDesc}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Tools */}
                  <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(idx);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                      title={isHidden ? "Show section" : "Hide section"}
                    >
                      {isHidden ? <EyeOff size={13} className="text-rose-400" /> : <Eye size={13} />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateSection(sec);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                      title="Duplicate section"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(sec.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete section"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070b14]">
        <button
          onClick={onOpenAddPanel}
          className="w-full py-2.5 rounded-xl text-xs font-bold text-indigo-300 bg-indigo-950/50 border border-indigo-800/50 hover:bg-indigo-900/60 hover:text-white flex items-center justify-center gap-1.5 transition-all active:scale-98"
        >
          <Plus size={14} /> Add Section
        </button>
      </div>
    </div>
  );
}
