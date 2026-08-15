"use client";

import { useState, useRef } from "react";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { DeviceFrame, DeviceFrameViewport } from "@/components/editor/DeviceFrame";
import { useToast } from "@/components/ui/Toast";
import {
  X,
  Monitor,
  Tablet,
  Smartphone,
  Copy,
  Download,
  Pencil,
  Layers,
  Sparkles,
  Palette,
  Code,
  Check,
  Eye,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";

interface AdminTemplatePreviewModalProps {
  data: {
    _id: string;
    name: string;
    slug?: string;
    category: string;
    author?: string;
    version?: string;
    status?: string;
    defaultConfig: any;
  };
  onClose: () => void;
  onEdit?: (templateId: string) => void;
}

export function AdminTemplatePreviewModal({
  data,
  onClose,
  onEdit,
}: AdminTemplatePreviewModalProps) {
  const toast = useToast();
  const [viewport, setViewport] = useState<DeviceFrameViewport>("desktop");
  const [interactive, setInteractive] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const config = data.defaultConfig || {};
  const theme = config.theme || {};
  const sections: any[] = config.sections || [];
  const customCode = config.customCode || {};

  const handleCopyJson = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      setCopied(true);
      toast.success("JSON copied to clipboard", "You can paste this template configuration anywhere.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy JSON");
    }
  };

  const handleExportJson = () => {
    try {
      const fileName = `${data.slug || data.name.toLowerCase().replace(/\s+/g, "-")}-template.json`;
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Template exported", `Saved as ${fileName}`);
    } catch {
      toast.error("Failed to export template");
    }
  };

  const scrollToSection = (sectionId: string) => {
    if (!scrollRef.current) return;
    const el = scrollRef.current.querySelector(
      `[id="${sectionId}"], [data-section-id="${sectionId}"]`
    ) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-4", "ring-indigo-500/80", "transition-all", "duration-500");
      setTimeout(() => el.classList.remove("ring-4", "ring-indigo-500/80"), 1200);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex flex-col p-2 sm:p-4 lg:p-6 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full h-full flex flex-col overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Top Header Toolbar ────────────────────────────────────────────── */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Template Details */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-extrabold text-sm shrink-0">
              {data.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-sm sm:text-base tracking-tight">{data.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-800 text-indigo-300 border border-slate-700">
                  {data.category}
                </span>
                {data.status && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                      data.status === "published"
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                        : data.status === "draft"
                        ? "bg-amber-950/60 text-amber-300 border-amber-800/60"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {data.status}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                <span>slug: <code className="text-slate-300 font-mono">/{data.slug || data.name.toLowerCase().replace(/\s+/g, "-")}</code></span>
                <span>•</span>
                <span>v{data.version || "1.0.0"}</span>
                {data.author && (
                  <>
                    <span>•</span>
                    <span>By {data.author}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Viewport & Mode Controls */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-1 shadow-inner">
            <button
              onClick={() => setViewport("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewport === "desktop"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
              title="Desktop View (Full Screen Browser)"
            >
              <Monitor size={14} />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewport === "tablet"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
              title="Tablet View (768px Viewport)"
            >
              <Tablet size={14} />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewport === "mobile"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
              title="Mobile View (360px Android Viewport)"
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInteractive(!interactive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                interactive
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
              title={interactive ? "Switch to View-Only Mode" : "Switch to Interactive Editor Mode"}
            >
              {interactive ? <SlidersHorizontal size={13} className="text-amber-400" /> : <Eye size={13} />}
              <span className="hidden md:inline">{interactive ? "Interactive Editor" : "Static View"}</span>
            </button>

            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                showDrawer
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              }`}
              title="Toggle Sections & Theme Inspector Drawer"
            >
              <Layers size={13} />
              <span className="hidden md:inline">Inspector ({sections.length})</span>
            </button>

            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1.5"
              title="Copy Template Config JSON"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden lg:inline">{copied ? "Copied!" : "Copy JSON"}</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:text-white transition-all flex items-center gap-1.5"
              title="Export Template JSON File"
            >
              <Download size={13} />
              <span className="hidden lg:inline">Export</span>
            </button>

            {onEdit && (
              <button
                onClick={() => onEdit(data._id)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <Pencil size={13} />
                <span>Edit</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Main Workspace Body ───────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 flex relative overflow-hidden bg-slate-950">
          {/* Central Device Preview Frame */}
          <div className="flex-1 h-full w-full overflow-auto flex flex-col items-center justify-center p-2 sm:p-4">
            <DeviceFrame viewport={viewport} scrollRef={scrollRef}>
              <SiteRenderer config={config} interactive={interactive} />
            </DeviceFrame>
          </div>

          {/* Right Inspector & Section Drawer */}
          {showDrawer && (
            <aside className="w-80 border-l border-slate-800 bg-slate-900/95 backdrop-blur-md flex flex-col shrink-0 overflow-hidden animate-slide-in-right z-30">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
                <h4 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={14} className="text-indigo-400" /> Section & Theme Inspector
                </h4>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Theme Overview Card */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5 text-indigo-400">
                      <Palette size={13} /> Theme Tokens
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {theme.mode || "dark"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm" style={{ backgroundColor: theme.primaryColor || "#3B82F6" }} />
                      <span className="font-mono text-slate-300 truncate">{theme.primaryColor || "#3B82F6"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="w-4 h-4 rounded-full border border-white/20 shrink-0 shadow-sm" style={{ backgroundColor: theme.backgroundColor || "#090D16" }} />
                      <span className="font-mono text-slate-300 truncate">{theme.backgroundColor || "Default"}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1 font-mono pt-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Heading Font:</span>
                      <span className="text-slate-200">{theme.headingFont || "Inter"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Body Font:</span>
                      <span className="text-slate-200">{theme.bodyFont || "Inter"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Border Radius:</span>
                      <span className="text-slate-200">{theme.borderRadius || "12px"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Button Variant:</span>
                      <span className="text-slate-200">{theme.buttonVariant || "rounded"}</span>
                    </div>
                  </div>
                </div>

                {/* Custom Code Status */}
                {(customCode.css || customCode.js || customCode.html) && (
                  <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-800/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                      <Code size={13} /> Custom Injected Code
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                      {customCode.css && <span className="px-2 py-0.5 rounded-md bg-indigo-900/50 text-indigo-200 border border-indigo-700/50">CSS ({customCode.css.length} chars)</span>}
                      {customCode.js && <span className="px-2 py-0.5 rounded-md bg-emerald-900/50 text-emerald-200 border border-emerald-700/50">JS ({customCode.js.length} chars)</span>}
                      {customCode.html && <span className="px-2 py-0.5 rounded-md bg-amber-900/50 text-amber-200 border border-amber-700/50">HTML</span>}
                    </div>
                  </div>
                )}

                {/* Section Structure List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                    <span>SECTIONS ({sections.length})</span>
                    <span className="text-[10px] font-normal text-slate-500">Click to focus</span>
                  </div>

                  <div className="space-y-1.5">
                    {sections.map((sec: any, idx: number) => (
                      <div
                        key={sec.id || idx}
                        onClick={() => scrollToSection(sec.id)}
                        className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-indigo-500/50 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-lg bg-slate-900 text-indigo-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-800">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
                              {sec.title || sec.type}
                            </p>
                            <p className="text-[10px] font-mono text-slate-500 truncate">
                              id: {sec.id} · type: <span className="text-sky-400">{sec.type}</span>
                            </p>
                          </div>
                        </div>

                        {sec.visible === false && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-rose-950/80 text-rose-400 border border-rose-800/60">
                            Hidden
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
