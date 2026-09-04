"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useEditorStore } from "@/store/editorStore";
import {
  ArrowLeft,
  Eye,
  Code2,
  Undo2,
  Redo2,
  Save,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Tablet,
  Pencil,
  Zap,
} from "lucide-react";

interface EditorHeaderProps {
  onPublishClick: () => void;
  developerMode: boolean;
  onToggleDeveloperMode: () => void;
  onOpenBusinessSetup?: () => void;
}

export function EditorHeader({
  onPublishClick,
  developerMode,
  onToggleDeveloperMode,
  onOpenBusinessSetup,
}: EditorHeaderProps) {
  const {
    projectName,
    projectSlug,
    published,
    viewMode,
    setViewMode,
    viewport,
    setViewport,
    isDirty,
    isSaving,
    saveError,
    isPublishing,
    save,
    undo,
    redo,
    past,
    future,
  } = useEditorStore();

  const isPreview = viewMode === "preview";

  // If mobile viewport was previously selected, default to desktop
  useEffect(() => {
    if (viewport === "mobile") {
      setViewport("desktop");
    }
  }, [viewport, setViewport]);

  return (
    <header className="h-14 bg-[#080d19] border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between z-40 select-none flex-shrink-0 backdrop-blur-md overflow-x-auto no-scrollbar touch-manipulation gap-2 sm:gap-4">
      {/* ── Left: Brand Logo, Back, Project Name & Status ── */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90 shrink-0"
          title="Back to Dashboard"
        >
          <img
            src="https://res.cloudinary.com/usj348ny/image/upload/v1788452134/okinsite.png"
            alt="OkiNSITE"
            className="h-6 md:h-7 w-auto object-contain shrink-0"
          />
        </Link>

        <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0" />

        <Link
          href="/dashboard"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft size={15} />
        </Link>

        <div className="flex items-center gap-2 min-w-0 shrink-0">
          <span className="font-bold text-xs sm:text-sm text-white truncate max-w-[100px] sm:max-w-[160px] md:max-w-[200px]">
            {projectName || "Untitled Site"}
          </span>

          {/* Published / Status pill */}
          <div className="flex items-center shrink-0">
            {isSaving ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Loader2 size={9} className="animate-spin" />
                <span className="hidden xs:inline">Saving</span>
              </span>
            ) : saveError ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20" title={saveError}>
                <AlertCircle size={9} />
                <span className="hidden xs:inline">Error</span>
              </span>
            ) : published ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Published</span>
              </span>
            ) : isDirty ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800/80 text-amber-300 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="hidden sm:inline">Unsaved</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800/60 text-slate-300 border border-slate-700/50">
                <CheckCircle2 size={10} className="text-emerald-400" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Center: Device Switcher, URL pill, Undo/Redo, Preview ── */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Device Switcher (Desktop / Tablet) */}
        <div className="flex items-center bg-[#0d1424] border border-slate-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setViewport("desktop")}
            className={`p-1.5 rounded-lg transition-all ${
              viewport !== "tablet"
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Desktop View"
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`p-1.5 rounded-lg transition-all ${
              viewport === "tablet"
                ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
            title="Tablet View"
          >
            <Tablet size={14} />
          </button>
        </div>

        {/* Site URL Pill (with edit button) */}
        <button
          onClick={onPublishClick}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1424] hover:bg-[#111a30] border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono transition-all group shrink-0"
          title="Change Custom URL / Slug"
        >
          <span className="text-slate-400">okinsite.com/</span>
          <span className="text-white font-semibold underline decoration-indigo-400/40 underline-offset-2">
            {projectSlug || "my-site"}
          </span>
          <Pencil size={11} className="text-slate-400 group-hover:text-indigo-400 transition-colors ml-0.5" />
        </button>

        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-0.5 bg-[#0d1424] border border-slate-800 rounded-xl p-1 shrink-0">
          <button
            onClick={undo}
            disabled={past.length === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={13} />
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={13} />
          </button>
        </div>

        {/* Preview Button */}
        <button
          onClick={() => setViewMode(isPreview ? "visual" : "preview")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
            isPreview
              ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20"
              : "bg-[#0d1424] text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800"
          }`}
          title={isPreview ? "Back to Edit" : "Full Preview"}
        >
          <Eye size={13} />
          <span className="hidden xs:inline">{isPreview ? "Edit Site" : "Preview"}</span>
        </button>

        {/* Developer Mode toggle */}
        {developerMode && (
          <button
            onClick={() => setViewMode(viewMode === "code" ? "visual" : "code")}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              viewMode === "code"
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-[#0d1424] text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Code2 size={12} />
            <span>Code</span>
          </button>
        )}
      </div>

      {/* ── Right: Quick Info, Save, Publish ── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Info / Brand Auto-Fill */}
        {onOpenBusinessSetup && (
          <button
            onClick={onOpenBusinessSetup}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 hover:bg-indigo-900/70 hover:text-white transition-all shadow-xs"
            title="Quick Business Details Auto-Fill"
          >
            <Zap size={12} className="text-amber-400" />
            <span>Quick Info</span>
          </button>
        )}

        {/* Save */}
        <button
          onClick={() => save()}
          disabled={!isDirty || isSaving}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold bg-[#0d1424] text-slate-200 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 disabled:opacity-40 transition-all shadow-xs shrink-0"
          title="Save changes"
        >
          <Save size={13} className="text-slate-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Publish */}
        <button
          onClick={onPublishClick}
          disabled={isPublishing}
          className="flex items-center gap-1.5 px-4 sm:px-5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          {isPublishing ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              <span className="hidden xs:inline">Publishing…</span>
            </>
          ) : (
            <>
              <Globe size={13} />
              <span>Publish</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
