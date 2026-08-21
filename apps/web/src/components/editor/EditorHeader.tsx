"use client";

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
  Sparkles,
} from "lucide-react";

interface EditorHeaderProps {
  onPublishClick: () => void;
  developerMode: boolean;
  onToggleDeveloperMode: () => void;
}

export function EditorHeader({
  onPublishClick,
  developerMode,
  onToggleDeveloperMode,
}: EditorHeaderProps) {
  const {
    projectName,
    projectSlug,
    viewMode,
    setViewMode,
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

  const compactPreview = viewMode === "preview";

  return (
    <header className="h-14 bg-slate-950/95 border-b border-slate-800/80 px-3 sm:px-4 flex items-center justify-between gap-3 z-40 select-none flex-shrink-0 backdrop-blur">
      {/* ── Left: Back & Project Metadata ───────────────────────────────────── */}
      <div className="flex items-center gap-2 min-w-0">
        <Link
          href="/dashboard"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Back to Dashboard"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <div className="hidden sm:block h-4 w-px bg-slate-800" />
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-white truncate max-w-[140px] sm:max-w-[220px]">
            {projectName || "Untitled Project"}
          </span>
          {projectSlug && (
            <span className="hidden xl:inline text-[10px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded-full">
              /{projectSlug}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-xs ml-1">
          {isSaving ? (
            <span className="inline-flex items-center gap-1.5 text-amber-400 text-[11px] font-medium bg-amber-950/30 px-2 py-0.5 rounded-full border border-amber-800/30 animate-pulse">
              <Loader2 size={11} className="animate-spin" /> Saving…
            </span>
          ) : saveError ? (
            <span
              className="inline-flex items-center gap-1 text-rose-400 text-[11px] font-medium bg-rose-950/30 px-2 py-0.5 rounded-full border border-rose-800/30"
              title={saveError}
            >
              <AlertCircle size={11} /> Save error
            </span>
          ) : isDirty ? (
            <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Unsaved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-400 text-[11px] font-medium">
              <CheckCircle2 size={11} /> Saved
            </span>
          )}
        </div>
      </div>

      {/* ── Center: View Modes & Viewport Switcher ────────────────────────── */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-full p-0.5 text-xs font-semibold">
          <button
            onClick={() => setViewMode("visual")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
              viewMode === "visual"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye size={13} />
            <span className="hidden md:inline">Edit</span>
          </button>
          {developerMode && (
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
                viewMode === "code"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Code2 size={13} />
              <span className="hidden md:inline">Code</span>
            </button>
          )}
          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${
              viewMode === "preview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe size={13} />
            <span className="hidden md:inline">Preview</span>
          </button>
        </div>
      </div>

      {/* ── Right: History, Developer Mode Toggle, Save & Publish ──────────── */}
      <div className="flex items-center gap-2">
        {!compactPreview && (
          <div className="hidden sm:flex items-center gap-0.5">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={15} />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={15} />
            </button>
          </div>
        )}

        <button
          onClick={onToggleDeveloperMode}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
            developerMode
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
          }`}
          title="Toggle Developer Mode"
        >
          <Sparkles size={13} />
          <span>{developerMode ? "Dev On" : "Dev"}</span>
        </button>

        <button
          onClick={() => save()}
          disabled={!isDirty || isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-all"
        >
          <Save size={14} />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={onPublishClick}
          disabled={isPublishing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all"
        >
          {isPublishing ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>Publishing…</span>
            </>
          ) : (
            <>
              <Globe size={14} />
              <span>Publish</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
