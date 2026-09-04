"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteConfigJSON } from "@ai-platform/shared";
import { presetTemplates } from "@ai-platform/templates";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { projectsApi, templatesApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { QuickBusinessSetupModal } from "@/components/common/QuickBusinessSetupModal";
import { BusinessProfile, injectBusinessProfileIntoConfig } from "@/lib/businessProfile";
import {
  ArrowLeft,
  Sparkles,
  EyeOff,
  ExternalLink,
  Loader2,
  Check,
} from "lucide-react";

interface TemplatePreviewClientProps {
  id: string;
  initialData?: {
    config?: SiteConfigJSON;
    defaultConfig?: SiteConfigJSON;
    name?: string;
    category?: string;
    description?: string;
  } | null;
}

export function TemplatePreviewClient({ id, initialData }: TemplatePreviewClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [templateData, setTemplateData] = useState<{
    config: SiteConfigJSON | null;
    name: string;
    category: string;
    description: string;
  }>(() => {
    const cfg = initialData?.defaultConfig || initialData?.config || null;
    return {
      config: cfg,
      name: initialData?.name || cfg?.meta?.title || "Template Preview",
      category: initialData?.category || cfg?.meta?.category || "portfolio",
      description: initialData?.description || cfg?.meta?.description || "",
    };
  });
  const [loading, setLoading] = useState(!templateData.config);

  useEffect(() => {
    if (templateData.config) return;

    // 1. Try reading from sessionStorage
    try {
      const cached =
        sessionStorage.getItem(`OkInSite-tpl-preview:${id}`) ||
        sessionStorage.getItem(`Oninsite-tpl-preview:${id}`) ||
        sessionStorage.getItem(`nexora-tpl-preview:${id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.config) {
          setTemplateData({
            config: parsed.config,
            name: parsed.name || parsed.config?.meta?.title || id,
            category: parsed.category || parsed.config?.meta?.category || "portfolio",
            description: parsed.description || parsed.config?.meta?.description || "",
          });
          setLoading(false);
          return;
        }
      }
    } catch {
      /* ignore */
    }

    // 2. Check presetTemplates registry directly
    const preset = (presetTemplates as Record<string, any>)[id];
    if (preset) {
      setTemplateData({
        config: preset,
        name: preset.meta?.title || id,
        category: preset.meta?.category || "portfolio",
        description: preset.meta?.description || "",
      });
      setLoading(false);
      return;
    }

    // 3. Fallback: fetch from API
    templatesApi
      .get(id)
      .then((res) => {
        const d = res.data;
        const cfg = d?.defaultConfig || d?.config;
        if (cfg) {
          setTemplateData({
            config: cfg,
            name: d?.name || cfg.meta?.title || id,
            category: d?.category || cfg.meta?.category || "portfolio",
            description: d?.description || cfg.meta?.description || "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, templateData.config]);

  const handleUseTemplate = async (profile?: BusinessProfile | null) => {
    if (!templateData.config) return;
    setIsCreating(true);

    let cfg = templateData.config;
    if (profile) {
      cfg = injectBusinessProfileIntoConfig(cfg, profile);
    }
    const projName = profile?.brandName?.trim() || templateData.name || cfg.meta?.title || "My Digital Presence";

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

      if (!token) {
        // Guest mode — jump straight into quick-start
        const draftPayload = JSON.stringify({
          name: projName,
          slug: projName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"),
          category: profile?.category || templateData.category || "portfolio",
          config: cfg,
        });
        sessionStorage.setItem("Oninsite-quick-start-draft", draftPayload);
        sessionStorage.setItem("nexora-quick-start-draft", draftPayload);
        router.push("/editor/quick-start");
        return;
      }

      const res = await projectsApi.create({
        name: projName,
        category: (profile?.category || templateData.category || "portfolio") as any,
        config: cfg,
      });

      if (res.data?._id) {
        toast.success("Project created from template!");
        try {
          const serialized = JSON.stringify(res.data);
          sessionStorage.setItem(`Oninsite-pending-project:${res.data._id}`, serialized);
          sessionStorage.setItem(`nexora-pending-project:${res.data._id}`, serialized);
        } catch {
          /* ignore */
        }
        router.push(`/editor/${res.data._id}`);
      }
    } catch {
      // Fallback guest edit
      const draftPayload = JSON.stringify({
        name: projName,
        slug: projName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"),
        category: profile?.category || templateData.category || "portfolio",
        config: cfg,
      });
      sessionStorage.setItem("Oninsite-quick-start-draft", draftPayload);
      sessionStorage.setItem("nexora-quick-start-draft", draftPayload);
      router.push("/editor/quick-start");
    } finally {
      setIsCreating(false);
    }
  };

  const [isBarMinimized, setIsBarMinimized] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-4">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
        <p className="text-sm text-slate-400 font-medium">Loading live template preview…</p>
      </div>
    );
  }

  if (!templateData.config) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white gap-6 p-6 text-center">
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-bold">Template Not Found</h2>
          <p className="text-sm text-slate-400">
            We couldn't load the preview for this template. Please return to the template gallery.
          </p>
        </div>
        <button
          onClick={() => router.push("/templates")}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-all"
        >
          Back to Template Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full font-sans antialiased overflow-x-hidden">
      {/* ── RAW FULL-SCREEN SITE RENDER (No player frames, bezels or mockups) ── */}
      <main className="w-full min-h-screen">
        <SiteRenderer config={templateData.config} />
      </main>

      {/* ── FLOATING MIDDLE ACTION BAR & TOGGLE ── */}
      <aside className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none">
        {isBarMinimized ? (
          /* Minimized pill: sleek unobtrusive bubble */
          <button
            type="button"
            onClick={() => setIsBarMinimized(false)}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 text-white border border-slate-700/80 shadow-2xl backdrop-blur-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 text-xs font-bold"
            title="Expand template controls"
          >
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            <span>Use Template</span>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full">Show</span>
          </button>
        ) : (
          /* Expanded sleek floating control bar */
          <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-950/85 text-white border border-slate-800/90 shadow-[0_10px_38px_-10px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur-2xl animate-fade-in max-w-[92vw] sm:max-w-none">
            {/* Back to Gallery */}
            <button
              type="button"
              onClick={() => router.push("/templates")}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
              title="Return to Template Gallery"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">Gallery</span>
            </button>

            <div className="h-4 w-px bg-slate-800 shrink-0" />

            {/* Template Info */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold text-white truncate max-w-[120px] sm:max-w-[200px]">
                {templateData.name}
              </span>
              <span className="hidden md:inline-block text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                {templateData.category.replace(/_/g, " ")}
              </span>
            </div>

            {/* ── MIDDLE PRIMARY BUTTON: USE THIS TEMPLATE ── */}
            <button
              type="button"
              onClick={() => setShowSetupModal(true)}
              disabled={isCreating}
              className="px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-95 transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.4)] disabled:opacity-50 shrink-0"
            >
              {isCreating ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Sparkles size={15} className="text-amber-300" />
              )}
              <span>Use This Template</span>
            </button>

            <div className="h-4 w-px bg-slate-800 shrink-0" />

            {/* Toggle / Minimize Option */}
            <button
              type="button"
              onClick={() => setIsBarMinimized(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors shrink-0"
              title="Hide controls for pure full-screen view"
            >
              <span className="sr-only">Hide controls</span>
              <EyeOff size={15} />
            </button>
          </div>
        )}
      </aside>

      {/* ── Quick Business Setup Wizard Modal ── */}
      <QuickBusinessSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        templateName={templateData.name || "Template"}
        onSubmit={(profile) => {
          setShowSetupModal(false);
          handleUseTemplate(profile);
        }}
        onSkip={() => {
          setShowSetupModal(false);
          handleUseTemplate(null);
        }}
        isSubmitting={isCreating}
      />
    </div>
  );
}
