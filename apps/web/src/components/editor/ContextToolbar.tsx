"use client";

import { useEffect, useState, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";
import { normalizeElementKey } from "@/lib/editorElements";
import { aiApi } from "@/lib/api";
import { LinkBuilderModal } from "@/components/editor/LinkBuilderModal";
import {
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  Image as ImageIcon,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Sparkles,
  SlidersHorizontal,
  Type,
  Wand2,
  Loader2,
  MessageCircle,
  X,
  Check,
} from "lucide-react";

const COLOR_PRESETS = [
  "#F8FAFC", "#94A3B8", "#0F172A",
  "#F43F5E", "#EC4899", "#8B5CF6",
  "#3B82F6", "#06B6D4", "#10B981",
  "#FACC15", "#F59E0B", "#EF4444",
];

const FONT_SIZES = [
  { label: "XS", value: "12px" },
  { label: "SM", value: "14px" },
  { label: "MD", value: "16px" },
  { label: "LG", value: "20px" },
  { label: "XL", value: "28px" },
  { label: "2XL", value: "36px" },
  { label: "3XL", value: "48px" },
];

interface ContextToolbarProps {
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onRequestImageEdit?: (sectionId: string, elementKey: string) => void;
  onOpenInspector?: () => void;
}

export function ContextToolbar({
  onRequestImageEdit,
  onOpenInspector,
}: ContextToolbarProps) {
  const config = useEditorStore((state) => state.config);
  const activeSectionId = useEditorStore((state) => state.activeSectionId);
  const selectedElementKey = useEditorStore((state) => state.selectedElementKey);
  const setSelectedElementKey = useEditorStore((state) => state.setSelectedElementKey);
  const updateElementStyle = useEditorStore((state) => state.updateElementStyle);
  const updateSection = useEditorStore((state) => state.updateSection);
  const duplicateSection = useEditorStore((state) => state.duplicateSection);
  const toggleSectionVisibility = useEditorStore((state) => state.toggleSectionVisibility);
  const removeSection = useEditorStore((state) => state.removeSection);
  const moveSectionInStore = useEditorStore((state) => state.moveSection);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [isAiRewriting, setIsAiRewriting] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Detect actual mobile screen
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  useEffect(() => {
    const check = () => setIsMobileScreen(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close dropdowns when selection changes
  useEffect(() => {
    setShowColorPicker(false);
    setShowFontSizePicker(false);
    setShowAiMenu(false);
  }, [selectedElementKey, activeSectionId]);

  const section = config?.sections.find((s) => s.id === activeSectionId);
  const sectionIdx = config?.sections.findIndex((s) => s.id === activeSectionId) ?? -1;

  if (!section || isMobileScreen) return null;

  // Determine element type
  const isImage = !!selectedElementKey && /img|image|avatar|photo|logo|thumbnail|banner/i.test(selectedElementKey);
  const isText = !!selectedElementKey && !isImage;
  const elementKeyNormalized = selectedElementKey ? normalizeElementKey(selectedElementKey) : null;
  const isButtonOrLink = !!selectedElementKey && (
    /button|cta|url|link|ctaText|buttonText|secondaryCtaText/i.test(selectedElementKey) ||
    (elementKeyNormalized && ["ctaText", "secondaryCtaText", "buttonText", "url", "link", "ctaLink"].includes(elementKeyNormalized))
  );
  const currentStyles = (section && elementKeyNormalized ? section.elementStyles?.[elementKeyNormalized] : {}) || {};
  const elementColors = section?.elementColors || {};
  const currentColor = elementKeyNormalized ? elementColors[elementKeyNormalized] || currentStyles.color : undefined;

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleToggleBold = () => {
    if (!activeSectionId || !selectedElementKey) return;
    const isBold = currentStyles.fontWeight === "700" || currentStyles.fontWeight === "bold";
    updateElementStyle(activeSectionId, selectedElementKey, { fontWeight: isBold ? "normal" : "bold" });
  };

  const handleToggleItalic = () => {
    if (!activeSectionId || !selectedElementKey) return;
    const isItalic = currentStyles.fontStyle === "italic";
    updateElementStyle(activeSectionId, selectedElementKey, { fontStyle: isItalic ? "normal" : "italic" });
  };

  const handleSetAlign = (align: "left" | "center" | "right") => {
    if (!activeSectionId || !selectedElementKey) return;
    updateElementStyle(activeSectionId, selectedElementKey, { textAlign: align });
  };

  const handleSetColor = (color: string) => {
    if (!activeSectionId || !elementKeyNormalized) return;
    updateSection(activeSectionId, {
      elementColors: { ...elementColors, [elementKeyNormalized]: color },
    });
    setShowColorPicker(false);
  };

  const handleClearColor = () => {
    if (!activeSectionId || !elementKeyNormalized) return;
    const nextColors = { ...elementColors };
    delete nextColors[elementKeyNormalized!];
    updateSection(activeSectionId, { elementColors: nextColors });
    setShowColorPicker(false);
  };

  const handleSetFontSize = (size: string) => {
    if (!activeSectionId || !selectedElementKey) return;
    updateElementStyle(activeSectionId, selectedElementKey, { fontSize: size });
    setShowFontSizePicker(false);
  };

  const handleMoveUp = () => {
    if (!config || sectionIdx <= 0) return;
    const prevSec = config.sections[sectionIdx - 1];
    if (prevSec) moveSectionInStore(section.id, prevSec.id);
  };

  const handleMoveDown = () => {
    if (!config || sectionIdx >= config.sections.length - 1) return;
    const nextSec = config.sections[sectionIdx + 1];
    if (nextSec) moveSectionInStore(section.id, nextSec.id);
  };

  const handleDeleteImage = () => {
    if (!activeSectionId || !selectedElementKey) return;
    useEditorStore.getState().pushHistorySnapshot();
    useEditorStore.getState().updateElementValue(activeSectionId, selectedElementKey, "", true);
  };

  const handleAiRewrite = async (mode: "catchy" | "professional" | "shorter" | "grammar" | "titlecase") => {
    if (!activeSectionId || !selectedElementKey) return;
    setShowAiMenu(false);
    setIsAiRewriting(true);

    try {
      const targetEl = document.querySelector(`[data-element-key="${selectedElementKey}"]`) as HTMLElement | null;
      const currentText = targetEl?.innerText?.trim() || "";
      if (!currentText) return;

      useEditorStore.getState().pushHistorySnapshot();

      let newText = "";
      if (mode === "titlecase") {
        newText = currentText.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
      } else {
        const prompts: Record<string, string> = {
          catchy: `Make this website text catchy, engaging, and modern: "${currentText}"`,
          professional: `Rewrite this text to sound authoritative and corporate: "${currentText}"`,
          shorter: `Rewrite this text to be short, punchy, and concise: "${currentText}"`,
          grammar: `Fix grammar and spelling mistakes in this text: "${currentText}"`,
        };

        try {
          const res = await aiApi.generate({ prompt: prompts[mode] });
          if (res?.data?.config?.sections) {
            const matchSec = res.data.config.sections.find((s: any) => s.id === activeSectionId || s.type === section.type);
            const normKey = normalizeElementKey(selectedElementKey);
            if (matchSec?.content && (matchSec.content as any)[normKey]) {
              newText = String((matchSec.content as any)[normKey]);
            }
          }
        } catch {
          // Fallback
        }

        if (!newText) {
          if (mode === "catchy") newText = `Elevate Your Impact: ${currentText}`;
          else if (mode === "professional") newText = currentText.charAt(0).toUpperCase() + currentText.slice(1);
          else if (mode === "shorter") newText = currentText.split(".")[0];
          else if (mode === "grammar") newText = currentText.trim();
        }
      }

      if (newText) {
        useEditorStore.getState().updateElementValue(activeSectionId, selectedElementKey, newText, true);
        if (targetEl) targetEl.innerText = newText;
      }
    } catch (e) {
      console.error("AI rewrite error", e);
    } finally {
      setIsAiRewriting(false);
    }
  };

  const handleSaveLink = (newUrl: string) => {
    if (!activeSectionId || !selectedElementKey) return;
    useEditorStore.getState().pushHistorySnapshot();
    const normKey = normalizeElementKey(selectedElementKey);
    let targetLinkKey = "ctaLink";
    if (normKey.includes("secondary")) targetLinkKey = "secondaryCtaLink";
    else if (normKey.includes("link") || normKey.includes("url")) targetLinkKey = normKey;

    updateSection(activeSectionId, { [targetLinkKey]: newUrl });
    useEditorStore.getState().updateElementValue(activeSectionId, targetLinkKey, newUrl, true);
  };

  return (
    <>
      {/* ─── Pinned Contextual Bar At Top of Canvas ───────────────────────── */}
      <div className="sticky top-2 z-40 mb-3 flex items-center justify-center w-full pointer-events-none">
        <div
          className="pointer-events-auto flex items-center gap-1 px-3 py-1.5 bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md text-white text-xs max-w-full overflow-x-auto transition-all animate-fade-in"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Element Mode Controls */}
          {selectedElementKey ? (
            <>
              {/* Element Label Badge */}
              <div className="px-2 py-0.5 bg-indigo-950/90 border border-indigo-700/50 rounded-lg flex items-center gap-1 font-mono text-[11px] text-indigo-300 font-semibold shrink-0">
                <Sparkles size={11} className="text-indigo-400 shrink-0" />
                <span className="max-w-[100px] truncate">{elementKeyNormalized || "element"}</span>
              </div>

              <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

              {/* Link Builder Button */}
              {isButtonOrLink && (
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 font-semibold text-xs transition-all shadow-sm shrink-0"
                  title="Configure Link / WhatsApp"
                >
                  <MessageCircle size={12} className="text-emerald-200" />
                  <span>Link</span>
                </button>
              )}

              {/* Text Controls */}
              {isText && (
                <>
                  {/* AI Rewrite Menu */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowAiMenu(!showAiMenu);
                        setShowColorPicker(false);
                        setShowFontSizePicker(false);
                      }}
                      disabled={isAiRewriting}
                      className="px-2.5 py-1 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1 font-semibold text-xs transition-all disabled:opacity-50 shadow-sm"
                      title="AI Rewrite"
                    >
                      {isAiRewriting ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                      <span>AI</span>
                    </button>
                    {showAiMenu && (
                      <div className="absolute top-full mt-2 left-0 p-1.5 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-[100] flex flex-col gap-0.5 w-44">
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Rewrite</div>
                        {[
                          { key: "catchy", label: "Make Catchy" },
                          { key: "professional", label: "Professional" },
                          { key: "shorter", label: "Short & Punchy" },
                          { key: "grammar", label: "Fix Grammar" },
                          { key: "titlecase", label: "Title Case" },
                        ].map(({ key, label }) => (
                          <button
                            key={key}
                            onClick={() => handleAiRewrite(key as any)}
                            className="px-2 py-1.5 text-left text-xs rounded-lg hover:bg-indigo-600/30 hover:text-white text-slate-200 transition-colors"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

                  {/* Bold / Italic */}
                  <button
                    onClick={handleToggleBold}
                    className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${currentStyles.fontWeight === "700" || currentStyles.fontWeight === "bold" ? "bg-indigo-600 text-white" : "text-slate-300"}`}
                    title="Bold"
                  >
                    <Bold size={13} />
                  </button>
                  <button
                    onClick={handleToggleItalic}
                    className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${currentStyles.fontStyle === "italic" ? "bg-indigo-600 text-white" : "text-slate-300"}`}
                    title="Italic"
                  >
                    <Italic size={13} />
                  </button>

                  <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

                  {/* Text Align */}
                  <button
                    onClick={() => handleSetAlign("left")}
                    className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${currentStyles.textAlign === "left" ? "bg-slate-700 text-white" : "text-slate-300"}`}
                    title="Align Left"
                  >
                    <AlignLeft size={13} />
                  </button>
                  <button
                    onClick={() => handleSetAlign("center")}
                    className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${currentStyles.textAlign === "center" ? "bg-slate-700 text-white" : "text-slate-300"}`}
                    title="Align Center"
                  >
                    <AlignCenter size={13} />
                  </button>
                  <button
                    onClick={() => handleSetAlign("right")}
                    className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors ${currentStyles.textAlign === "right" ? "bg-slate-700 text-white" : "text-slate-300"}`}
                    title="Align Right"
                  >
                    <AlignRight size={13} />
                  </button>

                  <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

                  {/* Color Picker */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowColorPicker(!showColorPicker);
                        setShowAiMenu(false);
                        setShowFontSizePicker(false);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center gap-1"
                      title="Text Color"
                    >
                      <Palette size={13} />
                      {currentColor && (
                        <span className="w-2.5 h-2.5 rounded-full border border-white/30 inline-block" style={{ background: currentColor }} />
                      )}
                    </button>
                    {showColorPicker && (
                      <div className="absolute top-full mt-2 left-0 p-2.5 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-[100] w-52">
                        <div className="grid grid-cols-6 gap-1.5 mb-2">
                          {COLOR_PRESETS.map((c) => (
                            <button
                              key={c}
                              onClick={() => handleSetColor(c)}
                              className={`w-6 h-6 rounded-md border border-white/10 hover:scale-110 transition-transform ${currentColor?.toLowerCase() === c.toLowerCase() ? "ring-2 ring-white ring-offset-1 ring-offset-slate-900" : ""}`}
                              style={{ background: c }}
                              title={c}
                            />
                          ))}
                        </div>
                        <input
                          type="color"
                          value={currentColor || "#FFFFFF"}
                          onChange={(e) => handleSetColor(e.target.value)}
                          className="w-full h-8 rounded cursor-pointer bg-transparent border border-slate-700"
                        />
                        {currentColor && (
                          <button onClick={handleClearColor} className="mt-2 text-[11px] text-slate-400 hover:text-rose-400 w-full text-center">
                            Reset color
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Font Size */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowFontSizePicker(!showFontSizePicker);
                        setShowColorPicker(false);
                        setShowAiMenu(false);
                      }}
                      className="px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-300 font-mono text-[11px] flex items-center gap-1"
                      title="Font Size"
                    >
                      <Type size={12} />
                      <span>{currentStyles.fontSize ? currentStyles.fontSize.replace("px", "") : "—"}</span>
                    </button>
                    {showFontSizePicker && (
                      <div className="absolute top-full mt-2 left-0 p-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[100] flex flex-col gap-0.5 w-24">
                        {FONT_SIZES.map((sz) => (
                          <button
                            key={sz.label}
                            onClick={() => handleSetFontSize(sz.value)}
                            className={`px-2 py-1 text-left text-xs rounded-lg hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between ${currentStyles.fontSize === sz.value ? "bg-indigo-600/30 text-indigo-200" : "text-slate-300"}`}
                          >
                            <span>{sz.label}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{sz.value}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Image Controls */}
              {isImage && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onRequestImageEdit?.(section.id, selectedElementKey)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 text-xs shadow-sm"
                    title="Replace Image"
                  >
                    <ImageIcon size={12} />
                    <span>Replace Image</span>
                  </button>
                  <button
                    onClick={handleDeleteImage}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 text-xs border border-slate-700 transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}

              <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

              {/* Deselect element */}
              <button
                onClick={() => setSelectedElementKey(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Deselect Element"
              >
                <X size={13} />
              </button>
            </>
          ) : (
            /* Section Mode Controls */
            <>
              <span className="px-2 py-0.5 text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono shrink-0 bg-slate-800 rounded-md">
                {section.type}
              </span>

              <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

              {/* Move Up / Down */}
              <button
                onClick={handleMoveUp}
                disabled={sectionIdx <= 0}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 transition-colors"
                title="Move Section Up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={handleMoveDown}
                disabled={!config || sectionIdx >= config.sections.length - 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 transition-colors"
                title="Move Section Down"
              >
                <ChevronDown size={14} />
              </button>

              <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

              {/* Visibility Toggle */}
              <button
                onClick={() => toggleSectionVisibility(section.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title={section.visible === false ? "Show Section" : "Hide Section"}
              >
                {section.visible === false ? <EyeOff size={14} className="text-rose-400" /> : <Eye size={14} />}
              </button>

              {/* Duplicate Section */}
              <button
                onClick={() => duplicateSection(section.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Duplicate Section"
              >
                <Copy size={14} />
              </button>

              {/* Delete Section */}
              <button
                onClick={() => removeSection(section.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Delete Section"
              >
                <Trash2 size={14} />
              </button>

              {/* Inspector Panel Trigger */}
              {onOpenInspector && (
                <>
                  <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />
                  <button
                    onClick={onOpenInspector}
                    className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-950/50 transition-colors"
                    title="Open Inspector"
                  >
                    <SlidersHorizontal size={14} />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Link / WhatsApp Modal */}
      <LinkBuilderModal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        currentUrl={(section as any)?.ctaLink || (section as any)?.url || ""}
        onSave={handleSaveLink}
        title={`Configure Link / WhatsApp for ${selectedElementKey ? normalizeElementKey(selectedElementKey) : "Button"}`}
      />
    </>
  );
}
