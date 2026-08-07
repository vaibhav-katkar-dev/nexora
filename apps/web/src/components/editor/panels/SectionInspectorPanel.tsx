"use client";

import { useEditorStore } from "@/store/editorStore";
import { useState, useEffect, useRef } from "react";
import { humanizeElementKey } from "@/lib/elementKeys";
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
} from "lucide-react";

interface SectionInspectorPanelProps {
  sectionId: string | null;
  onOpenImagePicker?: (currentUrl: string, onSelect: (url: string) => void) => void;
  selectedElementKey?: string | null;
  onClearElement?: () => void;
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
      return { icon: "Sparkles", title: "New Feature", desc: "Detailed description of this feature capability." };
    case "portfolio_grid":
      return { name: "New Project", desc: "Project overview and case study details.", tag: "Web / AI", url: "#" };
    case "pricing":
      return { name: "Pro Plan", price: "$49", period: "/mo", desc: "For growing teams", features: ["Unlimited Access", "Priority Support"], isPopular: false, badge: "" };
    case "menu_list":
      if (keyName === "categories") {
        return { name: "New Category", items: [{ name: "Signature Dish", desc: "Fresh ingredients", price: "$18" }] };
      }
      return { name: "New Item", desc: "Description of ingredients", price: "$15", badge: "" };
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
    default:
      return { title: "New Item", desc: "Description text..." };
  }
}

export function SectionInspectorPanel({
  sectionId,
  onOpenImagePicker,
  selectedElementKey,
  onClearElement,
}: SectionInspectorPanelProps) {
  const { config, updateSection, removeSection } = useEditorStore();
  const section = config?.sections.find((s) => s.id === sectionId);

  const inputClass =
    "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-sm";
  const labelClass = "block text-xs font-semibold text-slate-300 mb-1 capitalize";

  // ── Element-key → field-path auto-scroll & flash ─────────────────────────
  const panelScrollRef = useRef<HTMLDivElement>(null);
  const [flashedKey, setFlashedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedElementKey) return;
    // Normalize: strip "content." prefix for matching data-field-path
    const fieldPath = selectedElementKey.startsWith("content.")
      ? selectedElementKey.slice("content.".length)
      : selectedElementKey;

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

      {/* Element editing banner */}
      {selectedElementKey && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
            <p className="text-[11px] font-semibold text-indigo-200 truncate">
              Editing: {humanElementLabel || selectedElementKey}
            </p>
          </div>
          {onClearElement && (
            <button
              onClick={onClearElement}
              className="text-[10px] font-bold text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors flex-shrink-0"
              title="Deselect element"
            >
              ✕
            </button>
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
              <input type="text" value={content.ctaLink || ""} onChange={(e) => handleFieldChange("ctaLink", e.target.value)} placeholder="Button URL (e.g. mailto:...)" className={inputClass} />
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

        {/* Dynamic Content Fields (for all other section types) */}
        {section.type !== "digital_card" && section.type !== "links" && (
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
                                              {Object.entries(subItem).map(([nestedK, nestedV]) => (
                                                <div key={nestedK}>
                                                  <span className="text-[9px] text-slate-500 uppercase">{nestedK}</span>
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
                                                </div>
                                              ))}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })}
                                    </div>
                                  </div>
                                );
                              }

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
    </div>
  );
}
