"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { projectsApi } from "@/lib/api";
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
import { ImagePickerModal } from "@/components/editor/ImagePickerModal";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { Loader2 } from "lucide-react";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const {
    projectId,
    projectName,
    config,
    loadProject,
    viewMode,
    setViewMode,
    publish,
    setProjectSlug,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<SidebarTab>("sections");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [developerMode, setDeveloperMode] = useState(false);
  const [showSlugModal, setShowSlugModal] = useState(false);
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
      try {
        const id = params.id as string;
        const res = await projectsApi.getOne(id);
        if (res.data) {
          loadProject(res.data);
          setCurrentSlug(res.data.slug || "");
          if (res.data.config?.sections?.length > 0) {
            setActiveSectionId(res.data.config.sections[0].id);
          }
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

  // Sync active section when sections change or section is selected
  const handleSelectSection = (sectionId: string) => {
    setActiveSectionId(sectionId);
    if (activeTab !== "inspector" && activeTab !== "sections") {
      setActiveTab("inspector");
    }
  };

  // Auto-sync activeSectionId: if current activeSectionId does not exist in config.sections, fallback to first section or null
  useEffect(() => {
    if (!config?.sections || config.sections.length === 0) {
      setActiveSectionId(null);
      return;
    }
    const exists = config.sections.some((s) => s.id === activeSectionId);
    if (!exists) {
      setActiveSectionId(config.sections[0].id);
    }
  }, [config?.sections, activeSectionId]);

  const handlePublishWithSlug = async (slug: string) => {
    setShowSlugModal(false);
    try {
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

  const [panelWidth, setPanelWidth] = useState(320);

  // Drag handle width resizer logic
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

  const activeSection = config?.sections.find((s) => s.id === activeSectionId);

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
      {/* Top Navigation & Action Header */}
      <EditorHeader
        onPublishClick={() => setShowSlugModal(true)}
        developerMode={developerMode}
        onToggleDeveloperMode={() => setDeveloperMode(!developerMode)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left Sidebar Navigation */}
        <EditorSidebar
          activeTab={activeTab}
          onTabChange={(t) => setActiveTab(t)}
          developerMode={developerMode}
          activeSectionTitle={activeSection?.title}
        />

        {/* Active Sidebar Drawer / Resizable Inspector Panel */}
        {activeTab !== "code" && (
          <div
            style={{ width: `${panelWidth}px` }}
            className="flex-shrink-0 relative flex h-full bg-slate-900 border-r border-slate-800"
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
                  sectionId={activeSectionId}
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

            {/* Width Drag Handle */}
            <div
              onMouseDown={handleResizeStart}
              className="absolute top-0 right-0 bottom-0 w-2 cursor-col-resize hover:bg-indigo-500/50 active:bg-indigo-500 transition-colors z-30 -mr-1"
              title="Drag to resize panel width"
            />
          </div>
        )}

        {/* Center Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden bg-slate-950">
          {/* Code Mode or Dev Mode Code Tab */}
          {viewMode === "code" || (developerMode && activeTab === "code") ? (
            <CodeEditorPanel />
          ) : viewMode === "preview" ? (
            <div className="flex-1 h-full overflow-y-auto bg-slate-950">
              {config && <SiteRenderer config={config} />}
            </div>
          ) : (
            /* Visual Canvas View with Click-to-Select Sync */
            <CanvasPreview
              selectedSectionId={activeSectionId}
              onSelectSection={handleSelectSection}
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
