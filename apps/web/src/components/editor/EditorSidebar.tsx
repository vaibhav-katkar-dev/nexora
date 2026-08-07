"use client";

import {
  Layers,
  Plus,
  Palette,
  Globe,
  Sparkles,
  Code2,
  SlidersHorizontal,
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
  const tabs = [
    { id: "sections" as SidebarTab, label: "Sections", icon: Layers },
    { id: "inspector" as SidebarTab, label: "Inspector", icon: SlidersHorizontal, badge: activeSectionTitle ? "Active" : undefined },
    { id: "add" as SidebarTab, label: "Add Block", icon: Plus },
    { id: "theme" as SidebarTab, label: "Design", icon: Palette },
    { id: "seo" as SidebarTab, label: "SEO", icon: Globe },
    { id: "ai" as SidebarTab, label: "AI Copilot", icon: Sparkles },
    ...(developerMode ? [{ id: "code" as SidebarTab, label: "Code", icon: Code2 }] : []),
  ];

  return (
    <aside className="w-16 bg-slate-950 border-r border-slate-800 flex flex-col items-center py-3 gap-2 flex-shrink-0 z-30 select-none">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = activeTab === t.id;

        return (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`relative group w-12 h-12 rounded-xl flex flex-col items-center justify-center text-[10px] font-semibold transition-all ${
              isActive
                ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-600/10"
                : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"
            }`}
            title={t.label}
          >
            <Icon size={18} className={isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white"} />
            <span className="mt-1 leading-none">{t.label}</span>
            {t.badge && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
            )}
          </button>
        );
      })}
    </aside>
  );
}
