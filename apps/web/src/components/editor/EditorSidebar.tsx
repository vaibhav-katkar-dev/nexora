"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  Palette,
  Globe,
  Sparkles,
  Code2,
  SlidersHorizontal,
  MoreHorizontal,
  ChevronLeft,
} from "lucide-react";

export type SidebarTab = "sections" | "inspector" | "add" | "theme" | "seo" | "ai" | "code";

interface EditorSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  developerMode: boolean;
  activeSectionTitle?: string;
}

export function EditorSidebar({
  activeTab,
  onTabChange,
  developerMode,
  activeSectionTitle,
}: EditorSidebarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const primaryTabs = [
    { id: "sections" as SidebarTab, label: "Sections", icon: Layers },
    {
      id: "inspector" as SidebarTab,
      label: "Inspector",
      icon: SlidersHorizontal,
      badge: activeSectionTitle ? "Active" : undefined,
    },
  ];

  const advancedTabs = [
    { id: "add" as SidebarTab, label: "Add", icon: Plus },
    { id: "theme" as SidebarTab, label: "Design", icon: Palette },
    { id: "seo" as SidebarTab, label: "SEO", icon: Globe },
    { id: "ai" as SidebarTab, label: "AI", icon: Sparkles },
    ...(developerMode ? [{ id: "code" as SidebarTab, label: "Code", icon: Code2 }] : []),
  ];

  return (
    <aside className="w-full md:w-16 max-md:fixed max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:h-14 max-md:z-50 bg-slate-950/95 border-t md:border-t-0 md:border-r border-slate-800/90 backdrop-blur flex flex-row md:flex-col items-center justify-around md:justify-start py-1.5 md:py-3 px-2 md:px-0 gap-1 md:gap-2 flex-shrink-0 select-none max-md:order-last">
      {primaryTabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;

        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`relative group h-10 md:h-12 w-full md:w-12 rounded-xl flex flex-row md:flex-col items-center justify-center gap-1 text-[11px] md:text-[10px] font-semibold transition-all ${
              isActive
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-600/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
            }`}
            title={t.label}
          >
            <Icon size={16} className={isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"} />
            <span className="leading-none">{t.label}</span>
            {t.badge && (
              <span className="hidden md:block absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            )}
          </button>
        );
      })}

      <button
        onClick={() => setShowAdvanced((value) => !value)}
        className={`h-10 md:h-12 w-full md:w-12 rounded-xl flex flex-row md:flex-col items-center justify-center gap-1 text-[11px] md:text-[10px] font-semibold transition-all border ${
          showAdvanced
            ? "bg-slate-900 text-white border-slate-700"
            : "text-slate-400 hover:text-white hover:bg-slate-900 border-transparent"
        }`}
        title={showAdvanced ? "Hide extra tools" : "Show more tools"}
      >
        {showAdvanced ? <ChevronLeft size={16} className="max-md:rotate-90" /> : <MoreHorizontal size={16} />}
        <span className="leading-none">More</span>
      </button>

      {showAdvanced &&
        advancedTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`relative group h-10 md:h-12 w-full md:w-12 rounded-xl flex flex-row md:flex-col items-center justify-center gap-1 text-[11px] md:text-[10px] font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-600/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
              }`}
              title={t.label}
            >
              <Icon size={16} className={isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"} />
              <span className="leading-none">{t.label}</span>
            </button>
          );
        })}
    </aside>
  );
}
