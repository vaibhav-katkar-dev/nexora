"use client";

import { useState } from "react";
import { useEditorStore } from "@/store/editorStore";
import { Palette, Type, Layout, Sparkles, Moon, Sun, ChevronDown, ChevronUp, Check } from "lucide-react";

// ─── Preset Palettes ────────────────────────────────────────────────────────
const PALETTE_PRESETS = [
  {
    name: "Midnight Indigo",
    primary: "#6366F1",
    secondary: "#A855F7",
    accent: "#F59E0B",
    bg: "#0B0F19",
    text: "#F3F4F6",
    mode: "dark",
  },
  {
    name: "Neon Cyber",
    primary: "#06B6D4",
    secondary: "#8B5CF6",
    accent: "#EC4899",
    bg: "#030712",
    text: "#F9FAFB",
    mode: "dark",
  },
  {
    name: "Rose Gold",
    primary: "#F43F5E",
    secondary: "#EC4899",
    accent: "#F59E0B",
    bg: "#0F0A0A",
    text: "#FFF1F2",
    mode: "dark",
  },
  {
    name: "Emerald Minimal",
    primary: "#10B981",
    secondary: "#06B6D4",
    accent: "#F59E0B",
    bg: "#F8FAFC",
    text: "#0F172A",
    mode: "light",
  },
  {
    name: "Ocean Clean",
    primary: "#3B82F6",
    secondary: "#6366F1",
    accent: "#0EA5E9",
    bg: "#FFFFFF",
    text: "#111827",
    mode: "light",
  },
  {
    name: "Warm Sunset",
    primary: "#F97316",
    secondary: "#EF4444",
    accent: "#EAB308",
    bg: "#FFF7ED",
    text: "#1C1917",
    mode: "light",
  },
  {
    name: "Glacier Glass",
    primary: "#818CF8",
    secondary: "#C084FC",
    accent: "#34D399",
    bg: "#0B1120",
    text: "#E0E7FF",
    mode: "glassmorphism",
  },
  {
    name: "Slate Pro",
    primary: "#64748B",
    secondary: "#475569",
    accent: "#F59E0B",
    bg: "#F1F5F9",
    text: "#0F172A",
    mode: "light",
  },
];

const FONT_OPTIONS = [
  { label: "Inter — Modern Clean", value: "Inter" },
  { label: "Outfit — Tech Bold", value: "Outfit" },
  { label: "Playfair Display — Luxury Serif", value: "Playfair Display" },
  { label: "Roboto — Standard", value: "Roboto" },
  { label: "Plus Jakarta Sans — SaaS", value: "Plus Jakarta Sans" },
  { label: "DM Sans — Contemporary", value: "DM Sans" },
  { label: "Space Grotesk — Creative", value: "Space Grotesk" },
  { label: "Raleway — Elegant", value: "Raleway" },
];

const RADIUS_OPTIONS = [
  { label: "Sharp (0px)", value: "0px" },
  { label: "Slight (6px)", value: "6px" },
  { label: "Rounded (12px)", value: "12px" },
  { label: "Smooth (16px)", value: "16px" },
  { label: "Pill / Soft (24px)", value: "24px" },
];

// ─── ColorRow Component ──────────────────────────────────────────────────────
function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] font-semibold text-slate-400 w-20 shrink-0 capitalize">
        {label}
      </label>
      <input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer flex-shrink-0"
        title={`Pick ${label} color`}
      />
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        maxLength={7}
        className="flex-1 min-w-0 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
      />
    </div>
  );
}

export function ThemeInspectorPanel() {
  const { config, updateTheme } = useEditorStore();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const theme = config?.theme || {
    primaryColor: "#6366F1",
    secondaryColor: "#A855F7",
    accentColor: "#F59E0B",
    backgroundColor: "#0B0F19",
    textColor: "#F3F4F6",
    headingFont: "Inter",
    bodyFont: "Inter",
    borderRadius: "12px",
    mode: "dark" as const,
    spacingScale: "comfortable",
    animations: true,
  };

  // ── Apply a full palette preset atomically ───────────────────────────────
  const applyPreset = (p: typeof PALETTE_PRESETS[0]) => {
    updateTheme({
      primaryColor: p.primary,
      secondaryColor: p.secondary,
      accentColor: p.accent,
      backgroundColor: p.bg,
      textColor: p.text,
      mode: p.mode as any,
    });
  };

  // ── When mode switches, also update bg/text defaults ────────────────────
  const applyMode = (m: "dark" | "light" | "glassmorphism") => {
    const isDark = m === "dark" || m === "glassmorphism";
    updateTheme({
      mode: m,
      backgroundColor: isDark ? "#0B0F19" : "#F8FAFC",
      textColor: isDark ? "#F3F4F6" : "#111827",
    });
  };

  const inputClass =
    "w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors";

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-full flex-shrink-0 select-none overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex-shrink-0">
        <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Palette size={16} className="text-indigo-400" /> Design & Theme
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize colors, typography, and styles globally
        </p>
      </div>

      {/* Scrollable Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* ── Live Color Preview Row ─────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden border border-slate-800">
          <div
            className="h-10 w-full flex items-stretch"
            title="Current live palette preview"
          >
            {[
              { color: theme.primaryColor || "#6366F1", label: "Primary" },
              { color: theme.secondaryColor || "#A855F7", label: "Secondary" },
              { color: theme.accentColor || "#F59E0B", label: "Accent" },
              { color: theme.backgroundColor || "#0B0F19", label: "BG" },
              { color: theme.textColor || "#F3F4F6", label: "Text" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex-1 relative group"
                style={{ backgroundColor: s.color }}
                title={`${s.label}: ${s.color}`}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Theme Mode ────────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Theme Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "dark", label: "Dark", icon: Moon },
              { id: "light", label: "Light", icon: Sun },
              { id: "glassmorphism", label: "Glass", icon: Sparkles },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = theme.mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => applyMode(m.id as any)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/50 shadow-sm"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <Icon size={16} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Full Color Palette ────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-3">
            Color Palette
          </label>
          <div className="space-y-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <ColorRow
              label="Primary"
              value={theme.primaryColor || "#6366F1"}
              onChange={(v) => updateTheme({ primaryColor: v })}
            />
            <ColorRow
              label="Secondary"
              value={theme.secondaryColor || "#A855F7"}
              onChange={(v) => updateTheme({ secondaryColor: v })}
            />
            <ColorRow
              label="Accent"
              value={theme.accentColor || "#F59E0B"}
              onChange={(v) => updateTheme({ accentColor: v })}
            />
            <div className="border-t border-slate-800 pt-3 space-y-3">
              <ColorRow
                label="Background"
                value={theme.backgroundColor || "#0B0F19"}
                onChange={(v) => updateTheme({ backgroundColor: v })}
              />
              <ColorRow
                label="Text"
                value={theme.textColor || "#F3F4F6"}
                onChange={(v) => updateTheme({ textColor: v })}
              />
            </div>
          </div>
        </div>

        {/* ── Preset Palettes ──────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Preset Palettes
          </label>
          <div className="grid grid-cols-2 gap-2">
            {PALETTE_PRESETS.map((p) => {
              const isActive =
                theme.primaryColor === p.primary &&
                theme.backgroundColor === p.bg;
              return (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={`relative p-2.5 rounded-xl border text-left transition-all group ${
                    isActive
                      ? "border-indigo-500/60 bg-indigo-950/40"
                      : "border-slate-800 bg-slate-950 hover:border-slate-700"
                  }`}
                >
                  {/* Swatch Strip */}
                  <div className="flex gap-0.5 mb-1.5 rounded overflow-hidden h-3">
                    {[p.primary, p.secondary, p.accent, p.bg].map((c, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-colors">
                    {p.name}
                  </span>
                  {isActive && (
                    <span className="absolute top-1.5 right-1.5">
                      <Check size={11} className="text-indigo-400" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Typography ────────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Type size={14} className="text-indigo-400" /> Heading Font
          </label>
          <select
            value={theme.headingFont || "Inter"}
            onChange={(e) => updateTheme({ headingFont: e.target.value })}
            className={inputClass}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Type size={14} className="text-slate-500" /> Body Font
          </label>
          <select
            value={theme.bodyFont || "Inter"}
            onChange={(e) => updateTheme({ bodyFont: e.target.value })}
            className={inputClass}
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* ── Border Radius ─────────────────────────────────────────────── */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Layout size={14} className="text-indigo-400" /> Corner Roundness
          </label>
          <div className="grid grid-cols-2 gap-2">
            {RADIUS_OPTIONS.map((r) => {
              const isSelected = theme.borderRadius === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() => updateTheme({ borderRadius: r.value })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    isSelected
                      ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Advanced: Animations & Spacing ────────────────────────────── */}
        <div>
          <button
            onClick={() => setShowAdvanced((p) => !p)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1"
          >
            <span>Advanced Options</span>
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
              {/* Animations Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-300">Animations</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Hover effects & transitions</p>
                </div>
                <button
                  onClick={() => updateTheme({ animations: !theme.animations })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    theme.animations ? "bg-indigo-600" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      theme.animations ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Spacing Scale */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Spacing Scale
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["compact", "comfortable", "spacious"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateTheme({ spacingScale: s })}
                      className={`py-1.5 rounded-lg border text-[11px] font-semibold capitalize transition-all ${
                        theme.spacingScale === s
                          ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/50"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
