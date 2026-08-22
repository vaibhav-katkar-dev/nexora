"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  LayoutTemplate,
  PenLine,
  Sparkles,
  Palette,
  FileText,
  CreditCard,
  UtensilsCrossed,
  Briefcase,
  Rocket,
  Lightbulb,
  User,
  CalendarDays,
  Link2,
  File,
  Check,
  Zap,
  Eye,
  ExternalLink,
} from "lucide-react";
import { TemplateThumbnail } from "@/components/renderer/TemplateThumbnail";
import { templatesApi } from "@/lib/api";
import { QuickBusinessSetupModal } from "@/components/common/QuickBusinessSetupModal";
import { BusinessProfile } from "@/lib/businessProfile";

// ─── Category icon map ────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  all: LayoutTemplate,
  portfolio: Palette,
  resume: FileText,
  digital_card: CreditCard,
  restaurant_menu: UtensilsCrossed,
  business: Briefcase,
  product_landing: Rocket,
  startup_landing: Lightbulb,
  personal: User,
  event: CalendarDays,
  link_in_bio: Link2,
  blank: File,
};

// ─── Category badge colors ────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  portfolio: "#6366F1",
  resume: "#8B5CF6",
  digital_card: "#10B981",
  restaurant_menu: "#F43F5E",
  business: "#3B82F6",
  product_landing: "#F59E0B",
  startup_landing: "#F59E0B",
  personal: "#EC4899",
  event: "#14B8A6",
  link_in_bio: "#06B6D4",
  blank: "#94A3B8",
};

export interface SiteCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  onLaunch: (templateId: string | null, profile?: BusinessProfile | null) => void;
  isRedirecting: boolean;
}

export function SiteCreationModal({
  isOpen,
  onClose,
  username,
  onLaunch,
  isRedirecting,
}: SiteCreationModalProps) {
  const [modalStep, setModalStep] = useState<"mode" | "template">("mode");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [pendingLaunchTemplateId, setPendingLaunchTemplateId] = useState<string | null>(null);

  // Templates state drawn strictly from backend API
  const [allTemplates, setAllTemplates] = useState<any[]>([]);
  const [templatesFetched, setTemplatesFetched] = useState(false);

  // Fetch from backend templates API
  useEffect(() => {
    if (!templatesFetched && isOpen) {
      templatesApi.list()
        .then((res) => {
          const data = res?.data || [];
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data
              .filter((t: any) => t && t.defaultConfig)
              .map((t: any) => {
                const slug = t.slug || t.defaultConfig?.meta?.slug || t._id || t.id || "template";
                const config = t.defaultConfig || t.config;
                return {
                  id: t._id || t.slug || t.id,
                  slug,
                  name: t.name || config?.meta?.title || slug,
                  category: t.category || config?.meta?.category || "portfolio",
                  description: t.description || config?.meta?.description || "",
                  tags: t.tags || config?.meta?.tags || [],
                  popularity: config?.meta?.popularity || 90,
                  isNew: config?.meta?.isNew || false,
                  config,
                };
              });

            setAllTemplates(mapped);
            if (mapped.length > 0) {
              setSelectedTemplateId(mapped[0].id);
            }
          }
        })
        .catch((err) => {
          console.warn("[SiteCreationModal] Backend templates fetch error:", err);
        })
        .finally(() => {
          setTemplatesFetched(true);
        });
    }
  }, [templatesFetched, isOpen]);

  // Reset internal step when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setModalStep("mode");
      setSearchQuery("");
      setSelectedCategory("all");
      if (!selectedTemplateId && allTemplates.length > 0) {
        setSelectedTemplateId(allTemplates[0].id);
      }
    }
  }, [isOpen, allTemplates]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isRedirecting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isRedirecting, onClose]);

  // Filter templates based on category & search query
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((tpl) => {
      const matchesCategory =
        selectedCategory === "all" || tpl.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        tpl.name.toLowerCase().includes(q) ||
        tpl.category.toLowerCase().includes(q) ||
        tpl.description.toLowerCase().includes(q) ||
        (tpl.tags && tpl.tags.some((t: string) => t.toLowerCase().includes(q)));

      return matchesCategory && matchesSearch;
    });
  }, [allTemplates, selectedCategory, searchQuery]);

  // Count templates per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allTemplates.length };
    allTemplates.forEach((t: any) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [allTemplates]);

  // Dynamically compute category filter tabs from database templates
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    allTemplates.forEach((t: any) => {
      if (t.category) cats.add(t.category);
    });
    const dynamicList = Array.from(cats).map((catId) => ({
      id: catId,
      label: catId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
    return [{ id: "all", label: "All Templates" }, ...dynamicList];
  }, [allTemplates]);

  if (!isOpen) return null;

  const cleanSlug =
    username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "my-brand";

  const selectedTemplate = allTemplates.find((t) => t.id === selectedTemplateId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRedirecting) onClose();
      }}
    >
      <div
        className={`bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-900/30 overflow-hidden w-full transition-all duration-300 ${
          modalStep === "template" ? "max-w-6xl" : "max-w-2xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header bar ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            {modalStep === "template" ? (
              <button
                type="button"
                onClick={() => setModalStep("mode")}
                className="flex items-center gap-1 min-h-[36px] text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors touch-manipulation"
              >
                <ChevronLeft size={15} /> Back
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Site Setup
                </span>
              </div>
            )}
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-semibold truncate max-w-[200px] sm:max-w-xs">
              Oninsite.site/{cleanSlug}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isRedirecting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 1: MODE SELECTION ("Scratch" vs "Template")
        ══════════════════════════════════════════════════════════════════════ */}
        {modalStep === "mode" && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                <Sparkles size={13} className="text-indigo-600" />
                <span>Web address claimed! Choose how to start:</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                How would you like to build your site?
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                You can start with a professionally designed template or build section-by-section from a blank canvas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option A: Use Template */}
              <button
                type="button"
                onClick={() => setModalStep("template")}
                className="group relative text-left p-6 rounded-3xl border-2 border-indigo-500 bg-gradient-to-b from-indigo-50/40 via-white to-white hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 flex flex-col justify-between overflow-hidden touch-manipulation"
              >
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                  Recommended
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-4 group-hover:scale-110 transition-transform">
                    <LayoutTemplate size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Use a Template
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    Pick from 10+ ready-to-use templates for portfolios, startups, menus, digital cards, & resumes.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-indigo-100/80 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                    <Check size={14} className="text-indigo-600 shrink-0" />
                    100% pre-structured layouts
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                    <Check size={14} className="text-indigo-600 shrink-0" />
                    Categorized & searchable gallery
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700">
                    <Check size={14} className="text-indigo-600 shrink-0" />
                    Instant click-to-edit canvas
                  </div>

                  <div className="pt-3">
                    <div className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 group-hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20">
                      <span>Browse Template Gallery</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              </button>

                {/* Option B: Start from Scratch */}
              <button
                type="button"
                onClick={() => {
                  setPendingLaunchTemplateId(null);
                  setShowSetupModal(true);
                }}
                disabled={isRedirecting}
                className="group text-left p-6 rounded-3xl border-2 border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50/80 hover:shadow-lg transition-all duration-200 flex flex-col justify-between touch-manipulation"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:bg-slate-200 group-hover:scale-110 transition-transform">
                    <PenLine size={22} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                    Start from Scratch
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Begin with a minimalist blank layout. Full creative freedom to build your site element by element.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <Check size={14} className="text-slate-400 shrink-0" />
                    Minimalist starter canvas
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <Check size={14} className="text-slate-400 shrink-0" />
                    Add sections as you go
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                    <Check size={14} className="text-slate-400 shrink-0" />
                    Complete design control
                  </div>

                  <div className="pt-3">
                    <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 group-hover:bg-slate-900 text-slate-800 group-hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all">
                      <span>{isRedirecting ? "Opening Studio…" : "Start Blank Site"}</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 2: TEMPLATE GALLERY VIEW
        ══════════════════════════════════════════════════════════════════════ */}
        {modalStep === "template" && (
          <div className="flex flex-col h-[82vh] max-h-[850px]">
            {/* ── Toolbar: Search & Title ── */}
            <div className="p-6 pb-4 border-b border-slate-100 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Select a Template Layout
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any design below to start customizing inside the visual editor.
                  </p>
                </div>

                {/* Search bar */}
                <div className="relative w-full sm:w-72">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search templates, tags..."
                    className="w-full h-10 pl-10 pr-9 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-semibold text-slate-900 placeholder-slate-400 rounded-2xl border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all touch-manipulation"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/50"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Category Filter Pills ── */}
              <div className="flex items-center gap-2 overflow-x-auto overscroll-x-contain pb-1.5 pt-1 no-scrollbar -mx-6 px-6">
                {dynamicCategories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.id] || LayoutTemplate;
                  const count = categoryCounts[cat.id] || 0;
                  const isActive = selectedCategory === cat.id;
                  const color = CATEGORY_COLORS[cat.id] || "#6366F1";

                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-3.5 py-2 min-h-[42px] rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 touch-manipulation ${
                        isActive
                          ? "bg-slate-900 text-white shadow-md shadow-slate-900/20 scale-[1.02]"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        size={14}
                        style={{ color: isActive ? "#ffffff" : color }}
                      />
                      <span>{cat.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Gallery Grid Scroll Area ── */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
              {filteredTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredTemplates.map((tpl) => {
                    const isSelected = selectedTemplateId === tpl.id;
                    const accent = CATEGORY_COLORS[tpl.category] ?? "#6366F1";
                    const Icon = CATEGORY_ICONS[tpl.category] || LayoutTemplate;

                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        onDoubleClick={() => {
                          setSelectedTemplateId(tpl.id);
                          setPendingLaunchTemplateId(tpl.id);
                          setShowSetupModal(true);
                        }}
                        className={`group relative text-left rounded-3xl border-2 bg-white overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between touch-manipulation ${
                          isSelected
                            ? "border-indigo-600 ring-4 ring-indigo-600/15 shadow-xl shadow-indigo-600/10 -translate-y-1"
                            : "border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5"
                        }`}
                      >
                        {/* Live Thumbnail Preview */}
                        <div className="relative">
                          <TemplateThumbnail
                            config={tpl.config}
                            name={tpl.name}
                            category={tpl.category}
                          />

                          {/* Category Badge overlay */}
                          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold shadow-md">
                            <Icon size={12} style={{ color: accent }} />
                            <span className="capitalize">
                              {tpl.category.replace("_", " ")}
                            </span>
                          </div>

                          {/* Selection Checkmark */}
                          {isSelected && (
                            <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 animate-scale-in">
                              <CheckCircle2 size={16} />
                            </div>
                          )}

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3 pointer-events-auto">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/templates/preview/${tpl.id}`, "_blank");
                              }}
                              className="px-3 py-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow-xl flex items-center gap-1.5 transition-transform hover:scale-105"
                              title="Preview full layout in new window"
                            >
                              <ExternalLink size={13} className="text-indigo-600" />
                              <span>Preview ↗</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTemplateId(tpl.id);
                              }}
                              className={`px-3 py-2 rounded-xl font-bold text-xs shadow-xl flex items-center gap-1.5 transition-transform hover:scale-105 ${
                                isSelected
                                  ? "bg-emerald-500 text-white"
                                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
                              }`}
                            >
                              {isSelected ? <Check size={13} /> : null}
                              <span>{isSelected ? "Selected" : "Select"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Card Info Strip */}
                        <div className="p-4 border-t border-slate-100 bg-white flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                {tpl.name}
                              </h3>
                              {tpl.isNew && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase tracking-wide shrink-0">
                                  NEW
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {tpl.description}
                            </p>
                          </div>

                          {/* Tags / Actions */}
                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex flex-wrap gap-1">
                              {tpl.tags.slice(0, 2).map((tag: string) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/templates/preview/${tpl.id}`, "_blank");
                                }}
                                className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all"
                                title="Open full template preview in new window"
                              >
                                <ExternalLink size={13} />
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTemplateId(tpl.id);
                                  setPendingLaunchTemplateId(tpl.id);
                                  setShowSetupModal(true);
                                }}
                                disabled={isRedirecting}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 shrink-0 ${
                                  isSelected
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                    : "bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white"
                                }`}
                              >
                                <span>Use</span>
                                <ArrowRight size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty state */
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <Search size={22} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    No templates found matching "{searchQuery}"
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Try searching for another keyword or browse all templates by category.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                  >
                    Clear Filters & Search
                  </button>
                </div>
              )}
            </div>

            {/* ── Footer Bar ── */}
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                <span className="font-bold text-slate-900">
                  Selected Template:
                </span>
                <span className="font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100 flex items-center gap-1.5">
                  <Zap size={13} />
                  {selectedTemplate ? selectedTemplate.name : "None selected"}
                </span>

                {selectedTemplateId && (
                  <button
                    onClick={() => window.open(`/templates/preview/${selectedTemplateId}`, "_blank")}
                    className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 hover:underline ml-1"
                  >
                    <Eye size={13} /> Preview full page in new window ↗
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setPendingLaunchTemplateId(null);
                    setShowSetupModal(true);
                  }}
                  disabled={isRedirecting}
                  className="px-4 py-2.5 min-h-[44px] rounded-2xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors touch-manipulation"
                >
                  Or Start Blank Canvas
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedTemplateId) return;
                    setPendingLaunchTemplateId(selectedTemplateId);
                    setShowSetupModal(true);
                  }}
                  disabled={!selectedTemplateId || isRedirecting}
                  className="flex-1 sm:flex-none px-6 py-2.5 min-h-[44px] rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/25 touch-manipulation"
                >
                  {isRedirecting ? (
                    "Opening Studio…"
                  ) : (
                    <>
                      <span>Launch with Template</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Business Info Setup Wizard Modal ── */}
      <QuickBusinessSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        templateName={
          pendingLaunchTemplateId
            ? allTemplates.find((t) => t.id === pendingLaunchTemplateId)?.name || "Template"
            : "Blank Canvas"
        }
        onSubmit={(profile) => {
          setShowSetupModal(false);
          onLaunch(pendingLaunchTemplateId, profile);
        }}
        onSkip={() => {
          setShowSetupModal(false);
          onLaunch(pendingLaunchTemplateId, null);
        }}
        isSubmitting={isRedirecting}
      />
    </div>
  );
}
