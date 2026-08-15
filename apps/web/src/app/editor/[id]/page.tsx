"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { projectsApi } from "@/lib/api";
import { resolveElementValue } from "@/lib/editorElements";
import { useEditorStore } from "@/store/editorStore";
import { useToast } from "@/components/ui/Toast";
import { buildPublishedSiteUrl } from "@/lib/siteUrl";

import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorSidebar, SidebarTab } from "@/components/editor/EditorSidebar";
import { SectionListPanel } from "@/components/editor/panels/SectionListPanel";
import { SectionInspectorPanel } from "@/components/editor/panels/SectionInspectorPanel";
import { ThemeInspectorPanel } from "@/components/editor/panels/ThemeInspectorPanel";
import { SeoInspectorPanel } from "@/components/editor/panels/SeoInspectorPanel";
import { AiCopilotPanel } from "@/components/editor/panels/AiCopilotPanel";
import { AddSectionPanel } from "@/components/editor/panels/AddSectionPanel";
import { CodeEditorPanel } from "@/components/editor/panels/CodeEditorPanel";
import { CanvasPreview } from "@/components/editor/CanvasPreview";
import { PublishModal } from "@/components/editor/PublishModal";
import { QuickStartAuthModal } from "@/components/editor/QuickStartAuthModal";
import { ImagePickerModal } from "@/components/editor/ImagePickerModal";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { Loader2, Sparkles, Globe, ArrowRight } from "lucide-react";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = useEditorStore((state) => state.projectId);
  const projectName = useEditorStore((state) => state.projectName);
  const config = useEditorStore((state) => state.config);
  const activeSectionId = useEditorStore((state) => state.activeSectionId);
  const selectedElementKey = useEditorStore((state) => state.selectedElementKey);
  const loadProject = useEditorStore((state) => state.loadProject);
  const viewMode = useEditorStore((state) => state.viewMode);
  const setViewMode = useEditorStore((state) => state.setViewMode);
  const publish = useEditorStore((state) => state.publish);
  const save = useEditorStore((state) => state.save);
  const setProjectSlug = useEditorStore((state) => state.setProjectSlug);
  const setActiveSectionId = useEditorStore((state) => state.setActiveSectionId);
  const setSelectedElementKey = useEditorStore((state) => state.setSelectedElementKey);
  const selectSection = useEditorStore((state) => state.selectSection);
  const selectElement = useEditorStore((state) => state.selectElement);
  const updateElementValue = useEditorStore((state) => state.updateElementValue);
  const undo = useEditorStore((state) => state.undo);
  const redo = useEditorStore((state) => state.redo);

  const [activeTab, setActiveTab] = useState<SidebarTab>("sections");
  const [isLoading, setIsLoading] = useState(true);
  const [developerMode, setDeveloperMode] = useState(false);
  const [showSlugModal, setShowSlugModal] = useState(false);
  const [showQuickStartAuthModal, setShowQuickStartAuthModal] = useState(false);
  const [isGuestQuickStart, setIsGuestQuickStart] = useState(false);
  const [currentSlug, setCurrentSlug] = useState("");

  // Image Picker state
  const [imagePickerState, setImagePickerState] = useState<{
    isOpen: boolean;
    currentUrl: string;
    onSelect?: (url: string) => void;
  }>({ isOpen: false, currentUrl: "" });

  const toast = useToast();
  // Keep a stable ref to toast so fetchProject never stale-captures it
  // and we avoid putting toast in the dep array (which changes every render
  // and would re-fire loadProject, overwriting unsaved local state).
  const toastRef = useRef(toast);
  useEffect(() => { toastRef.current = toast; });

  // Load project data on mount — only re-run when the project ID changes.
  // IMPORTANT: toast must NOT be in the dep array; it's not stable and would
  // cause loadProject to re-fire after every add/update, wiping local state.
  useEffect(() => {
    async function fetchProject() {
      const id = params.id as string;

      // ★ Quick-start guest mode path
      if (id === "quick-start") {
        try {
          const draftRaw = sessionStorage.getItem("nexora-quick-start-draft");
          if (draftRaw) {
            const draft = JSON.parse(draftRaw);
            loadProject({
              _id: "quick-start",
              name: draft.name || "My Digital Presence",
              slug: draft.slug || "my-site",
              category: draft.category || "portfolio",
              config: draft.config,
              published: false,
            });
            setCurrentSlug(draft.slug || "my-site");
            setIsGuestQuickStart(true);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn("[QuickStart Draft load error]:", e);
        }
      }

      // ★ Instant path: when the user just created a project from a template on
      // the gallery page, the freshly created project (with its full template
      // config) is cached in sessionStorage. Render it immediately and skip the
      // redundant network fetch — making "Use Template → editor" feel instant.
      try {
        const cachedRaw = sessionStorage.getItem(`nexora-pending-project:${id}`);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          sessionStorage.removeItem(`nexora-pending-project:${id}`);
          if (cached && cached.config) {
            loadProject(cached);
            setCurrentSlug(cached.slug || "");
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Corrupt / unreadable cache — fall through to the network fetch.
        sessionStorage.removeItem(`nexora-pending-project:${id}`);
      }

      try {
        const res = await projectsApi.getOne(id);
        if (res.data) {
          loadProject(res.data);
          setCurrentSlug(res.data.slug || "");
        }
      } catch (err) {
        console.error("Failed to load project", err);
        toastRef.current.error("Error", "Could not load project data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, loadProject]);

  useEffect(() => {
    if (viewMode === "code" && !developerMode) {
      setViewMode("visual");
    }
  }, [developerMode, setViewMode, viewMode]);

  useEffect(() => {
    if (!developerMode && activeTab === "code") {
      setActiveTab("sections");
    }
  }, [activeTab, developerMode]);

  // ★ Auto-sync guest draft changes to sessionStorage continuously
  useEffect(() => {
    if (isGuestQuickStart && config) {
      try {
        const existingRaw = sessionStorage.getItem("nexora-quick-start-draft");
        const existing = existingRaw ? JSON.parse(existingRaw) : {};
        sessionStorage.setItem(
          "nexora-quick-start-draft",
          JSON.stringify({
            ...existing,
            name: projectName || existing.name || "My Digital Presence",
            slug: currentSlug || existing.slug || "my-site",
            category: config.meta?.category || existing.category || "portfolio",
            config,
          })
        );
      } catch {
        /* ignore storage quota exceptions */
      }
    }
  }, [config, isGuestQuickStart, projectName, currentSlug]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;
      if (!isMeta) return;

      if (event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (event.key.toLowerCase() === "y" || (event.key.toLowerCase() === "z" && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [redo, undo]);

  // When a section or element is selected in the visual workspace, set selection
  // and open the Inspector tab so controls are accessible in both canvas and inspector panel.
  const handleSelectSection = (sectionId: string) => {
    selectSection(sectionId);
    setActiveTab("inspector");
  };

  const handleSelectElement = (elementKey: string, sectionId: string) => {
    selectElement(sectionId, elementKey);
    setActiveTab("inspector");
  };

  // Auto-sync activeSectionId: if current activeSectionId does not exist in config.sections, fallback to first section or null
  useEffect(() => {
    if (!config?.sections || config.sections.length === 0) {
      setActiveSectionId(null);
      setSelectedElementKey(null);
      return;
    }
    const exists = config.sections.some((s) => s.id === activeSectionId);
    if (!exists) {
      setActiveSectionId(config.sections[0].id);
      setSelectedElementKey(null);
    }
  }, [activeSectionId, config?.sections, setActiveSectionId, setSelectedElementKey]);

  const handlePublishWithSlug = async (slug: string) => {
    setShowSlugModal(false);
    try {
      // Always save the current state first so the published version matches
      // what the user sees in the editor right now.
      await save();

      if (projectId) {
        await projectsApi.updateSlug(projectId, slug);
        setCurrentSlug(slug);
        setProjectSlug(slug);
      }
      const url = await publish();
      toast.success("Site Published Globally!", `Your site is live at ${url || buildPublishedSiteUrl(slug)}`);
    } catch (err: any) {
      toast.error("Publish failed", err.message || "Please check your network and try again.");
    }
  };

  const [panelWidth, setPanelWidth] = useState(300);

  // ── Mobile bottom-sheet state ─────────────────────────────────────────────
  // sheetH: current height in vh (0 = collapsed/handle-only, 40 = peek, 90 = expanded)
  const SHEET_COLLAPSED = 0;
  const SHEET_PEEK = 40;
  const SHEET_EXPANDED = 82;
  const [sheetH, setSheetH] = useState(SHEET_PEEK);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const sheetDragRef = useRef<{ startY: number; startH: number } | null>(null);

  const snapSheet = (rawH: number) => {
    // Snap to nearest breakpoint
    if (rawH < 18) { setSheetH(SHEET_COLLAPSED); setIsSheetOpen(false); }
    else if (rawH < 62) { setSheetH(SHEET_PEEK); setIsSheetOpen(true); }
    else { setSheetH(SHEET_EXPANDED); setIsSheetOpen(true); }
  };

  const onSheetDragStart = (clientY: number) => {
    sheetDragRef.current = { startY: clientY, startH: sheetH };
  };

  const onSheetDragMove = (clientY: number) => {
    if (!sheetDragRef.current) return;
    const deltaVh = ((sheetDragRef.current.startY - clientY) / window.innerHeight) * 100;
    const newH = Math.min(90, Math.max(0, sheetDragRef.current.startH + deltaVh));
    setSheetH(newH);
    if (newH > 5) setIsSheetOpen(true);
  };

  const onSheetDragEnd = () => {
    if (!sheetDragRef.current) return;
    snapSheet(sheetH);
    sheetDragRef.current = null;
  };

  // Touch handlers for the drag pill
  const handleSheetTouchStart = (e: React.TouchEvent) => {
    onSheetDragStart(e.touches[0].clientY);
  };
  const handleSheetTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    onSheetDragMove(e.touches[0].clientY);
  };
  const handleSheetTouchEnd = () => onSheetDragEnd();

  // Mouse handlers for desktop (same handle, drag vertically on desktop too)
  const handleSheetMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSheetDragStart(e.clientY);
    const move = (ev: MouseEvent) => onSheetDragMove(ev.clientY);
    const up = () => { onSheetDragEnd(); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  const toggleSheet = () => {
    if (!isSheetOpen || sheetH <= SHEET_COLLAPSED) {
      setSheetH(SHEET_PEEK);
      setIsSheetOpen(true);
    } else {
      setSheetH(SHEET_COLLAPSED);
      setIsSheetOpen(false);
    }
  };

  // Drag handle width resizer logic (desktop only)
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + deltaX, 240), 520);
      setPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleRequestImageEdit = (sectionId: string, elementKey: string) => {
    const section = config?.sections.find((item) => item.id === sectionId);
    if (!section) return;

    const currentValue = resolveElementValue(section, elementKey);
    setImagePickerState({
      isOpen: true,
      currentUrl: typeof currentValue === "string" ? currentValue : "",
      onSelect: (url) => {
        updateElementValue(sectionId, elementKey, url);
        setImagePickerState({ isOpen: false, currentUrl: "" });
      },
    });
  };

  const activeSection = config?.sections.find((s) => s.id === activeSectionId);
  const showSidebar = viewMode !== "preview";
  const showCodeEditor = developerMode && (viewMode === "code" || activeTab === "code");

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-xs font-semibold tracking-wide uppercase font-mono">Loading Nexora Website Builder…</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-white overflow-hidden font-sans">
      {/* Quick Start Guest Banner */}
      {isGuestQuickStart && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-500/30 px-4 py-2 flex items-center justify-between text-xs text-white z-40">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-indigo-400" />
            <span>
              <strong>Quick Start Studio</strong> — Editing live draft for <strong className="text-indigo-300 font-mono">/{currentSlug}</strong>
            </span>
          </div>
          <button
            onClick={() => setShowQuickStartAuthModal(true)}
            className="px-3.5 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-md shadow-indigo-600/30 active:scale-95 flex items-center gap-1.5"
          >
            <span>Claim /{currentSlug} & Publish</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Top Navigation & Action Header */}
      <EditorHeader
        onPublishClick={() => {
          if (isGuestQuickStart || projectId === "quick-start") {
            setShowQuickStartAuthModal(true);
          } else {
            setShowSlugModal(true);
          }
        }}
        developerMode={developerMode}
        onToggleDeveloperMode={() => setDeveloperMode(!developerMode)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        {showSidebar && (
          <EditorSidebar
            activeTab={activeTab}
            onTabChange={(t) => setActiveTab(t)}
            developerMode={developerMode}
            activeSectionTitle={activeSection?.title}
          />
        )}

        {showSidebar && activeTab !== "code" && (
          <>
            {/* ── Desktop panel (unchanged width-resizable sidebar) ──────── */}
            <div
              style={{ width: `${panelWidth}px` }}
              className="flex-shrink-0 relative flex h-full bg-slate-900 border-r border-slate-800 transition-all duration-200 ease-out hidden md:flex"
            >
              <div className="w-full h-full flex-1 overflow-hidden flex flex-col">
                {activeTab === "sections" && (
                  <SectionListPanel
                    activeSectionId={activeSectionId}
                    onSelectSection={handleSelectSection}
                    onOpenAddPanel={() => setActiveTab("add")}
                  />
                )}
                {activeTab === "inspector" && (
                  <SectionInspectorPanel
                    onOpenImagePicker={(url, onSelect) =>
                      setImagePickerState({ isOpen: true, currentUrl: url, onSelect })
                    }
                  />
                )}
                {activeTab === "add" && (
                  <AddSectionPanel
                    onSectionAdded={(newId) => {
                      setActiveSectionId(newId);
                      setActiveTab("inspector");
                    }}
                  />
                )}
                {activeTab === "theme" && <ThemeInspectorPanel />}
                {activeTab === "seo" && <SeoInspectorPanel />}
                {activeTab === "ai" && <AiCopilotPanel />}
              </div>

              {/* Desktop horizontal resize handle */}
              <div
                onMouseDown={handleResizeStart}
                className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors z-30 -mr-1"
                title="Drag to resize panel width"
              />
            </div>

            {/* ── Mobile bottom-sheet panel ─────────────────────────────── */}
            <div
              className="md:hidden fixed inset-x-0 bottom-14 z-40 flex flex-col"
              style={{
                height: isSheetOpen ? `${sheetH}vh` : "3rem",
                minHeight: "3rem",
                transition: sheetDragRef.current ? "none" : "height 0.32s cubic-bezier(0.32, 0.72, 0, 1)",
                willChange: "height",
              }}
            >
              {/* Sheet surface */}
              <div className="flex flex-col h-full bg-slate-900 border-t border-slate-700/80 rounded-t-2xl shadow-2xl overflow-hidden">

                {/* ── Drag handle + tab label bar ─────────────────────────── */}
                <div
                  className="flex-shrink-0 flex flex-col items-center w-full cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={handleSheetMouseDown}
                  onTouchStart={handleSheetTouchStart}
                  onTouchMove={handleSheetTouchMove}
                  onTouchEnd={handleSheetTouchEnd}
                >
                  {/* Drag pill */}
                  <div className="w-10 h-1 rounded-full bg-slate-600 mt-2.5 mb-1 mx-auto" />

                  {/* Label + toggle row — tap this row to open/close */}
                  <button
                    type="button"
                    onClick={toggleSheet}
                    className="w-full flex items-center justify-between px-4 py-2 text-left"
                  >
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
                      {activeTab === "inspector" ? "Inspector"
                        : activeTab === "sections" ? "Sections"
                        : activeTab === "add" ? "Add Section"
                        : activeTab === "theme" ? "Theme"
                        : activeTab === "seo" ? "SEO"
                        : activeTab === "ai" ? "AI Copilot"
                        : "Panel"}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Height snap buttons — shown when open */}
                      {isSheetOpen && (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => { setSheetH(SHEET_PEEK); setIsSheetOpen(true); }}
                            className={`w-6 h-6 rounded-md border text-[9px] font-bold transition-colors ${sheetH <= SHEET_PEEK + 5 && sheetH > SHEET_COLLAPSED ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"}`}
                            title="Half height"
                          >½</button>
                          <button
                            type="button"
                            onClick={() => { setSheetH(SHEET_EXPANDED); setIsSheetOpen(true); }}
                            className={`w-6 h-6 rounded-md border text-[9px] font-bold transition-colors ${sheetH > SHEET_PEEK + 5 ? "bg-indigo-600 border-indigo-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"}`}
                            title="Full height"
                          >↑</button>
                        </div>
                      )}
                      {/* Chevron */}
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        className={`text-slate-400 transition-transform duration-300 ${isSheetOpen ? "rotate-180" : "rotate-0"}`}
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    </div>
                  </button>
                </div>

                {/* ── Scrollable panel content ───────────────────────────── */}
                {isSheetOpen && (
                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {activeTab === "sections" && (
                      <SectionListPanel
                        activeSectionId={activeSectionId}
                        onSelectSection={handleSelectSection}
                        onOpenAddPanel={() => setActiveTab("add")}
                      />
                    )}
                    {activeTab === "inspector" && (
                      <SectionInspectorPanel
                        onOpenImagePicker={(url, onSelect) =>
                          setImagePickerState({ isOpen: true, currentUrl: url, onSelect })
                        }
                      />
                    )}
                    {activeTab === "add" && (
                      <AddSectionPanel
                        onSectionAdded={(newId) => {
                          setActiveSectionId(newId);
                          setActiveTab("inspector");
                        }}
                      />
                    )}
                    {activeTab === "theme" && <ThemeInspectorPanel />}
                    {activeTab === "seo" && <SeoInspectorPanel />}
                    {activeTab === "ai" && <AiCopilotPanel />}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-slate-950 max-md:pb-14">
          {showCodeEditor ? (
            <CodeEditorPanel />
          ) : viewMode === "preview" ? (
            <div className="flex-1 h-full overflow-hidden bg-slate-950 relative">
              <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                <button
                  onClick={() => setViewMode("visual")}
                  className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur hover:bg-slate-800"
                >
                  Back to edit
                </button>
              </div>
              <div className="h-full overflow-y-auto flex flex-col">
                {config && <SiteRenderer config={config} />}
              </div>
            </div>
          ) : (
            <CanvasPreview
              selectedSectionId={activeSectionId}
              onSelectSection={handleSelectSection}
              selectedElementKey={selectedElementKey}
              onSelectElement={handleSelectElement}
              onRequestImageEdit={handleRequestImageEdit}
            />
          )}
        </div>
      </div>

      {/* Custom URL Slug & Publish Modal */}
      {showSlugModal && (
        <PublishModal
          initialSlug={currentSlug}
          onConfirm={handlePublishWithSlug}
          onClose={() => setShowSlugModal(false)}
        />
      )}

      {/* Quick Start Lock In & Auth Claim Modal */}
      {showQuickStartAuthModal && (
        <QuickStartAuthModal
          draftSlug={currentSlug || "my-site"}
          draftConfig={config}
          onSuccess={(newProjId) => {
            setShowQuickStartAuthModal(false);
            setIsGuestQuickStart(false);
            router.replace(`/editor/${newProjId}`);
          }}
          onClose={() => setShowQuickStartAuthModal(false)}
        />
      )}

      {/* Stock Image Manager Modal */}
      {imagePickerState.isOpen && (
        <ImagePickerModal
          currentUrl={imagePickerState.currentUrl}
          onSelect={(url) => {
            imagePickerState.onSelect?.(url);
            setImagePickerState({ isOpen: false, currentUrl: "" });
          }}
          onClose={() => setImagePickerState({ isOpen: false, currentUrl: "" })}
        />
      )}
    </div>
  );
}
