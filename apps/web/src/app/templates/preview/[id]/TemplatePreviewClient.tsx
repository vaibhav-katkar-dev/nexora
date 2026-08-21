"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SiteConfigJSON } from "@ai-platform/shared";
import { presetTemplates } from "@ai-platform/templates";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { DeviceFrame, DeviceFrameViewport } from "@/components/editor/DeviceFrame";
import { projectsApi, templatesApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { QuickBusinessSetupModal } from "@/components/common/QuickBusinessSetupModal";
import { BusinessProfile, injectBusinessProfileIntoConfig } from "@/lib/businessProfile";
import {
  ArrowLeft,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
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

  const [viewport, setViewport] = useState<DeviceFrameViewport>("desktop");
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
      const cached = sessionStorage.getItem(`nexora-tpl-preview:${id}`);
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
        sessionStorage.setItem(
          "nexora-quick-start-draft",
          JSON.stringify({
            name: projName,
            slug: projName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"),
            category: profile?.category || templateData.category || "portfolio",
            config: cfg,
          })
        );
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
          sessionStorage.setItem(
            `nexora-pending-project:${res.data._id}`,
            JSON.stringify(res.data)
          );
        } catch {
          /* ignore */
        }
        router.push(`/editor/${res.data._id}`);
      }
    } catch {
      // Fallback guest edit
      sessionStorage.setItem(
        "nexora-quick-start-draft",
        JSON.stringify({
          name: projName,
          slug: projName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"),
          category: profile?.category || templateData.category || "portfolio",
          config: cfg,
        })
      );
      router.push("/editor/quick-start");
    } finally {
      setIsCreating(false);
    }
  };

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
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xl">
        {/* Left: Back button & Info */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <button
            onClick={() => router.push("/templates")}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
            title="Back to templates"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Gallery</span>
          </button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate flex items-center gap-2">
              {templateData.name}
              <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                {templateData.category.replace("_", " ")}
              </span>
            </h1>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewport("desktop")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewport === "desktop"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Desktop View"
          >
            <Monitor size={14} />
            <span className="hidden md:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewport("tablet")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewport === "tablet"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Tablet View"
          >
            <Tablet size={14} />
            <span className="hidden md:inline">Tablet</span>
          </button>
          <button
            onClick={() => setViewport("mobile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              viewport === "mobile"
                ? "bg-slate-800 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Android Mobile View"
          >
            <Smartphone size={14} />
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSetupModal(true)}
            disabled={isCreating}
            className="px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {isCreating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            <span>Use Template</span>
          </button>
        </div>
      </header>

      {/* ── Main Preview Area ──────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden p-2 sm:p-6 bg-slate-950 flex flex-col items-center custom-scrollbar">
        {viewport === "desktop" ? (
          <div className="w-full max-w-7xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 bg-black">
            <SiteRenderer config={templateData.config} />
          </div>
        ) : (
          <div className="my-auto py-4">
            <DeviceFrame viewport={viewport}>
              <SiteRenderer config={templateData.config} />
            </DeviceFrame>
          </div>
        )}
      </main>

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
