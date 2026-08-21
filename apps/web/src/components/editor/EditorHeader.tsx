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
    <header className="h-12 bg-slate-950/95 border-b border-slate-800/80 px-2 flex items-center z-40 select-none flex-shrink-0 backdrop-blur overflow-x-auto overscroll-x-contain no-scrollbar touch-manipulation">
      <div className="flex items-center justify-between gap-2 min-w-max w-full">
        {/* ── Left: Back & Project Name ─────────────────────────────── */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 shrink-0">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft size={14} />
          </Link>

          <span className="font-semibold text-xs text-white truncate max-w-[80px] sm:max-w-[150px] shrink-0">
            {projectName || "Untitled"}
          </span>

          {/* Save status dot */}
          <div className="flex items-center shrink-0">
            {isSaving ? (
              <span className="inline-flex items-center gap-1 text-amber-400 text-[10px] font-medium">
                <Loader2 size={9} className="animate-spin" />
                <span className="hidden sm:inline">Saving</span>
              </span>
            ) : saveError ? (
              <span className="inline-flex items-center gap-1 text-rose-400 text-[10px]" title={saveError}>
                <AlertCircle size={9} />
              </span>
            ) : isDirty ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
            ) : (
              <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
            )}
          </div>
        </div>

        {/* ── Center: View Mode Tabs ─────────────────────────────────── */}
        <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-full p-0.5 text-[11px] font-semibold shrink-0">
          <button
            onClick={() => setViewMode("visual")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${
              viewMode === "visual"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Eye size={11} />
            <span>Edit</span>
          </button>

          {developerMode && (
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${
                viewMode === "code"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Code2 size={11} />
              <span>Code</span>
            </button>
          )}

          <button
            onClick={() => setViewMode("preview")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full transition-all ${
              viewMode === "preview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe size={11} />
            <span>Preview</span>
          </button>
        </div>

        {/* ── Right: Undo/Redo, Dev, Save, Publish ──────────────────── */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Undo / Redo — icon only on small */}
          {!compactPreview && (
          <>
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
          </>
        )}

        {/* Quick Info / Brand Auto-Fill */}
        {onOpenBusinessSetup && (
          <button
            onClick={onOpenBusinessSetup}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-indigo-300 bg-indigo-950/70 border border-indigo-800/70 hover:bg-indigo-900 hover:text-white transition-all shadow-xs"
            title="Quick Business Profile & Auto-Fill"
          >
            <Zap size={11} className="text-amber-400" />
            <span className="hidden sm:inline">Quick Info</span>
          </button>
        )}

        {/* Dev toggle — icon only on narrow */}
        <button
          onClick={onToggleDeveloperMode}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold transition-all border ${
            developerMode
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
          }`}
          title="Toggle Developer Mode"
        >
          <Sparkles size={11} />
          <span className="hidden sm:inline">{developerMode ? "Dev On" : "Dev"}</span>
        </button>

        {/* Save */}
        <button
          onClick={() => save()}
          disabled={!isDirty || isSaving}
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 transition-all"
          title="Save (Ctrl+S)"
        >
          <Save size={12} />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Publish */}
        <button
          onClick={onPublishClick}
          disabled={isPublishing}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/20 active:scale-95 disabled:opacity-50 transition-all shrink-0"
        >
          {isPublishing ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span className="hidden xs:inline">Publishing…</span>
            </>
          ) : (
            <>
              <Globe size={12} />
              <span>Publish</span>
            </>
          )}
        </button>
        </div>
      </div>
    </header>
  );
}
