"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
  Link,
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

/** Compute position anchored tightly to a DOM element */
function getElementPos(el: HTMLElement, scrollRef?: React.RefObject<HTMLDivElement | null>): { top: number; left: number } | null {
  const rect = el.getBoundingClientRect();

  // Validate visibility within scroll container
  if (scrollRef?.current) {
    const cRect = scrollRef.current.getBoundingClientRect();
    if (rect.bottom < cRect.top - 30 || rect.top > cRect.bottom + 30) return null;
  }

  // Validate visibility within window
  if (rect.bottom < 36 || rect.top > window.innerHeight - 10) return null;

  const toolbarH = 44;
  const toolbarW = 380; // generous estimated width

  // Prefer above; fall below if no room above
  const topPos = rect.top - toolbarH - 6 < 56
    ? rect.bottom + 6
    : rect.top - toolbarH - 6;

  // Center on element, clamp so it never exits the viewport
  const idealLeft = rect.left + rect.width / 2 - toolbarW / 2;
  const leftPos = Math.max(8, Math.min(idealLeft, window.innerWidth - toolbarW - 8));

  return { top: topPos, left: leftPos };
}

/** Compute position for the section mini bar — bottom-left corner of section */
function getSectionBarPos(sectionId: string, scrollRef?: React.RefObject<HTMLDivElement | null>): { top: number; left: number } | null {
  const el = document.querySelector(`[data-section-id="${sectionId}"]`) as HTMLElement | null;
  if (!el) return null;
  const rect = el.getBoundingClientRect();

  if (scrollRef?.current) {
    const cRect = scrollRef.current.getBoundingClientRect();
    if (rect.bottom < cRect.top + 24 || rect.top > cRect.bottom - 24) return null;
  }

  if (rect.bottom < 56 || rect.top > window.innerHeight - 24) return null;

  const visibleBottom = Math.min(rect.bottom, window.innerHeight - 8);
  const topPos = Math.max(rect.top + 8, visibleBottom - 44);

  // Clamp left: never let the bar overflow the right edge of the viewport
  const estBarW = 270;
  const rawLeft = Math.max(rect.left + 8, 12);
  const leftPos = Math.min(rawLeft, window.innerWidth - estBarW - 8);

  return { top: topPos, left: leftPos };
}

/**
 * Compute smart dropdown styles for a given button ref.
 * Opens toward the center of the screen — flips vertical and horizontal axes
 * to avoid overflow.
 */
function getSmartDropdownStyle(
  btnRef: React.RefObject<HTMLButtonElement | null>,
  dropdownW: number,
  dropdownH: number
): React.CSSProperties {
  if (!btnRef.current) return { top: "100%", left: 0, marginTop: 6 };

  const rect = btnRef.current.getBoundingClientRect();
  const spaceRight = window.innerWidth - rect.left;
  const spaceBelow = window.innerHeight - rect.bottom;

  const style: React.CSSProperties = { position: "absolute" };

  // Vertical: prefer below, flip above if insufficient room
  if (spaceBelow < dropdownH + 16 && rect.top > dropdownH + 16) {
    style.bottom = "100%";
    style.marginBottom = 6;
  } else {
    style.top = "100%";
    style.marginTop = 6;
  }

  // Horizontal: prefer left-aligned, flip right-aligned if dropdown would clip right edge
  if (spaceRight < dropdownW + 8) {
    style.right = 0;
  } else {
    style.left = 0;
  }

  return style;
}

export function ContextToolbar({
  scrollRef,
  onRequestImageEdit,
  onOpenInspector,
}: ContextToolbarProps) {
  const config = useEditorStore((state) => state.config);
  const activeSectionId = useEditorStore((state) => state.activeSectionId);
  const selectedElementKey = useEditorStore((state) => state.selectedElementKey);
  const updateElementStyle = useEditorStore((state) => state.updateElementStyle);
  const updateSection = useEditorStore((state) => state.updateSection);
  const duplicateSection = useEditorStore((state) => state.duplicateSection);
  const toggleSectionVisibility = useEditorStore((state) => state.toggleSectionVisibility);
  const removeSection = useEditorStore((state) => state.removeSection);
  const moveSectionInStore = useEditorStore((state) => state.moveSection);

  // Toolbar positions
  const [elemPos, setElemPos] = useState<{ top: number; left: number } | null>(null);
  const [sectionBarPos, setSectionBarPos] = useState<{ top: number; left: number } | null>(null);

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [isAiRewriting, setIsAiRewriting] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Button refs for smart dropdown positioning
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const fontBtnRef = useRef<HTMLButtonElement>(null);
  const aiBtnRef = useRef<HTMLButtonElement>(null);

  // Dropdown styles (recomputed when each opens)
  const [colorDropStyle, setColorDropStyle] = useState<React.CSSProperties>({});
  const [fontDropStyle, setFontDropStyle] = useState<React.CSSProperties>({});
  const [aiDropStyle, setAiDropStyle] = useState<React.CSSProperties>({});

  // Detect actual mobile screen (not mobile viewport inside editor)
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  useEffect(() => {
    const check = () => setIsMobileScreen(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const section = config?.sections.find((s) => s.id === activeSectionId);
  const sectionIdx = config?.sections.findIndex((s) => s.id === activeSectionId) ?? -1;

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

  // Update both toolbar positions independently
  const updatePositions = useCallback(() => {
    if (!activeSectionId) {
      setElemPos(null);
      setSectionBarPos(null);
      return;
    }

    // Element toolbar — only when a specific element is selected
    if (selectedElementKey) {
      const el = document.querySelector(`[data-element-key="${selectedElementKey}"]`) as HTMLElement | null;
      if (el) {
        setElemPos(getElementPos(el, scrollRef));
      } else {
        setElemPos(null);
      }
    } else {
      setElemPos(null);
    }

    // Section mini bar — always when a section is active
    setSectionBarPos(getSectionBarPos(activeSectionId, scrollRef));
  }, [activeSectionId, selectedElementKey, scrollRef]);

  useEffect(() => {
    updatePositions();
    const interval = setInterval(updatePositions, 120);
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, true);

    const containerEl = scrollRef?.current;
    if (containerEl) {
      containerEl.addEventListener("scroll", updatePositions, { passive: true });
    }

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, true);
      if (containerEl) {
        containerEl.removeEventListener("scroll", updatePositions);
      }
    };
  }, [updatePositions]);

  // Close dropdowns when selection changes
  useEffect(() => {
    setShowColorPicker(false);
    setShowFontSizePicker(false);
    setShowAiMenu(false);
  }, [selectedElementKey, activeSectionId]);

  // Recompute dropdown direction each time one opens
  useEffect(() => {
    if (showColorPicker) setColorDropStyle(getSmartDropdownStyle(colorBtnRef, 200, 185));
  }, [showColorPicker]);

  useEffect(() => {
    if (showFontSizePicker) setFontDropStyle(getSmartDropdownStyle(fontBtnRef, 88, 200));
  }, [showFontSizePicker]);

  useEffect(() => {
    if (showAiMenu) setAiDropStyle(getSmartDropdownStyle(aiBtnRef, 160, 185));
  }, [showAiMenu]);

  // On actual mobile screens, hide floating toolbar — inspector panel handles editing
  if (!section || isMobileScreen) return null;

  // ── Handler functions ────────────────────────────────────────────────────

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
    // Deep-merge: preserve all other element color keys
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
          // Smart fallbacks
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

  // ── Common stop-propagation wrapper ──────────────────────────────────────
  const toolbarBase = "fixed z-[90] pointer-events-auto select-none";

  return (
    <>
      {/* ─── ELEMENT TOOLBAR ─────────────────────────────────────────────────
          Only shown when a specific element is selected.
          Anchored tightly to the clicked element, shows element actions only.
      ───────────────────────────────────────────────────────────────────── */}
      {selectedElementKey && elemPos && (
        <div
          className={`${toolbarBase} flex items-center gap-0.5 px-1.5 py-1 bg-slate-950/95 border border-slate-700/70 rounded-xl shadow-2xl backdrop-blur-md text-white text-xs`}
          style={{ top: `${elemPos.top}px`, left: `${elemPos.left}px`, maxWidth: "calc(100vw - 16px)" }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Element label badge */}
          <div className="px-1.5 py-0.5 bg-indigo-950/90 border border-indigo-700/40 rounded-lg flex items-center gap-1 font-mono text-[10px] text-indigo-300 font-semibold mr-0.5">
            <Sparkles size={10} className="text-indigo-400 shrink-0" />
            <span className="max-w-[72px] truncate">{elementKeyNormalized || "element"}</span>
          </div>

          <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

          {/* LINK / WHATSAPP — only for button/link elements */}
          {isButtonOrLink && (
            <button
              onClick={() => setShowLinkModal(true)}
              className="px-2 py-0.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1 font-semibold text-[10px] transition-all"
              title="Link / WhatsApp"
            >
              <MessageCircle size={11} className="text-emerald-200" />
              <span>Link</span>
            </button>
          )}

          {/* TEXT CONTROLS */}
          {isText && (
            <>
              {/* AI Rewrite */}
              <div className="relative">
                <button
                  ref={aiBtnRef}
                  onClick={() => {
                    const next = !showAiMenu;
                    setShowAiMenu(next);
                    setShowColorPicker(false);
                    setShowFontSizePicker(false);
                  }}
                  disabled={isAiRewriting}
                  className="px-2 py-0.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1 font-semibold text-[10px] transition-all disabled:opacity-50"
                  title="AI Rewrite"
                >
                  {isAiRewriting ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
                  <span>AI</span>
                </button>
                {showAiMenu && (
                  <div
                    className="p-1 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-[100] flex flex-col gap-0.5 w-40"
                    style={{ position: "absolute", ...aiDropStyle }}
                  >
                    <div className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AI Copilot</div>
                    {[
                      { key: "catchy", label: "🚀 Make Catchy" },
                      { key: "professional", label: "💼 Professional" },
                      { key: "shorter", label: "⚡ Make Shorter" },
                      { key: "grammar", label: "✨ Fix Grammar" },
                      { key: "titlecase", label: "🔤 Title Case" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => handleAiRewrite(key as any)}
                        className="px-2 py-1 text-left text-xs rounded-lg hover:bg-indigo-600/30 hover:text-white text-slate-200 transition-colors"
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
                className={`p-1 rounded hover:bg-slate-800 transition-colors ${currentStyles.fontWeight === "700" || currentStyles.fontWeight === "bold" ? "bg-indigo-600 text-white" : "text-slate-300"}`}
                title="Bold"
              >
                <Bold size={12} />
              </button>
              <button
                onClick={handleToggleItalic}
                className={`p-1 rounded hover:bg-slate-800 transition-colors ${currentStyles.fontStyle === "italic" ? "bg-indigo-600 text-white" : "text-slate-300"}`}
                title="Italic"
              >
                <Italic size={12} />
              </button>

              <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

              {/* Alignment — active state shows highlight */}
              <button
                onClick={() => handleSetAlign("left")}
                className={`p-1 rounded hover:bg-slate-800 transition-colors ${currentStyles.textAlign === "left" ? "bg-slate-700 text-white" : "text-slate-300"}`}
                title="Align Left"
              >
                <AlignLeft size={12} />
              </button>
              <button
                onClick={() => handleSetAlign("center")}
                className={`p-1 rounded hover:bg-slate-800 transition-colors ${currentStyles.textAlign === "center" ? "bg-slate-700 text-white" : "text-slate-300"}`}
                title="Align Center"
              >
                <AlignCenter size={12} />
              </button>
              <button
                onClick={() => handleSetAlign("right")}
                className={`p-1 rounded hover:bg-slate-800 transition-colors ${currentStyles.textAlign === "right" ? "bg-slate-700 text-white" : "text-slate-300"}`}
                title="Align Right"
              >
                <AlignRight size={12} />
              </button>

              <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

              {/* Color picker — smart positioning */}
              <div className="relative">
                <button
                  ref={colorBtnRef}
                  onClick={() => {
                    const next = !showColorPicker;
                    setShowColorPicker(next);
                    setShowAiMenu(false);
                    setShowFontSizePicker(false);
                  }}
                  className="p-1 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-0.5"
                  title="Text Color"
                >
                  <Palette size={12} />
                  {currentColor && (
                    <span className="w-2 h-2 rounded-full border border-white/20 inline-block" style={{ background: currentColor }} />
                  )}
                </button>
                {showColorPicker && (
                  <div
                    className="p-2 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-[100] w-48"
                    style={{ position: "absolute", ...colorDropStyle }}
                  >
                    <div className="grid grid-cols-6 gap-1 mb-2">
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
                      className="w-full h-7 rounded cursor-pointer bg-transparent border border-slate-700 text-xs"
                    />
                    {currentColor && (
                      <button onClick={handleClearColor} className="mt-1.5 text-[10px] text-slate-400 hover:text-rose-400 w-full text-center">
                        Reset color
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Font size — smart positioning */}
              <div className="relative">
                <button
                  ref={fontBtnRef}
                  onClick={() => {
                    const next = !showFontSizePicker;
                    setShowFontSizePicker(next);
                    setShowColorPicker(false);
                    setShowAiMenu(false);
                  }}
                  className="px-1.5 py-0.5 rounded hover:bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center gap-0.5"
                  title="Font Size"
                >
                  <Type size={11} />
                  <span>{currentStyles.fontSize ? currentStyles.fontSize.replace("px", "") : "—"}</span>
                </button>
                {showFontSizePicker && (
                  <div
                    className="p-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-[100] flex flex-col gap-0.5 w-20"
                    style={{ position: "absolute", ...fontDropStyle }}
                  >
                    {FONT_SIZES.map((sz) => (
                      <button
                        key={sz.label}
                        onClick={() => handleSetFontSize(sz.value)}
                        className={`px-2 py-1 text-left text-xs rounded-lg hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-between ${currentStyles.fontSize === sz.value ? "bg-indigo-600/30 text-indigo-200" : "text-slate-300"}`}
                      >
                        <span>{sz.label}</span>
                        <span className="text-[9px] text-slate-500 font-mono">{sz.value}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* IMAGE CONTROLS */}
          {isImage && (
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => onRequestImageEdit?.(section.id, selectedElementKey)}
                className="px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1 text-[10px]"
                title="Replace image"
              >
                <ImageIcon size={11} />
                <span>Replace</span>
              </button>
              <button
                onClick={handleDeleteImage}
                className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 text-xs border border-slate-700/80 transition-colors"
                title="Delete image"
              >
                <Trash2 size={11} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION MINI BAR ────────────────────────────────────────────────
          Always shown when a section is active (regardless of element selection).
          Anchored inside the section, bottom-left. Shows section-level actions.
      ───────────────────────────────────────────────────────────────────── */}
      {sectionBarPos && (
        <div
          className={`${toolbarBase} flex items-center gap-0.5 px-1.5 py-1 bg-slate-900/90 border border-slate-700/60 rounded-xl shadow-xl backdrop-blur-sm text-white text-xs`}
          style={{ top: `${sectionBarPos.top}px`, left: `${sectionBarPos.left}px`, maxWidth: "calc(100vw - 16px)" }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Section label */}
          <span className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono shrink-0">
            {section.type}
          </span>

          <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

          {/* Move Up / Down */}
          <button
            onClick={handleMoveUp}
            disabled={sectionIdx <= 0}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 transition-colors"
            title="Move Section Up"
          >
            <ChevronUp size={13} />
          </button>
          <button
            onClick={handleMoveDown}
            disabled={!config || sectionIdx >= config.sections.length - 1}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 transition-colors"
            title="Move Section Down"
          >
            <ChevronDown size={13} />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />

          {/* Visibility */}
          <button
            onClick={() => toggleSectionVisibility(section.id)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={section.visible === false ? "Show Section" : "Hide Section"}
          >
            {section.visible === false ? <EyeOff size={13} className="text-rose-400" /> : <Eye size={13} />}
          </button>

          {/* Duplicate */}
          <button
            onClick={() => duplicateSection(section.id)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Duplicate Section"
          >
            <Copy size={13} />
          </button>

          {/* Delete */}
          <button
            onClick={() => removeSection(section.id)}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            title="Delete Section"
          >
            <Trash2 size={13} />
          </button>

          {/* Inspector */}
          {onOpenInspector && (
            <>
              <div className="w-px h-4 bg-slate-800 mx-0.5 shrink-0" />
              <button
                onClick={onOpenInspector}
                className="p-1 rounded text-indigo-400 hover:bg-indigo-950/50 transition-colors"
                title="Open Inspector"
              >
                <SlidersHorizontal size={13} />
              </button>
            </>
          )}
        </div>
      )}

      {/* ─── LINK MODAL ──────────────────────────────────────────────────── */}
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
