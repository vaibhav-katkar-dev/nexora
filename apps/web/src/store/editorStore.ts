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
  activeSectionId: string | null;
  selectedElementKey: string | null;
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
  pushHistorySnapshot: () => void;
  setConfig: (config: SiteConfigJSON, pushHistory?: boolean) => void;
  updateSection: (sectionId: string, updates: Record<string, any>) => void;
  duplicateSection: (sectionId: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;
  updateElementValue: (sectionId: string, elementKey: string, value: string | number, pushHistory?: boolean) => void;
  updateElementStyle: (sectionId: string, elementKey: string, styleUpdates: Record<string, string>) => void;
  moveSection: (fromSectionId: string, toSectionId: string) => void;
  addSection: (section: SiteConfigJSON["sections"][0]) => void;
  removeSection: (sectionId: string) => void;
  updateTheme: (theme: Partial<SiteConfigJSON["theme"]>) => void;
  setCustomCode: (key: "html" | "css" | "js", value: string) => void;
  setSeo: (updates: Partial<EditorState["seo"]>) => void;
  setProjectSlug: (slug: string) => void;
  setActiveSectionId: (sectionId: string | null) => void;
  setSelectedElementKey: (elementKey: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  selectElement: (sectionId: string, elementKey: string | null) => void;
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

// ─── Debounce history snapshot (text editing) ────────────────────────────────
// This prevents letter-by-letter undo entries while typing.
// A snapshot is committed after 800ms of typing inactivity.
let historySnapshotTimeout: ReturnType<typeof setTimeout> | null = null;

function scheduleDebouncedHistorySnapshot(
  get: () => EditorState,
  set: (fn: (s: EditorState) => Partial<EditorState>) => void
) {
  if (historySnapshotTimeout) clearTimeout(historySnapshotTimeout);
  historySnapshotTimeout = setTimeout(() => {
    const { config, customCode } = get();
    if (!config) return;
    const clonedConfig = JSON.parse(JSON.stringify(config));
    const clonedCode = JSON.parse(JSON.stringify(customCode));
    set((s) => ({
      past: [...s.past.slice(-49), { config: clonedConfig, customCode: clonedCode }],
      future: [],
    }));
  }, 800);
}

// ─── Store ──────────────────────────────────────────────────────────────────
export const useEditorStore = create<EditorState>((set, get) => ({
  projectId: null,
  projectName: "",
  projectSlug: "",
  config: null,
  activeSectionId: null,
  selectedElementKey: null,
  customCode: {},
  seo: { metaTitle: "", metaDescription: "" },
  isDirty: false,
  isSaving: false,
  saveError: null,
  isPublishing: false,
  viewMode: "preview",
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
      activeSectionId: project.config?.sections?.[0]?.id || null,
      selectedElementKey: null,
      customCode: project.customCode || {},
      seo: project.seo || { metaTitle: "", metaDescription: "" },
      isDirty: false,
      saveError: null,
      past: [],
      future: [],
      _skipAutoSave: false,
    }),

  pushHistorySnapshot: () => {
    const { config, customCode } = get();
    if (!config) return;
    const clonedConfig = JSON.parse(JSON.stringify(config));
    const clonedCode = JSON.parse(JSON.stringify(customCode));
    set((s) => ({
      past: [...s.past.slice(-49), { config: clonedConfig, customCode: clonedCode }],
      future: [],
    }));
  },

  setConfig: (config, pushHistory = true) => {
    const { config: prev, customCode } = get();
    const clonedPrev = prev ? JSON.parse(JSON.stringify(prev)) : null;
    const clonedCode = JSON.parse(JSON.stringify(customCode));

    set((s) => ({
      config,
      isDirty: true,
      past: pushHistory && clonedPrev ? [...s.past.slice(-49), { config: clonedPrev, customCode: clonedCode }] : s.past,
      future: pushHistory ? [] : s.future,
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
            // Deep-merge elementColors so updating one element's color never
            // wipes other elements' colors (shallow spread would replace the object).
            elementColors: updates.elementColors
              ? { ...(sec.elementColors || {}), ...updates.elementColors }
              : sec.elementColors,
            content: updates.content
              ? { ...(sec.content || {}), ...updates.content }
              : sec.content || {},
          }
        : sec
    );
    get().setConfig({ ...config, sections: newSections });
  },

  duplicateSection: (sectionId) => {
    const { config } = get();
    if (!config) return;
    const currentSections = Array.isArray(config.sections) ? config.sections : [];
    const idx = currentSections.findIndex((s) => s.id === sectionId);
    if (idx === -1) return;
    const targetSec = currentSections[idx];
    const newId = `${targetSec.type}-${Date.now()}`;
    const duplicatedSec = {
      ...JSON.parse(JSON.stringify(targetSec)),
      id: newId,
      title: targetSec.title ? `${targetSec.title} (Copy)` : undefined,
    };
    const nextSections = [...currentSections];
    nextSections.splice(idx + 1, 0, duplicatedSec);
    get().setConfig({ ...config, sections: nextSections });
  },

  toggleSectionVisibility: (sectionId) => {
    const { config } = get();
    if (!config) return;
    const currentSections = Array.isArray(config.sections) ? config.sections : [];
    const nextSections = currentSections.map((sec) =>
      sec.id === sectionId ? { ...sec, visible: sec.visible === false ? true : false } : sec
    );
    get().setConfig({ ...config, sections: nextSections });
  },

  updateElementValue: (sectionId, elementKey, value, pushHistory = true) => {
    const { config } = get();
    if (!config) return;

    // Deep clone config so object references inside past history snapshots are never mutated in-place
    const clonedConfig: SiteConfigJSON = JSON.parse(JSON.stringify(config));
    const currentSections = Array.isArray(clonedConfig.sections) ? clonedConfig.sections : [];
    const nextSections = currentSections.map((sec) => {
      if (sec.id !== sectionId) return sec;

      const normalizedKey = elementKey.replace(/^content\./, "");
      const topLevelKeys = new Set(["badge", "title", "subtitle", "logoImage", "logo", "image", "avatar", "backgroundImage", "bgImage"]);

      if (topLevelKeys.has(normalizedKey)) {
        const nextContent = { ...(sec.content || {}), [normalizedKey]: value };
        return { ...sec, [normalizedKey]: value, content: nextContent } as any;
      }

      const nextContent = (sec.content || {}) as Record<string, any>;
      const pathParts = normalizedKey.split(".").filter(Boolean);
      if (pathParts.length === 0) return sec;

      let cursor: Record<string, any> = nextContent;
      pathParts.forEach((part, index) => {
        const isLast = index === pathParts.length - 1;
        if (isLast) {
          if (typeof cursor[part] === "object" && cursor[part] !== null && !Array.isArray(cursor[part])) {
            if (cursor[part].url !== undefined || /image|avatar|logo|photo|thumb|poster/i.test(part)) {
              cursor[part] = { ...cursor[part], url: value, image: value, src: value };
            } else {
              cursor[part] = { ...cursor[part], label: value, title: value, name: value };
            }
          } else {
            cursor[part] = value;
          }
          return;
        }

        const nextValue = cursor[part];
        const nextPart = pathParts[index + 1];
        const shouldCreateArray = /^\d+$/.test(nextPart);

        if (nextValue && typeof nextValue === "object") {
          cursor = nextValue as Record<string, any>;
        } else if (typeof nextValue === "string" && !shouldCreateArray) {
          const converted = { label: nextValue, title: nextValue, name: nextValue };
          cursor[part] = converted;
          cursor = converted;
        } else {
          const nextContainer = shouldCreateArray ? [] : {};
          cursor[part] = nextContainer;
          cursor = nextContainer as Record<string, any>;
        }
      });

      return { ...sec, content: nextContent } as any;
    });

    // Apply config update WITHOUT immediate history push — history is debounced
    // so rapid typing (e.g. renaming a section title) collapses into ONE undo step.
    // Structural changes (add/remove/move section) use setConfig(…, true) directly.
    const newConfig = { ...clonedConfig, sections: nextSections };
    set((s) => ({ config: newConfig, isDirty: true, future: pushHistory ? [] : s.future }));
    scheduleAutoSave(get, set as any);
    if (pushHistory) scheduleDebouncedHistorySnapshot(get, set as any);
  },

  updateElementStyle: (sectionId, elementKey, styleUpdates) => {
    const { config } = get();
    if (!config) return;

    const currentSections = Array.isArray(config.sections) ? config.sections : [];
    const nextSections = currentSections.map((sec) => {
      if (sec.id !== sectionId) return sec;

      const normalizedKey = elementKey.replace(/^content\./, "");
      const existingStyles = (sec.elementStyles || {}) as Record<string, Record<string, string>>;
      const nextStyles = { ...existingStyles };
      const nextElementStyles = { ...(nextStyles[normalizedKey] || {}) } as Record<string, string>;

      Object.entries(styleUpdates).forEach(([property, value]) => {
        if (value === "" || value === null || value === undefined) {
          delete nextElementStyles[property];
        } else {
          nextElementStyles[property] = String(value);
        }
      });

      if (Object.keys(nextElementStyles).length > 0) {
        nextStyles[normalizedKey] = nextElementStyles;
      } else {
        delete nextStyles[normalizedKey];
      }

      return { ...sec, elementStyles: nextStyles } as any;
    });

    get().setConfig({ ...config, sections: nextSections });
  },

  moveSection: (fromSectionId, toSectionId) => {
    const { config } = get();
    if (!config) return;

    const currentSections = Array.isArray(config.sections) ? config.sections : [];
    const fromIndex = currentSections.findIndex((section) => section.id === fromSectionId);
    const toIndex = currentSections.findIndex((section) => section.id === toSectionId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

    const nextSections = [...currentSections];
    const [moved] = nextSections.splice(fromIndex, 1);
    nextSections.splice(toIndex, 0, moved);
    get().setConfig({ ...config, sections: nextSections });
  },

  addSection: (section) => {
    const { config } = get();
    const baseConfig = config || {
      meta: { title: "My Digital Presence", description: "Created with Oninsite Platform", category: "custom" },
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

  setActiveSectionId: (activeSectionId) => set({ activeSectionId }),
  setSelectedElementKey: (selectedElementKey) => set({ selectedElementKey }),
  selectSection: (sectionId) => set({ activeSectionId: sectionId, selectedElementKey: null }),
  selectElement: (sectionId, elementKey) =>
    set({
      activeSectionId: sectionId,
      selectedElementKey: elementKey,
    }),

  setViewMode: (viewMode) => set({ viewMode }),
  setViewport: (viewport) => set({ viewport }),

  undo: () => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const { past, config, customCode } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    const clonedPrevConfig = JSON.parse(JSON.stringify(prev.config));
    const clonedPrevCode = JSON.parse(JSON.stringify(prev.customCode));
    const clonedCurrentConfig = config ? JSON.parse(JSON.stringify(config)) : null;
    const clonedCurrentCode = JSON.parse(JSON.stringify(customCode));

    // Suppress auto-save during undo navigation
    set((s) => ({
      _skipAutoSave: true,
      config: clonedPrevConfig,
      customCode: clonedPrevCode,
      past: s.past.slice(0, -1),
      future: [{ config: clonedCurrentConfig!, customCode: clonedCurrentCode }, ...s.future.slice(0, 49)],
      isDirty: true,
    }));
    // Re-enable auto-save after brief delay
    setTimeout(() => set((s) => ({ ...s, _skipAutoSave: false })), 100);
  },

  redo: () => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const { future, config, customCode } = get();
    if (future.length === 0) return;
    const next = future[0];
    const clonedNextConfig = JSON.parse(JSON.stringify(next.config));
    const clonedNextCode = JSON.parse(JSON.stringify(next.customCode));
    const clonedCurrentConfig = config ? JSON.parse(JSON.stringify(config)) : null;
    const clonedCurrentCode = JSON.parse(JSON.stringify(customCode));

    set((s) => ({
      _skipAutoSave: true,
      config: clonedNextConfig,
      customCode: clonedNextCode,
      future: s.future.slice(1),
      past: [...s.past.slice(-49), { config: clonedCurrentConfig!, customCode: clonedCurrentCode }],
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
      await get().save();
      const res = await projectsApi.publish(projectId);
      set({ isPublishing: false });
      return res.data.staticUrl;
    } catch (err: any) {
      set({ isPublishing: false });
      throw err;
    }
  },
}));
