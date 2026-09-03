"use client";

import {
  Layers,
  LayoutGrid,
  Palette,
  SlidersHorizontal,
  Globe,
  Code2,
  HelpCircle,
} from "lucide-react";

export type SidebarTab = "sections" | "inspector" | "add" | "theme" | "seo" | "ai" | "code";

interface EditorSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  developerMode: boolean;
  activeSectionTitle?: string;
  onHelpClick?: () => void;
}

export function EditorSidebar({
  activeTab,
  onTabChange,
  developerMode,
  activeSectionTitle,
  onHelpClick,
}: EditorSidebarProps) {
  const tabs = [
    { id: "sections" as SidebarTab, label: "Sections", icon: Layers },
    { id: "add" as SidebarTab, label: "Blocks", icon: LayoutGrid },
    { id: "theme" as SidebarTab, label: "Design", icon: Palette },
    {
      id: "inspector" as SidebarTab,
      label: "Settings",
      icon: SlidersHorizontal,
      badge: activeSectionTitle ? "Active" : undefined,
    },
    { id: "seo" as SidebarTab, label: "SEO", icon: Globe },
    ...(developerMode ? [{ id: "code" as SidebarTab, label: "Code", icon: Code2 }] : []),
  ];

  return (
    <aside className="w-full md:w-16 max-md:hidden bg-[#070b14] border-r border-slate-800/80 flex flex-col items-center justify-between py-3 px-1.5 flex-shrink-0 select-none z-30">
      {/* Top tabs */}
      <div className="flex flex-col items-center gap-2 w-full">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`relative group w-full h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent"
              }`}
              title={t.label}
            >
              <Icon
                size={17}
                className={isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-white transition-colors"}
              />
              <span className="leading-none text-[9px] tracking-tight">{t.label}</span>
              {t.badge && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-[#070b14]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Help action */}
      <div className="w-full pt-2 border-t border-slate-800/60 flex flex-col items-center">
        <button
          onClick={onHelpClick}
          className="w-full h-11 rounded-xl flex flex-col items-center justify-center gap-1 text-[9px] font-semibold text-slate-400 hover:text-white hover:bg-slate-900/80 transition-all"
          title="Need Help or Tips?"
        >
          <HelpCircle size={16} />
          <span>Help</span>
        </button>
      </div>
    </aside>
  );
}
