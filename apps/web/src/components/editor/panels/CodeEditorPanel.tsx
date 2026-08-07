"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useEditorStore } from "@/store/editorStore";
import { useToast } from "@/components/ui/Toast";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import {
  generateHtmlFromSections,
  generateThemeCss,
  generateInteractiveJs,
  parseFullHtmlDocument,
} from "@/lib/codeGenerator";
import {
  Sparkles,
  Zap,
  RefreshCw,
  Plus,
  PanelRight,
  PanelRightClose,
  Loader2,
} from "lucide-react";

const MonacoEditor = dynamic(
  () =>
    import("@monaco-editor/react").then((mod) => {
      mod.loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs" } });
      return mod.default;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    ),
  }
);

// ─── Language map for Monaco ────────────────────────────────────────────────
const LANG_MAP = { html: "html", css: "css", js: "javascript" } as const;
type TabType = keyof typeof LANG_MAP;

export function CodeEditorPanel() {
  const { customCode, setCustomCode, config, addSection } = useEditorStore();
  // Default to CSS tab so users land on styling first, not HTML
  const [tab, setTab] = useState<TabType>("css");
  const [showPreview, setShowPreview] = useState(true);
  const toast = useToast();

  // ── NOTE: No useEffect that auto-populates customCode.html here.
  // Tab switching ONLY changes which Monaco language pane is visible.
  // Content in each tab is NEVER auto-modified on tab switch.
  // Users must explicitly click action buttons to generate/load code.

  const handleConvertTemplateToHtml = () => {
    if (!config) return;
    const generatedHtml = generateHtmlFromSections(config.sections);
    setCustomCode("html", generatedHtml);
    toast.success("Template Converted to HTML!", "Template HTML code loaded into editor.");
  };

  const handleGenerateThemeCSS = () => {
    if (!config) return;
    const cssCode = generateThemeCss(config.theme);
    setCustomCode("css", cssCode + (customCode.css ? "\n\n" + customCode.css : ""));
    toast.success("Theme CSS Generated!", "Template CSS variables & classes loaded.");
  };

  const handleGenerateInteractiveJs = () => {
    if (!config) return;
    const jsCode = generateInteractiveJs(config.sections);
    setCustomCode("js", jsCode);
    toast.success("Interactive JS Generated!", "Added smooth scroll, navbar & FAQ handlers.");
  };

  const handleSyncHtmlToSection = () => {
    if (!customCode.html?.trim()) {
      toast.error("No HTML Code", "Write or generate HTML first before syncing.");
      return;
    }
    const newId = `custom_html-${Date.now()}`;
    addSection({
      id: newId,
      type: "custom_html",
      variant: "default",
      title: "Custom Code Block",
      subtitle: "Code block added from editor",
      content: { html: customCode.html },
      visible: true,
    });
    toast.success("Added as Section Block!", "Custom HTML synced into your visual section layout.");
  };

  const handleSplitFullHtml = () => {
    const raw = customCode.html || "";
    if (!raw.trim()) {
      toast.error("No HTML Code", "Paste your full single-file HTML document first.");
      return;
    }
    const result = parseFullHtmlDocument(raw);
    if (result.isFullDocument) {
      setCustomCode("html", result.html);
      if (result.css) {
        setCustomCode("css", (customCode.css ? customCode.css + "\n\n" : "") + result.css);
      }
      if (result.js) {
        setCustomCode("js", (customCode.js ? customCode.js + "\n\n" : "") + result.js);
      }
      toast.success(
        "Full HTML Auto-Split!",
        `Extracted ${result.extractedStyleCount} style block(s) to CSS & ${result.extractedScriptCount} script block(s) to JS.`
      );
    } else {
      toast.info("Standard HTML Snippet", "Your code is already clean HTML markup.");
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden select-none bg-slate-950">
      {/* ── Monaco Editor Pane ─────────────────────────────────────────────── */}
      <div className={`flex flex-col ${showPreview ? "w-full md:w-1/2" : "w-full"} h-full border-r border-slate-800 min-h-0`}>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-800 bg-slate-950 flex-shrink-0 overflow-x-auto">
          {(["css", "html", "js"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                tab === t ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}

          <div className="flex-1 min-w-[8px]" />

          {/* HTML tab action buttons */}
          {tab === "html" && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={handleSplitFullHtml}
                title="If you pasted a full HTML document with embedded <style>/<script>, click to auto-split into CSS and JS tabs"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-amber-400 hover:bg-amber-500/10 border border-amber-600/20 transition-all"
              >
                <Sparkles size={11} /> Auto-Split
              </button>
              <button
                onClick={handleConvertTemplateToHtml}
                title="Load all active visual sections as editable HTML markup"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-indigo-300 hover:bg-indigo-600/20 border border-indigo-500/30 transition-all"
              >
                <RefreshCw size={11} /> Load Template
              </button>
              <button
                onClick={handleSyncHtmlToSection}
                title="Save current HTML as a Custom Section Block in the visual layout"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-600/20 transition-all"
              >
                <Plus size={11} /> Add Section
              </button>
            </div>
          )}

          {/* CSS tab action */}
          {tab === "css" && (
            <button
              onClick={handleGenerateThemeCSS}
              title="Auto-fill CSS variables from current template theme"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-400 hover:bg-amber-500/10 border border-amber-600/20 mr-2 transition-all"
            >
              <Sparkles size={11} /> Theme CSS
            </button>
          )}

          {/* JS tab actions */}
          {tab === "js" && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={handleGenerateInteractiveJs}
                title="Generate interactive scripts (navbar, FAQ accordion, smooth scroll)"
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-400 hover:bg-amber-500/10 border border-amber-600/20 transition-all"
              >
                <Zap size={11} /> Auto JS
              </button>
            </div>
          )}

          {/* Preview toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              showPreview ? "bg-indigo-600/20 text-indigo-400 border border-indigo-600/30" : "text-slate-400 hover:text-white"
            }`}
          >
            {showPreview ? <PanelRightClose size={14} /> : <PanelRight size={14} />}
            <span className="hidden sm:inline">{showPreview ? "Hide Preview" : "Preview"}</span>
          </button>
        </div>

        {/* Context info banner */}
        <div className="px-3 py-1.5 border-b border-slate-800 bg-slate-950 flex-shrink-0">
          {tab === "css" && (
            <p className="text-[10px] text-slate-500">
              🎨 <b>CSS</b> is injected globally — extends &amp; overrides template styles. Use <code className="text-amber-400">⚡ Theme CSS</code> to scaffold CSS variables.
            </p>
          )}
          {tab === "html" && (
            <p className="text-[10px] text-slate-500">
              📄 <b>HTML</b> is appended after all template sections. Use <code className="text-indigo-300">Load Template</code> to import visual layout as HTML.
            </p>
          )}
          {tab === "js" && (
            <p className="text-[10px] text-slate-500">
              ⚡ <b>JS</b> runs after page load on the live site. Preview on the right shows your template with scripts applied.
            </p>
          )}
        </div>

        {/* Monaco Code Editor — always rendered, tab only changes language */}
        <div className="flex-1 min-h-0">
          <MonacoEditor
            height="100%"
            theme="vs-dark"
            language={LANG_MAP[tab]}
            value={customCode[tab] || ""}
            onChange={(val) => setCustomCode(tab, val || "")}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              wordWrap: "on",
              lineNumbers: "on",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>

      {/* ── Live Preview Pane ─────────────────────────────────────────────── */}
      {showPreview && (
        <div className="flex flex-col w-full md:w-1/2 h-1/2 md:h-full min-h-0 bg-slate-900">
          {/* Preview header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950 flex-shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-400 font-mono ml-2">Live Site Preview</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded-full">
              ✦ Template + {tab.toUpperCase()} applied
            </span>
          </div>

          {/* ── Single unified preview for ALL tabs (CSS, HTML, JS) ─────────
               SiteRenderer already:
               - Injects customCode.css as a <style> tag
               - Renders customCode.html via dangerouslySetInnerHTML below sections
               - Executes customCode.js via a <script> injection after 200ms
               So switching tabs never changes the preview renderer — only
               what you're editing in Monaco changes. ─────────────────────── */}
          <div className="flex-1 min-h-0 overflow-auto bg-white/5">
            {config ? (
              <SiteRenderer config={config} customCode={customCode} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                <p className="text-xs font-medium">No project loaded</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
