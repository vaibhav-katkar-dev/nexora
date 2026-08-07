import { create } from "zustand";
import { SiteConfigJSON } from "@ai-platform/shared";
import { projectsApi } from "@/lib/api";

// ─── History stack entry ────────────────────────────────────────────────────
interface HistoryEntry {
  config: SiteConfigJSON;
  customCode: { html?: string; css?: string; js?: string };
}

// ─── Editor Store Shape ─────────────────────────────────────────────────────
interface EditorState {
  projectId: string | null;
  projectName: string;
  projectSlug: string;
  config: SiteConfigJSON | null;
  customCode: { html?: string; css?: string; js?: string };
  seo: { metaTitle: string; metaDescription: string; ogImage?: string; keywords?: string[] };
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  isPublishing: boolean;
  viewMode: "visual" | "code" | "preview";
  viewport: "mobile" | "tablet" | "desktop";

  // Undo/Redo stacks (max 50 entries)
  past: HistoryEntry[];
  future: HistoryEntry[];

  // Internal flag to suppress auto-save during undo/redo navigation
  _skipAutoSave: boolean;

  // Actions
  loadProject: (project: any) => void;
  setConfig: (config: SiteConfigJSON) => void;
  updateSection: (sectionId: string, updates: Record<string, any>) => void;
  addSection: (section: SiteConfigJSON["sections"][0]) => void;
  removeSection: (sectionId: string) => void;
  updateTheme: (theme: Partial<SiteConfigJSON["theme"]>) => void;
  setCustomCode: (key: "html" | "css" | "js", value: string) => void;
  setSeo: (updates: Partial<EditorState["seo"]>) => void;
  setProjectSlug: (slug: string) => void;
  setViewMode: (mode: EditorState["viewMode"]) => void;
  setViewport: (viewport: EditorState["viewport"]) => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<void>;
  publish: () => Promise<string>;
}

// ─── Debounce auto-save ─────────────────────────────────────────────────────
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleAutoSave(
  get: () => EditorState,
  set: (fn: (s: EditorState) => Partial<EditorState>) => void
) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    const { projectId, config, customCode, seo, _skipAutoSave } = get();
    if (!projectId || !config || _skipAutoSave) return;
    set((s) => ({ ...s, isSaving: true, saveError: null }));
    try {
      await projectsApi.update(projectId, { config, customCode, seo });
      set((s) => ({ ...s, isSaving: false, isDirty: false }));
    } catch (err: any) {
      set((s) => ({ ...s, isSaving: false, saveError: err.message || "Auto-save failed" }));
    }
  }, 2500); // 2.5 second debounce
}

// ─── Store ──────────────────────────────────────────────────────────────────
export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  projectName: "",
  projectSlug: "",
  config: null,
  customCode: {},
  seo: { metaTitle: "", metaDescription: "" },
  isDirty: false,
  isSaving: false,
  saveError: null,
  isPublishing: false,
  viewMode: "visual",
  viewport: "desktop",
  past: [],
  future: [],
  _skipAutoSave: false,

  loadProject: (project) =>
    set({
      projectId: project._id,
      projectName: project.name,
      projectSlug: project.slug || "",
      config: project.config,
      customCode: project.customCode || {},
      seo: project.seo || { metaTitle: "", metaDescription: "" },
      isDirty: false,
      saveError: null,
      past: [],
      future: [],
      _skipAutoSave: false,
    }),

  setConfig: (config) => {
    const { config: prev, customCode } = get();

    set((s) => ({
      config,
      isDirty: true,
      past: prev ? [...s.past.slice(-49), { config: prev, customCode }] : s.past,
      future: [],
    }));
    scheduleAutoSave(get, set as any);
  },

  updateSection: (sectionId, updates) => {
    const { config } = get();
    if (!config) return;
    const currentSections = Array.isArray(config.sections) ? config.sections : [];
    const newSections = currentSections.map((sec) =>
      sec.id === sectionId
        ? {
            ...sec,
            ...updates,
            content: updates.content
              ? { ...(sec.content || {}), ...updates.content }
              : sec.content || {},
          }
        : sec
    );
    get().setConfig({ ...config, sections: newSections });
  },

  addSection: (section) => {
    const { config } = get();
    const baseConfig = config || {
      meta: { title: "My Digital Presence", description: "Created with Nexora Platform", category: "custom" },
      theme: {
        primaryColor: "#3B82F6",
        secondaryColor: "#8B5CF6",
        accentColor: "#F59E0B",
        backgroundColor: "#090D16",
        textColor: "#F8FAFC",
        fontFamily: "Inter",
        headingFont: "Inter",
        bodyFont: "Inter",
        borderRadius: "12px",
        buttonVariant: "rounded",
        cardVariant: "glass",
        shadow: "md",
        mode: "dark",
        spacingScale: "comfortable",
        animations: true,
      },
      sections: [],
    };
    const currentSections = Array.isArray(baseConfig.sections) ? baseConfig.sections : [];
    get().setConfig({ ...baseConfig, sections: [...currentSections, section] });
  },

  removeSection: (sectionId) => {
    const { config } = get();
    if (!config) return;
    const currentSections = Array.isArray(config.sections) ? config.sections : [];
    get().setConfig({ ...config, sections: currentSections.filter((s) => s.id !== sectionId) });
  },

  updateTheme: (themeUpdate) => {
    const { config } = get();
    if (!config) return;
    get().setConfig({ ...config, theme: { ...(config.theme || {}), ...themeUpdate } as any });
  },

  setCustomCode: (key, value) => {
    const { config, customCode } = get();
    if (!config) return;
    // Push to history so undo/redo works for code edits too
    set((s) => ({
      customCode: { ...s.customCode, [key]: value },
      isDirty: true,
      past: [...s.past.slice(-49), { config: config, customCode }],
      future: [],
    }));
    scheduleAutoSave(get, set as any);
  },

  setSeo: (updates) => {
    set((s) => ({ seo: { ...s.seo, ...updates }, isDirty: true }));
    scheduleAutoSave(get, set as any);
  },

  setProjectSlug: (slug) => set({ projectSlug: slug }),

  setViewMode: (viewMode) => set({ viewMode }),
  setViewport: (viewport) => set({ viewport }),

  undo: () => {
    const { past, config, customCode } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    // Suppress auto-save during undo navigation
    set((s) => ({
      _skipAutoSave: true,
      config: prev.config,
      customCode: prev.customCode,
      past: s.past.slice(0, -1),
      future: [{ config: config!, customCode }, ...s.future.slice(0, 49)],
      isDirty: true,
    }));
    // Re-enable auto-save after brief delay
    setTimeout(() => set((s) => ({ ...s, _skipAutoSave: false })), 100);
  },

  redo: () => {
    const { future, config, customCode } = get();
    if (future.length === 0) return;
    const next = future[0];
    set((s) => ({
      _skipAutoSave: true,
      config: next.config,
      customCode: next.customCode,
      future: s.future.slice(1),
      past: [...s.past.slice(-49), { config: config!, customCode }],
      isDirty: true,
    }));
    setTimeout(() => set((s) => ({ ...s, _skipAutoSave: false })), 100);
  },

  save: async () => {
    const { projectId, config, customCode, seo } = get();
    if (!projectId || !config) return;
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
    set({ isSaving: true, saveError: null });
    try {
      await projectsApi.update(projectId, { config, customCode, seo });
      set({ isSaving: false, isDirty: false });
    } catch (err: any) {
      const msg = err.message || "Failed to save. Please try again.";
      set({ isSaving: false, saveError: msg });
      throw new Error(msg);
    }
  },

  publish: async () => {
    const { projectId } = get();
    if (!projectId) throw new Error("No project loaded");
    set({ isPublishing: true });
    try {
      const res = await projectsApi.publish(projectId);
      set({ isPublishing: false });
      return res.data.staticUrl;
    } catch (err: any) {
      set({ isPublishing: false });
      throw err;
    }
  },
}));
