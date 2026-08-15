"use client";

import { normalizeElementKey, resolveElementValue } from "@/lib/editorElements";
import { useEditorStore } from "@/store/editorStore";
import { useState, useEffect, useRef } from "react";
import { humanizeElementKey } from "@/lib/elementKeys";
import { LinkBuilderModal } from "@/components/editor/LinkBuilderModal";
import {
  Sparkles,
  SlidersHorizontal,
  Trash2,
  Image as ImageIcon,
  Plus,
  X,
  Copy,
  ChevronUp,
  ChevronDown,
  Palette,
  RotateCcw,
  MessageCircle,
} from "lucide-react";

// ─── Per-Element Custom Color -------------------------------------------------
// Preset swatches shown in the color popup. A nice spread of editable colors.
const COLOR_PRESETS = [
  "#F8FAFC", "#E2E8F0", "#94A3B8", "#475569", "#0F172A",
  "#F43F5E", "#EC4899", "#A855F7", "#8B5CF6", "#6366F1",
  "#3B82F6", "#0EA5E9", "#06B6D4", "#14B8A6", "#10B981",
  "#22C55E", "#84CC16", "#FACC15", "#F59E0B", "#F97316",
  "#EF4444", "#92400E", "#7C2D12", "#1E293B",
];

interface SectionInspectorPanelProps {
  onOpenImagePicker?: (currentUrl: string, onSelect: (url: string) => void) => void;
}

/** Helper to generate smart item blueprints matching existing item schemas */
function getSmartItemBlueprint(sectionType: string, keyName: string, existingItems: any[]): any {
  // If items exist, clone the key structure of the last item
  if (existingItems && existingItems.length > 0) {
    const template = existingItems[existingItems.length - 1];

    if (typeof template === "string") {
      return "New Item";
    }

    if (typeof template === "object" && template !== null) {
      const cloned: Record<string, any> = {};
      for (const [k, v] of Object.entries(template)) {
        if (typeof v === "string") {
          if (k === "price") cloned[k] = "$0";
          else if (k === "tag") cloned[k] = v;
          else if (k === "badge") cloned[k] = "NEW";
          else if (k === "url" || k === "link" || k === "ctaLink") cloned[k] = "#";
          else if (k === "icon") cloned[k] = v || "Sparkles";
          else cloned[k] = `New ${k.charAt(0).toUpperCase() + k.slice(1)}`;
        } else if (typeof v === "number") {
          cloned[k] = 0;
        } else if (typeof v === "boolean") {
          cloned[k] = false;
        } else if (Array.isArray(v)) {
          cloned[k] = typeof v[0] === "string" ? ["Sample Feature"] : [];
        } else {
          cloned[k] = "";
        }
      }
      return cloned;
    }
  }

  // Fallback defaults based on section type & array key
  switch (sectionType) {
    case "features":
      return { icon: "Sparkles", title: "New Feature", desc: "Detailed description of this feature capability.", buttonText: "", url: "" };
    case "services":
      return { icon: "Briefcase", title: "New Service", desc: "Service description and what clients can expect.", buttonText: "Learn More", url: "#" };
    case "products":
      return { image: "", title: "New Product", desc: "Product description and key specifications.", price: "$0", badge: "", buttonText: "Buy Now", url: "#" };
    case "portfolio_grid":
      return { name: "New Project", desc: "Project overview and case study details.", tag: "Web / AI", url: "#" };
    case "pricing":
      return { name: "Pro Plan", price: "$49", period: "/mo", desc: "For growing teams", features: ["Unlimited Access", "Priority Support"], buttonText: "Get Started", url: "#", isPopular: false, badge: "" };
    case "menu_list":
      if (keyName === "categories") {
        return { name: "New Category", items: [{ name: "Signature Dish", desc: "Fresh ingredients", price: "$18", badge: "", image: "", buttonText: "", url: "" }] };
      }
      return { name: "New Item", desc: "Description of ingredients", price: "$15", badge: "", image: "", buttonText: "", url: "" };
    case "timeline":
      return { period: "2024 - Present", role: "Position Title", company: "Organization / Company", desc: "Summary of responsibilities and achievements." };
    case "faq":
      return { question: "Frequently Asked Question?", answer: "Clear detailed response providing complete context." };
    case "hero":
      return { value: "100+", label: "Metric Label" };
    case "links":
      if (keyName === "customLinks") {
        return { label: "New Link", url: "https://", icon: "Globe", badge: "" };
      }
      return { label: "My Social Link", url: "https://", icon: "Globe", badge: "" };
    case "digital_card":
      return { label: "New Link", url: "https://", icon: "Globe", badge: "" };
    case "team":
      return { name: "Team Member", role: "Role / Title", desc: "Bio or short description about this team member.", image: "", url: "" };
    case "testimonials":
      return { name: "Customer Name", role: "CEO, Company", quote: "Amazing experience with this product or service.", avatar: "", rating: 5 };
    default:
      return { title: "New Item", desc: "Description text...", url: "" };
  }
}

export function SectionInspectorPanel({
  onOpenImagePicker,
}: SectionInspectorPanelProps) {
  const config = useEditorStore((state) => state.config);
  const sectionId = useEditorStore((state) => state.activeSectionId);
  const selectedElementKey = useEditorStore((state) => state.selectedElementKey);
  const viewport = useEditorStore((state) => state.viewport);
  const updateSection = useEditorStore((state) => state.updateSection);
  const removeSection = useEditorStore((state) => state.removeSection);
  const setSelectedElementKey = useEditorStore((state) => state.setSelectedElementKey);
  const section = config?.sections.find((s) => s.id === sectionId);

  const inputClass =
    "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm";
  const labelClass = "block text-xs font-semibold text-slate-300 mb-1 capitalize";

  // ── Element-key → field-path auto-scroll & flash ─────────────────────────
  const panelScrollRef = useRef<HTMLDivElement>(null);
  const [flashedKey, setFlashedKey] = useState<string | null>(null);
  // Tracks whether the per-element color popup is open (Rules-of-Hooks:
  // must be declared here, before any early return).
  const [colorOpen, setColorOpen] = useState(false);
  const [linkModalState, setLinkModalState] = useState<{ isOpen: boolean; currentUrl: string; fieldPath: string }>({
    isOpen: false,
    currentUrl: "",
    fieldPath: "",
  });

  useEffect(() => {
    if (!selectedElementKey) return;
    const fieldPath = normalizeElementKey(selectedElementKey);

    const timer = setTimeout(() => {
      const el = panelScrollRef.current?.querySelector(
        `[data-field-path="${fieldPath}"]`
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("nexora-field-flash");
        setFlashedKey(fieldPath);
        const clearTimer = setTimeout(() => {
          el.classList.remove("nexora-field-flash");
          setFlashedKey(null);
        }, 1400);
        return () => clearTimeout(clearTimer);
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [selectedElementKey, sectionId]);

  if (!section) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900 border-r border-slate-800 w-full flex-shrink-0">
        <SlidersHorizontal size={32} className="opacity-30 mb-3" />
        <h3 className="text-sm font-bold text-slate-300">No Section Selected</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
          Click any section in the preview canvas or select one from the Sections list to edit its content.
        </p>
      </div>
    );
  }

  const handleFieldChange = (key: string, value: any) => {
    updateSection(section.id, {
      content: { ...(section.content || {}), [key]: value },
    });
  };

  const handleSaveInspectorLink = (url: string) => {
    if (!linkModalState.fieldPath) return;
    if (linkModalState.fieldPath.includes(".")) {
      const parts = linkModalState.fieldPath.split(".");
      const arrKey = parts[0];
      const index = parseInt(parts[1], 10);
      const list = [...((section.content || {})[arrKey] || [])];
      if (list[index]) {
        list[index] = { ...list[index], url };
        handleFieldChange(arrKey, list);
      }
    } else {
      handleFieldChange(linkModalState.fieldPath, url);
    }
  };

  const content = section.content || {};

  // ── Array Operations Helpers ──────────────────────────────────────────────
  const addItemToArray = (key: string) => {
    const currentList: any[] = content[key] || [];
    const newItem = getSmartItemBlueprint(section.type, key, currentList);
    handleFieldChange(key, [...currentList, newItem]);
  };

  const duplicateArrayItem = (key: string, index: number) => {
    const currentList: any[] = content[key] || [];
    if (index < 0 || index >= currentList.length) return;
    const targetItem = currentList[index];
    const cloned =
      typeof targetItem === "object" && targetItem !== null
        ? JSON.parse(JSON.stringify(targetItem))
        : typeof targetItem === "string"
        ? `${targetItem} (Copy)`
        : targetItem;

    if (typeof cloned === "object" && cloned.name) cloned.name = `${cloned.name} (Copy)`;
    if (typeof cloned === "object" && cloned.title) cloned.title = `${cloned.title} (Copy)`;

    const nextList = [...currentList];
    nextList.splice(index + 1, 0, cloned);
    handleFieldChange(key, nextList);
  };

  const moveArrayItem = (key: string, index: number, direction: "up" | "down") => {
    const currentList: any[] = [...(content[key] || [])];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;
    const temp = currentList[index];
    currentList[index] = currentList[targetIdx];
    currentList[targetIdx] = temp;
    handleFieldChange(key, currentList);
  };

const removeArrayItem = (key: string, index: number) => {
    const currentList: any[] = content[key] || [];
    const nextList = currentList.filter((_, i) => i !== index);
    handleFieldChange(key, nextList);
  };

// ── Per-Element Custom Color ─────────────────────────────────────────────
  const elementColors: Record<string, string> = section.elementColors || {};
  // Normalize the selected element key to a stable store key (strip leading "content.")
  const storeColorKey = selectedElementKey
    ? selectedElementKey.replace(/^content\./, "")
    : null;
  const currentColor = storeColorKey ? elementColors[storeColorKey] : undefined;

  const setElementColor = (color: string) => {
    if (!storeColorKey) return;
    updateSection(section.id, {
      elementColors: { ...elementColors, [storeColorKey]: color },
    });
  };

  const clearElementColor = () => {
    if (!storeColorKey) return;
    const next = { ...elementColors };
    delete next[storeColorKey];
    updateSection(section.id, { elementColors: next });
  };

// Humanized label for the selected element banner
  const humanElementLabel = selectedElementKey
    ? humanizeElementKey(selectedElementKey)
    : null;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-full flex-shrink-0 select-none overflow-hidden">
      {/* Inspector Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-semibold bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/40">
            {section.type}
          </span>
          <h2 className="text-sm font-extrabold text-white mt-1 truncate max-w-[180px]">
            {section.title || "Untitled Section"}
          </h2>
        </div>
        <button
          onClick={() => removeSection(section.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          title="Delete section"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {viewport === "mobile" && (
        <div className="mx-4 mt-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-[10px] text-amber-300 font-medium flex items-center gap-1.5">
          <span>📱</span>
          <span>Mobile View Mode: Edit fields here for exact responsiveness.</span>
        </div>
      )}

{/* Element editing banner */}
      {selectedElementKey && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
            <p className="text-[11px] font-semibold text-indigo-200 truncate">
              Editing: {humanElementLabel || selectedElementKey}
            </p>
          </div>
          <button
            onClick={() => setSelectedElementKey(null)}
            className="text-[10px] font-bold text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors flex-shrink-0"
            title="Deselect element"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Per-Element Custom Color Option ─────────────────────────────── */}
      {selectedElementKey && (
        <div className="mx-4 mt-3 rounded-xl border border-slate-700/80 bg-slate-950 overflow-hidden">
          {/* Toggle button */}
          <button
            onClick={() => setColorOpen((o) => !o)}
            className="w-full px-3 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-900 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-5 h-5 rounded-md border border-slate-600 flex-shrink-0 shadow-sm"
                style={{
                  background: currentColor || "linear-gradient(135deg, #eee, #ccc)",
                  boxShadow: currentColor ? `0 0 0 2px ${currentColor}33` : undefined,
                }}
              />
              <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                <Palette size={13} className="text-indigo-400" />
                Custom Color
              </span>
              {currentColor && (
                <span className="text-[10px] font-mono text-slate-400 truncate">{currentColor}</span>
              )}
            </div>
            <span className={`text-slate-400 transition-transform duration-200 ${colorOpen ? "rotate-180" : ""}`}>
              <ChevronDown size={14} />
            </span>
          </button>

          {/* Popup */}
          {colorOpen && (
            <div className="px-3 pb-3 pt-1 border-t border-slate-800 space-y-3 animate-fade-in">
              {/* Preset swatches */}
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Quick Colors
                </span>
                <div className="grid grid-cols-8 gap-1.5">
                  {COLOR_PRESETS.map((c) => {
                    const active = currentColor?.toLowerCase() === c.toLowerCase();
                    return (
                      <button
                        key={c}
                        onClick={() => setElementColor(c)}
                        title={c}
                        className="w-6 h-6 rounded-md border border-slate-600 hover:scale-110 transition-transform flex-shrink-0"
                        style={{
                          background: c,
                          outline: active ? "2px solid #fff" : "none",
                          outlineOffset: 1,
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Native picker + hex input */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={currentColor || "#6366F1"}
                  onChange={(e) => setElementColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-slate-700 bg-transparent cursor-pointer flex-shrink-0"
                  title="Pick custom color"
                />
                <input
                  type="text"
                  value={currentColor || ""}
                  onChange={(e) => setElementColor(e.target.value)}
                  placeholder="#000000"
                  maxLength={9}
                  className="flex-1 min-w-0 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {currentColor && (
                  <button
                    onClick={clearElementColor}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1 flex-shrink-0"
                    title="Reset to default color"
                  >
                    <RotateCcw size={11} /> Reset
                  </button>
                )}
              </div>

              <p className="text-[9px] text-slate-600 leading-snug">
                Applies to this element only. Leave empty to use the theme color.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Form Controls */}
      <div ref={panelScrollRef} className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Core Properties */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Header Text
          </h3>
          <div data-field-path="badge">
            <label className={labelClass}>Badge / Kicker</label>
            <input
              type="text"
              value={section.badge || ""}
              onChange={(e) => updateSection(section.id, { badge: e.target.value })}
              placeholder="e.g. Featured Project"
              className={inputClass}
            />
          </div>

          <div data-field-path="title">
            <label className={labelClass}>Title</label>
            <input
              type="text"
              value={section.title || ""}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder="Main Title"
              className={inputClass}
            />
          </div>

          <div data-field-path="subtitle">
            <label className={labelClass}>Subtitle / Description</label>
            <textarea
              rows={3}
              value={section.subtitle || ""}
              onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
              placeholder="Supporting description paragraph..."
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Section Layout Format selector */}
          {["menu_list", "products", "services", "features", "portfolio_grid", "pricing", "team", "testimonials"].includes(section.type) && (
            <div data-field-path="variant" className="pt-2 border-t border-slate-800">
              <label className={labelClass}>Layout Display Format</label>
              <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                {[
                  { id: "list", label: "Classic List" },
                  { id: "grid", label: "Photo Grid" },
                  { id: "compact", label: "Compact" },
                ].map((l) => {
                  const currentVariant = section.variant || (content as any)?.layout || "list";
                  const isActive = currentVariant === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        updateSection(section.id, { variant: l.id });
                        handleFieldChange("layout", l.id);
                      }}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-bold transition-all text-center ${
                        isActive
                          ? "bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900"
                      }`}
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── DIGITAL CARD SPECIAL PANEL ─────────────────────────────── */}
        {section.type === "digital_card" && (
          <div className="pt-3 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="text-indigo-400">◈</span> Profile Card Fields
            </h3>

            {/* Bio */}
            <div data-field-path="bio">
              <label className={labelClass}>Bio / About</label>
              <textarea
                rows={3}
                value={content.bio || ""}
                onChange={(e) => handleFieldChange("bio", e.target.value)}
                placeholder="Short biography or tagline..."
                className={`${inputClass} resize-none`}
              />
            </div>

            {/* Location */}
            <div data-field-path="location">
              <label className={labelClass}>Location</label>
              <input type="text" value={content.location || ""} onChange={(e) => handleFieldChange("location", e.target.value)} placeholder="e.g. New York, USA" className={inputClass} />
            </div>

            {/* Avatar */}
            <div data-field-path="avatar">
              <label className={labelClass}>Avatar / Profile Photo URL</label>
              <div className="flex gap-1.5">
                <input type="text" value={content.avatar || ""} onChange={(e) => handleFieldChange("avatar", e.target.value)} placeholder="https://..." className={inputClass} />
                {onOpenImagePicker && (
                  <button onClick={() => onOpenImagePicker(content.avatar || "", (url) => handleFieldChange("avatar", url))} className="px-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg border border-slate-700 flex items-center justify-center" title="Pick Image">
                    <ImageIcon size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <div data-field-path="ctaText" className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/30 space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">Primary CTA Button</label>
              <input type="text" value={content.ctaText || ""} onChange={(e) => handleFieldChange("ctaText", e.target.value)} placeholder="Button text (e.g. Hire Me)" className={inputClass} />
              <div className="flex gap-1.5">
                <input type="text" value={content.ctaLink || ""} onChange={(e) => handleFieldChange("ctaLink", e.target.value)} placeholder="Button URL (e.g. https://... or wa.me/...)" className={inputClass} />
                <button
                  type="button"
                  onClick={() => setLinkModalState({ isOpen: true, currentUrl: content.ctaLink || "", fieldPath: "ctaLink" })}
                  className="px-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                  title="Configure WhatsApp or Link Action"
                >
                  <MessageCircle size={12} /> WhatsApp
                </button>
              </div>
            </div>

            {/* Socials */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Quick Socials (Pill Buttons)</label>
              {["email","phone","linkedin","twitter","github","instagram"].map((s) => (
                <div key={s} data-field-path={`socials.${s}`}>
                  <span className="text-[10px] text-slate-500 capitalize block mb-0.5">{s}</span>
                  <input type="text" value={(content.socials || {})[s] || ""} onChange={(e) => handleFieldChange("socials", { ...(content.socials || {}), [s]: e.target.value })} placeholder={s === "email" ? "you@email.com" : s === "phone" ? "+1 234 567 890" : `https://${s}.com/...`} className={inputClass} />
                </div>
              ))}
            </div>

            {/* Custom Links */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Custom Links (with Icons)</label>
                <button
                  onClick={() => {
                    const cur = content.customLinks || [];
                    handleFieldChange("customLinks", [...cur, { label: "New Link", url: "https://", icon: "Globe", badge: "" }]);
                  }}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <Plus size={12} /> Add Link
                </button>
              </div>
              <div className="space-y-2 pl-2 border-l-2 border-slate-800">
                {(content.customLinks || []).map((link: any, i: number) => (
                  <div key={i} data-field-path={`customLinks.${i}`} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-indigo-300">Link #{i + 1}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveArrayItem("customLinks", i, "up")} disabled={i === 0} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"><ChevronUp size={12} /></button>
                        <button onClick={() => moveArrayItem("customLinks", i, "down")} disabled={i === (content.customLinks || []).length - 1} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"><ChevronDown size={12} /></button>
                        <button onClick={() => removeArrayItem("customLinks", i)} className="p-0.5 text-slate-400 hover:text-rose-400"><X size={12} /></button>
                      </div>
                    </div>
                    <input type="text" value={link.label || ""} onChange={(e) => { const n = [...(content.customLinks || [])]; n[i] = { ...n[i], label: e.target.value }; handleFieldChange("customLinks", n); }} placeholder="Link label" className={inputClass} />
                    <input type="text" value={link.url || ""} onChange={(e) => { const n = [...(content.customLinks || [])]; n[i] = { ...n[i], url: e.target.value }; handleFieldChange("customLinks", n); }} placeholder="https://..." className={inputClass} />
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">Icon Name</span>
                        <input type="text" value={link.icon || ""} onChange={(e) => { const n = [...(content.customLinks || [])]; n[i] = { ...n[i], icon: e.target.value }; handleFieldChange("customLinks", n); }} placeholder="Globe, Github..." className={inputClass} />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">Badge</span>
                        <input type="text" value={link.badge || ""} onChange={(e) => { const n = [...(content.customLinks || [])]; n[i] = { ...n[i], badge: e.target.value }; handleFieldChange("customLinks", n); }} placeholder="NEW, HOT..." className={inputClass} />
                      </div>
                    </div>
                  </div>
                ))}
                {(!content.customLinks || content.customLinks.length === 0) && (
                  <p className="text-[11px] text-slate-500 italic py-2">No custom links yet. Click "+ Add Link" to add one.</p>
                )}
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Icon names: Globe, Github, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, Star, Zap, Rocket...</p>
            </div>
          </div>
        )}

        {/* ── LINKS SECTION SPECIAL PANEL ─────────────────────────────── */}
        {section.type === "links" && (
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="text-indigo-400">◈</span> Link Buttons
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Links ({(content.links || []).length})</label>
                <button
                  onClick={() => {
                    const cur = content.links || [];
                    handleFieldChange("links", [...cur, { label: "New Link", url: "https://", icon: "Globe", badge: "" }]);
                  }}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <Plus size={12} /> Add Link
                </button>
              </div>
              <div className="space-y-2 pl-2 border-l-2 border-slate-800">
                {(content.links || []).map((link: any, i: number) => (
                  <div key={i} data-field-path={`links.${i}`} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-indigo-300">Link #{i + 1}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveArrayItem("links", i, "up")} disabled={i === 0} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"><ChevronUp size={12} /></button>
                        <button onClick={() => moveArrayItem("links", i, "down")} disabled={i === (content.links || []).length - 1} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"><ChevronDown size={12} /></button>
                        <button onClick={() => duplicateArrayItem("links", i)} className="p-0.5 text-slate-400 hover:text-indigo-400"><Copy size={12} /></button>
                        <button onClick={() => removeArrayItem("links", i)} className="p-0.5 text-slate-400 hover:text-rose-400"><X size={12} /></button>
                      </div>
                    </div>
                    <input type="text" value={link.label || ""} onChange={(e) => { const n = [...(content.links || [])]; n[i] = { ...n[i], label: e.target.value }; handleFieldChange("links", n); }} placeholder="Button label" className={inputClass} />
                    <input type="text" value={link.url || ""} onChange={(e) => { const n = [...(content.links || [])]; n[i] = { ...n[i], url: e.target.value }; handleFieldChange("links", n); }} placeholder="https://..." className={inputClass} />
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">Icon Name</span>
                        <input type="text" value={link.icon || ""} onChange={(e) => { const n = [...(content.links || [])]; n[i] = { ...n[i], icon: e.target.value }; handleFieldChange("links", n); }} placeholder="Globe, Github..." className={inputClass} />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block mb-0.5 uppercase">Badge</span>
                        <input type="text" value={link.badge || ""} onChange={(e) => { const n = [...(content.links || [])]; n[i] = { ...n[i], badge: e.target.value }; handleFieldChange("links", n); }} placeholder="NEW, HOT..." className={inputClass} />
                      </div>
                    </div>
                  </div>
                ))}
                {(!content.links || content.links.length === 0) && (
                  <p className="text-[11px] text-slate-500 italic py-2">No links yet. Click "+ Add Link" to get started.</p>
                )}
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Icon names: Globe, Github, Instagram, Twitter, Linkedin, Youtube, Mail, Phone, Star, Zap...</p>
            </div>
          </div>
        )}

{/* ── MAPS SECTION SPECIAL PANEL ─────────────────────────────── */}
        {section.type === "maps" && (
          <div className="pt-3 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="text-indigo-400">◈</span> Map Settings
            </h3>

            <div data-field-path="address">
              <label className={labelClass}>Address (recommended)</label>
              <input type="text" value={content.address || ""} onChange={(e) => handleFieldChange("address", e.target.value)} placeholder="e.g. 1600 Amphitheatre Pkwy, Mountain View" className={inputClass} />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">— or use Latitude / Longitude —</label>
              <div className="grid grid-cols-2 gap-2">
                <div data-field-path="lat">
                  <span className="text-[10px] text-slate-500 capitalize block mb-0.5">Latitude</span>
                  <input type="text" value={content.lat || ""} onChange={(e) => handleFieldChange("lat", e.target.value)} placeholder="37.4221" className={inputClass} />
                </div>
                <div data-field-path="lng">
                  <span className="text-[10px] text-slate-500 capitalize block mb-0.5">Longitude</span>
                  <input type="text" value={content.lng || ""} onChange={(e) => handleFieldChange("lng", e.target.value)} placeholder="-122.0841" className={inputClass} />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">Coordinates take priority over the address. Enter decimal degrees (e.g. 37.4221).</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div data-field-path="zoom">
                <label className={labelClass}>Zoom Level</label>
                <input type="number" value={content.zoom ?? 15} onChange={(e) => handleFieldChange("zoom", Number(e.target.value) || 15)} placeholder="15" className={inputClass} />
              </div>
              <div data-field-path="height">
                <label className={labelClass}>Height (px)</label>
                <input type="number" value={content.height ?? 380} onChange={(e) => handleFieldChange("height", Number(e.target.value) || 380)} placeholder="380" className={inputClass} />
              </div>
            </div>

            <div data-field-path="embedUrl">
              <label className={labelClass}>Or paste a full embed URL (optional)</label>
              <input type="text" value={content.embedUrl || ""} onChange={(e) => handleFieldChange("embedUrl", e.target.value)} placeholder="https://maps.google.com/maps?q=..." className={inputClass} />
            </div>
          </div>
        )}

        {/* ── WHATSAPP SECTION SPECIAL PANEL ─────────────────────────── */}
        {section.type === "whatsapp" && (
          <div className="pt-3 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="text-emerald-400">◈</span> WhatsApp Button
            </h3>

            <div data-field-path="phone">
              <label className={labelClass}>WhatsApp Number (with country code)</label>
              <input type="text" value={content.phone || ""} onChange={(e) => handleFieldChange("phone", e.target.value)} placeholder="e.g. 15551234567" className={inputClass} />
              <p className="text-[10px] text-slate-500 mt-1">Digits only, include country code (e.g. 1 for US, 91 for India).</p>
            </div>

            <div data-field-path="buttonText">
              <label className={labelClass}>Button Text</label>
              <input type="text" value={content.buttonText || ""} onChange={(e) => handleFieldChange("buttonText", e.target.value)} placeholder="Chat on WhatsApp" className={inputClass} />
            </div>

            <div data-field-path="defaultText">
              <label className={labelClass}>Prefilled Message</label>
              <textarea rows={3} value={content.defaultText || ""} onChange={(e) => handleFieldChange("defaultText", e.target.value)} placeholder="Hi! I'd like to know more about your services." className={`${inputClass} resize-none`} />
            </div>

            <div data-field-path="availability">
              <label className={labelClass}>Availability Note (optional)</label>
              <input type="text" value={content.availability || ""} onChange={(e) => handleFieldChange("availability", e.target.value)} placeholder="Typically replies within an hour" className={inputClass} />
            </div>
          </div>
        )}

        {/* ── VIDEO / YOUTUBE SECTION SPECIAL PANEL ──────────────────── */}
        {(section.type === "video" || section.type === "media") && (
          <div className="pt-3 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="text-red-400">▶</span> YouTube Video Settings
            </h3>

            <div className="p-3 rounded-xl bg-red-950/20 border border-red-800/30 text-[11px] text-red-300 font-medium flex items-start gap-2">
              <span className="text-base leading-none shrink-0">🎬</span>
              <span>Paste any YouTube video link, Shorts URL, or youtu.be share link below. Nexora will embed it automatically as a responsive player.</span>
            </div>

            <div data-field-path="youtubeUrl">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                YouTube Video URL
              </label>
              <input
                type="url"
                value={content.youtubeUrl || ""}
                onChange={(e) => handleFieldChange("youtubeUrl", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1.5">
                Supports: youtube.com/watch?v= · youtube.com/shorts/ · youtu.be/ · Full embed URLs
              </p>
            </div>

            <div data-field-path="caption">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Video Caption (optional)
              </label>
              <input
                type="text"
                value={content.caption || ""}
                onChange={(e) => handleFieldChange("caption", e.target.value)}
                placeholder="e.g. Watch our product demo"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>
        )}

        {/* ── NAVBAR SPECIAL PANEL ─────────────────────────────── */}
        {section.type === "navbar" && (
          <div className="pt-3 border-t border-slate-800 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="text-indigo-400">◈</span> Navigation Bar Options
            </h3>

            {/* Logo Image URL + Stock Picker */}
            <div data-field-path="logoImage">
              <label className={labelClass}>Image Logo (Optional)</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={content.logoImage || content.logo || (section as any).logoImage || ""}
                  onChange={(e) => {
                    handleFieldChange("logoImage", e.target.value);
                    updateSection(section.id, { logoImage: e.target.value });
                  }}
                  placeholder="https://example.com/logo.png"
                  className={inputClass}
                />
                {onOpenImagePicker && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenImagePicker(
                        content.logoImage || content.logo || (section as any).logoImage || "",
                        (url) => {
                          handleFieldChange("logoImage", url);
                          updateSection(section.id, { logoImage: url });
                        }
                      )
                    }
                    className="px-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg border border-slate-700 transition-colors flex items-center justify-center shrink-0"
                    title="Pick / Search Stock Logo Image"
                  >
                    <ImageIcon size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Logo Size Adjustment */}
            <div data-field-path="logoWidth" className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className={labelClass}>Logo Display Size</label>
                <span className="text-[11px] font-mono text-indigo-400 font-bold">
                  {content.logoWidth || (section as any).logoWidth || 36}px
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={20}
                  max={160}
                  step={2}
                  value={content.logoWidth || (section as any).logoWidth || 36}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    handleFieldChange("logoWidth", val);
                    updateSection(section.id, { logoWidth: val });
                  }}
                  className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <input
                  type="number"
                  min={20}
                  max={200}
                  value={content.logoWidth || (section as any).logoWidth || 36}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 36;
                    handleFieldChange("logoWidth", val);
                    updateSection(section.id, { logoWidth: val });
                  }}
                  className="w-14 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white text-center font-mono"
                />
              </div>
            </div>

            {/* Primary CTA Button */}
            <div data-field-path="ctaText" className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/30 space-y-2">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-indigo-400">Primary Call To Action Button</label>
              <input
                type="text"
                value={content.ctaText || ""}
                onChange={(e) => handleFieldChange("ctaText", e.target.value)}
                placeholder="Button text (e.g. Get Started)"
                className={inputClass}
              />
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={content.ctaLink || ""}
                  onChange={(e) => handleFieldChange("ctaLink", e.target.value)}
                  placeholder="Button Link (e.g. #contact or wa.me/...)"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setLinkModalState({ isOpen: true, currentUrl: content.ctaLink || "", fieldPath: "ctaLink" })}
                  className="px-2.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                  title="Configure WhatsApp or Link Action"
                >
                  <MessageCircle size={12} /> WhatsApp
                </button>
              </div>
            </div>

            {/* Navigation Menu Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Nav Menu Links ({(content.links || []).length})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const cur = content.links || [];
                    handleFieldChange("links", [...cur, { label: "New Link", url: "#" }]);
                  }}
                  className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1"
                >
                  <Plus size={12} /> Add Link
                </button>
              </div>
              <div className="space-y-2 pl-2 border-l-2 border-slate-800">
                {(content.links || []).map((link: any, i: number) => {
                  const labelVal = typeof link === "string" ? link : link.label || link.name || "";
                  const urlVal = typeof link === "string" ? "#" : link.url || "#";
                  return (
                    <div key={i} data-field-path={`links.${i}`} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-indigo-300">Link #{i + 1}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => moveArrayItem("links", i, "up")} disabled={i === 0} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"><ChevronUp size={12} /></button>
                          <button type="button" onClick={() => moveArrayItem("links", i, "down")} disabled={i === (content.links || []).length - 1} className="p-0.5 text-slate-400 hover:text-white disabled:opacity-20"><ChevronDown size={12} /></button>
                          <button type="button" onClick={() => removeArrayItem("links", i)} className="p-0.5 text-slate-400 hover:text-rose-400"><X size={12} /></button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={labelVal}
                        onChange={(e) => {
                          const n = [...(content.links || [])];
                          n[i] = typeof n[i] === "object" ? { ...n[i], label: e.target.value } : { label: e.target.value, url: "#" };
                          handleFieldChange("links", n);
                        }}
                        placeholder="Link label (e.g. About)"
                        className={inputClass}
                      />
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={urlVal}
                          onChange={(e) => {
                            const n = [...(content.links || [])];
                            n[i] = typeof n[i] === "object" ? { ...n[i], url: e.target.value } : { label: labelVal, url: e.target.value };
                            handleFieldChange("links", n);
                          }}
                          placeholder="https://... or #section"
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setLinkModalState({
                              isOpen: true,
                              currentUrl: urlVal,
                              fieldPath: `links.${i}.url`,
                            })
                          }
                          className="px-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                          title="Configure WhatsApp or Link Action"
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content Fields (for all other section types) */}
        {section.type !== "digital_card" && section.type !== "links" && section.type !== "maps" && section.type !== "whatsapp" && section.type !== "navbar" && (
        <div className="pt-3 border-t border-slate-800 space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Content Details
          </h3>

          {Object.entries(content).map(([key, val]) => {
            // Strings
            if (typeof val === "string" || val === null || val === undefined) {
              const isImage = key.toLowerCase().includes("image") || key.toLowerCase().includes("avatar") || key.toLowerCase().includes("logo") || key.toLowerCase().includes("photo");

return (
                <div key={key} data-field-path={key}>
                  <label className={labelClass}>{key.replace(/([A-Z])/g, " $1")}</label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={val || ""}
                      onChange={(e) => handleFieldChange(key, e.target.value)}
                      placeholder={`Enter ${key}...`}
                      className={inputClass}
                    />
                    {isImage && onOpenImagePicker && (
                      <button
                        onClick={() =>
                          onOpenImagePicker(val || "", (newUrl) => handleFieldChange(key, newUrl))
                        }
                        className="px-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg border border-slate-700 transition-colors flex items-center justify-center"
                        title="Pick / Search Stock Image"
                      >
                        <ImageIcon size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            // Arrays (lists, items, projects, plans, categories, etc.)
            if (Array.isArray(val)) {
              return (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>{key.replace(/([A-Z])/g, " $1")} ({val.length})</label>
                    <button
                      onClick={() => addItemToArray(key)}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3 pl-2 border-l-2 border-slate-800">
                    {val.map((item: any, i: number) => {
                      if (typeof item === "string") {
                        return (
                          <div key={i} data-field-path={`${key}.${i}`} className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const next = [...val];
                                next[i] = e.target.value;
                                handleFieldChange(key, next);
                              }}
                              className={inputClass}
                            />
                            <button
                              onClick={() => duplicateArrayItem(key, i)}
                              className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-indigo-400"
                              title="Duplicate Item"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              onClick={() => removeArrayItem(key, i)}
                              className="p-1.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400"
                              title="Delete Item"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      }

                      if (typeof item === "object" && item !== null) {
                        const itemTitle = item.name || item.title || item.role || item.question || item.value || `Item ${i + 1}`;

                        return (
                          <div key={i} data-field-path={`${key}.${i}`} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3 relative group shadow-sm">
                            {/* Item Action Bar */}
                            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-1">
                              <span className="text-[11px] font-bold text-indigo-300 truncate max-w-[130px]">
                                #{i + 1} {itemTitle}
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => moveArrayItem(key, i, "up")}
                                  disabled={i === 0}
                                  className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                                  title="Move Item Up"
                                >
                                  <ChevronUp size={13} />
                                </button>
                                <button
                                  onClick={() => moveArrayItem(key, i, "down")}
                                  disabled={i === val.length - 1}
                                  className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20"
                                  title="Move Item Down"
                                >
                                  <ChevronDown size={13} />
                                </button>
                                <button
                                  onClick={() => duplicateArrayItem(key, i)}
                                  className="p-1 rounded text-slate-400 hover:text-indigo-400"
                                  title="Duplicate Item"
                                >
                                  <Copy size={12} />
                                </button>
                                <button
                                  onClick={() => removeArrayItem(key, i)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-400"
                                  title="Delete Item"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Object Properties Form Fields */}
                            {Object.entries(item).map(([subKey, subVal]) => {
                              const isSubImage = subKey.toLowerCase().includes("image") || subKey.toLowerCase().includes("avatar") || subKey.toLowerCase().includes("logo");

                              // Handle nested string arrays (e.g. features inside pricing plan)
                              if (Array.isArray(subVal)) {
                                return (
                                  <div key={subKey} className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{subKey}</span>
                                      <button
                                        onClick={() => {
                                          const nextVal = [...val];
                                          const currentSubList = nextVal[i][subKey] || [];
                                          nextVal[i] = {
                                            ...nextVal[i],
                                            [subKey]: [...currentSubList, typeof currentSubList[0] === "object" ? { name: "New Sub-Item", price: "$10" } : "New Bullet Feature"],
                                          };
                                          handleFieldChange(key, nextVal);
                                        }}
                                        className="text-[10px] text-indigo-400 font-bold hover:underline"
                                      >
                                        + Add {subKey}
                                      </button>
                                    </div>
                                    <div className="space-y-1 pl-1">
                                      {subVal.map((subItem: any, subIdx: number) => {
                                        if (typeof subItem === "string") {
                                          return (
                                            <div key={subIdx} className="flex items-center gap-1">
                                              <input
                                                type="text"
                                                value={subItem}
                                                onChange={(e) => {
                                                  const nextVal = [...val];
                                                  const subArray = [...nextVal[i][subKey]];
                                                  subArray[subIdx] = e.target.value;
                                                  nextVal[i] = { ...nextVal[i], [subKey]: subArray };
                                                  handleFieldChange(key, nextVal);
                                                }}
                                                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                              />
                                              <button
                                                onClick={() => {
                                                  const nextVal = [...val];
                                                  nextVal[i][subKey] = nextVal[i][subKey].filter((_: any, idx: number) => idx !== subIdx);
                                                  handleFieldChange(key, nextVal);
                                                }}
                                                className="p-1 text-slate-500 hover:text-rose-400"
                                              >
                                                <X size={11} />
                                              </button>
                                            </div>
                                          );
                                        }

                                        if (typeof subItem === "object" && subItem !== null) {
                                          return (
                                            <div key={subIdx} className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1 relative">
                                              <button
                                                onClick={() => {
                                                  const nextVal = [...val];
                                                  nextVal[i][subKey] = nextVal[i][subKey].filter((_: any, idx: number) => idx !== subIdx);
                                                  handleFieldChange(key, nextVal);
                                                }}
                                                className="absolute top-1 right-1 text-slate-500 hover:text-rose-400"
                                              >
                                                <X size={11} />
                                              </button>
                                               {Object.entries(subItem).map(([nestedK, nestedV]) => {
                                                 const isNestedImage = /image|photo|avatar|thumb|picture|logo/i.test(nestedK);
                                                 return (
                                                   <div key={nestedK}>
                                                     <span className="text-[9px] text-slate-500 uppercase">{nestedK}</span>
                                                     <div className="flex gap-1">
                                                       <input
                                                         type="text"
                                                         value={String(nestedV || "")}
                                                         onChange={(e) => {
                                                           const nextVal = [...val];
                                                           const subArray = [...nextVal[i][subKey]];
                                                           subArray[subIdx] = { ...subArray[subIdx], [nestedK]: e.target.value };
                                                           nextVal[i] = { ...nextVal[i], [subKey]: subArray };
                                                           handleFieldChange(key, nextVal);
                                                         }}
                                                         className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                                                       />
                                                       {isNestedImage && onOpenImagePicker && (
                                                         <button
                                                           type="button"
                                                           onClick={() =>
                                                             onOpenImagePicker(String(nestedV || ""), (newUrl) => {
                                                               const nextVal = [...val];
                                                               const subArray = [...nextVal[i][subKey]];
                                                               subArray[subIdx] = { ...subArray[subIdx], [nestedK]: newUrl };
                                                               nextVal[i] = { ...nextVal[i], [subKey]: subArray };
                                                               handleFieldChange(key, nextVal);
                                                             })
                                                           }
                                                           className="px-2 bg-slate-950 border border-slate-800 text-indigo-400 rounded hover:bg-slate-900 flex items-center justify-center shrink-0"
                                                           title="Pick Dish Photo"
                                                         >
                                                           <ImageIcon size={12} />
                                                         </button>
                                                       )}
                                                     </div>
                                                   </div>
                                                 );
                                               })}
                                             </div>
                                          );
                                        }
                                        return null;
                                      })}
                                    </div>
                                  </div>
                                );
                              }

                              const isSubLink = subKey.toLowerCase().includes("url") || subKey.toLowerCase().includes("link");

                              return (
                                <div key={subKey} data-field-path={`${key}.${i}.${subKey}`}>
                                  <span className="text-[10px] text-slate-400 capitalize block mb-0.5">{subKey.replace(/([A-Z])/g, " $1")}</span>
                                  <div className="flex gap-1">
                                    <input
                                      type="text"
                                      value={String(subVal || "")}
                                      onChange={(e) => {
                                        const next = [...val];
                                        next[i] = { ...next[i], [subKey]: e.target.value };
                                        handleFieldChange(key, next);
                                      }}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                    />
                                    {isSubLink && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setLinkModalState({
                                            isOpen: true,
                                            currentUrl: String(subVal || ""),
                                            fieldPath: `${key}.${i}.${subKey}`,
                                          })
                                        }
                                        className="px-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                                        title="Configure WhatsApp or Link"
                                      >
                                        <MessageCircle size={12} /> WhatsApp
                                      </button>
                                    )}
                                    {isSubImage && onOpenImagePicker && (
                                      <button
                                        onClick={() =>
                                          onOpenImagePicker(String(subVal || ""), (newUrl) => {
                                            const next = [...val];
                                            next[i] = { ...next[i], [subKey]: newUrl };
                                            handleFieldChange(key, next);
                                          })
                                        }
                                        className="px-2 bg-slate-900 border border-slate-800 text-indigo-400 rounded-lg hover:bg-slate-800"
                                        title="Pick Image"
                                      >
                                        <ImageIcon size={13} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Fallback buttonText & WhatsApp Link fields for items if missing */}
                            {(!item.url && !item.link && !item.ctaLink) && (
                              <div data-field-path={`${key}.${i}.url`} className="pt-1 border-t border-slate-800/50">
                                <span className="text-[10px] text-slate-400 capitalize block mb-0.5">Button Link / WhatsApp</span>
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    value={String(item.url || item.ctaLink || item.link || "")}
                                    onChange={(e) => {
                                      const next = [...val];
                                      next[i] = { ...next[i], url: e.target.value };
                                      handleFieldChange(key, next);
                                    }}
                                    placeholder="https://... or wa.me/..."
                                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setLinkModalState({
                                        isOpen: true,
                                        currentUrl: String(item.url || item.ctaLink || item.link || ""),
                                        fieldPath: `${key}.${i}.url`,
                                      })
                                    }
                                    className="px-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0"
                                    title="Configure WhatsApp or Link"
                                  >
                                    <MessageCircle size={12} /> WhatsApp
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              );
            }

            // Key-Value Objects (e.g. socials, metadata, nested settings)
            if (typeof val === "object" && val !== null && !Array.isArray(val)) {
              return (
                <div key={key} className="space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <label className={labelClass}>{key.replace(/([A-Z])/g, " $1")}</label>
                  <div className="space-y-2.5">
                    {Object.entries(val).map(([subKey, subVal]) => {
                      const isSubImage = subKey.toLowerCase().includes("image") || subKey.toLowerCase().includes("avatar") || subKey.toLowerCase().includes("logo") || subKey.toLowerCase().includes("photo");

                      return (
                        <div key={subKey} data-field-path={`${key}.${subKey}`}>
                          <span className="text-[10px] text-slate-400 capitalize block mb-1">
                            {subKey.replace(/([A-Z])/g, " $1")}
                          </span>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={String(subVal ?? "")}
                              onChange={(e) => {
                                handleFieldChange(key, {
                                  ...(val as Record<string, any>),
                                  [subKey]: e.target.value,
                                });
                              }}
                              placeholder={`Enter ${subKey}...`}
                              className={inputClass}
                            />
                            {isSubImage && onOpenImagePicker && (
                              <button
                                onClick={() =>
                                  onOpenImagePicker(String(subVal || ""), (newUrl) =>
                                    handleFieldChange(key, {
                                      ...(val as Record<string, any>),
                                      [subKey]: newUrl,
                                    })
                                  )
                                }
                                className="px-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg border border-slate-700 transition-colors flex items-center justify-center"
                                title="Pick / Search Stock Image"
                              >
                                <ImageIcon size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Numbers and Booleans
            if (typeof val === "number" || typeof val === "boolean") {
              return (
                <div key={key}>
                  <label className={labelClass}>{key.replace(/([A-Z])/g, " $1")}</label>
                  <input
                    type={typeof val === "number" ? "number" : "text"}
                    value={String(val)}
                    onChange={(e) => {
                      const newV = typeof val === "number" ? parseFloat(e.target.value) || 0 : e.target.value === "true";
                      handleFieldChange(key, newV);
                    }}
                    className={inputClass}
                  />
                </div>
              );
            }

            return null;
          })}
        </div>
        )}

      </div>

      <LinkBuilderModal
        isOpen={linkModalState.isOpen}
        onClose={() => setLinkModalState({ isOpen: false, currentUrl: "", fieldPath: "" })}
        currentUrl={linkModalState.currentUrl}
        onSave={handleSaveInspectorLink}
        title="Configure Link & WhatsApp Action"
      />
    </div>
  );
}
