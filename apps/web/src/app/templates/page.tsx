"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { projectsApi, authApi, templatesApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { SiteConfigJSON } from "@ai-platform/shared";
import { validateTemplateJSON } from "@ai-platform/templates";
import { Navbar } from "@/components/navigation/Navbar";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { TemplateThumbnail } from "@/components/renderer/TemplateThumbnail";
import { DeviceFrame, DeviceFrameViewport } from "@/components/editor/DeviceFrame";
import {
  Globe,
  Sparkles,
  Palette,
  FileText,
  CreditCard,
  UtensilsCrossed,
  Briefcase,
  Rocket,
  Lightbulb,
  User,
  CalendarDays,
  Link2,
  File,
  Eye,
  Check,
  AlertTriangle,
  X,
  Loader2,
  Shield,
  Search,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
} from "lucide-react";



// ── Category icon map ──────────────────────────────────────────────────────────
const CATEGORY_ICON_COMPONENTS: Record<string, React.ElementType> = {
  portfolio: Palette,
  resume: FileText,
  digital_card: CreditCard,
  restaurant_menu: UtensilsCrossed,
  business: Briefcase,
  product_landing: Rocket,
  startup_landing: Lightbulb,
  personal: User,
  event: CalendarDays,
  link_in_bio: Link2,
  blank: File,
};

export default function TemplateGalleryPage() {
  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<{ email: string; role?: string; name?: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

  // Quick-Fill Onboarding Modal state
  const [quickFillModal, setQuickFillModal] = useState<{
    open: boolean;
    templateConfig: SiteConfigJSON | null;
  }>({ open: false, templateConfig: null });
  const [quickFillName, setQuickFillName] = useState("");
  const [quickFillPhone, setQuickFillPhone] = useState("");
  const [quickFillService, setQuickFillService] = useState("");

  /** Inject the 3 quick-fill values into ALL matching fields across the template config */
  const injectQuickFillIntoConfig = (config: SiteConfigJSON, name: string, phone: string, service: string): SiteConfigJSON => {
    if (!name && !phone && !service) return config;
    const patched = JSON.parse(JSON.stringify(config)) as SiteConfigJSON;
    if (name) patched.meta.title = name;
    patched.sections = patched.sections.map((sec: any) => {
      const c = { ...(sec.content || {}) } as any;
      // Business name injection
      if (name) {
        if (typeof c.businessName === "string") c.businessName = name;
        if (typeof c.companyName === "string") c.companyName = name;
        if (sec.type === "hero" || sec.type === "header") {
          if (typeof c.title === "string" && c.title.length < 60) c.title = name;
          if (typeof c.heading === "string" && c.heading.length < 60) c.heading = name;
        }
        if (typeof c.logoText === "string") c.logoText = name;
        if (typeof c.brand === "string") c.brand = name;
      }
      // Phone/WhatsApp injection
      if (phone) {
        if (typeof c.phone === "string") c.phone = phone;
        if (typeof c.whatsapp === "string") c.whatsapp = phone;
        if (typeof c.publicWhatsapp === "string") c.publicWhatsapp = phone;
        if (c.formConfig) c.formConfig = { ...c.formConfig, whatsappNumber: phone };
      }
      // Service/tagline injection
      if (service) {
        if (sec.type === "hero" && typeof c.subtitle === "string") c.subtitle = service;
        if (sec.type === "hero" && typeof c.tagline === "string") c.tagline = service;
        if (sec.type === "hero" && typeof c.description === "string" && c.description.length < 120) c.description = service;
      }
      return { ...sec, content: c };
    });
    return patched;
  };

  const handleQuickFillSubmit = () => {
    if (!quickFillModal.templateConfig) return;
    const patched = injectQuickFillIntoConfig(
      quickFillModal.templateConfig,
      quickFillName.trim(),
      quickFillPhone.trim(),
      quickFillService.trim()
    );
    setQuickFillModal({ open: false, templateConfig: null });
    handleCreateFromTemplate(patched, quickFillName.trim() || undefined);
  };

  // Templates drawn strictly from backend DB as single source of truth
  const [templates, setTemplates] = useState<Array<{
    id: string;
    name: string;
    category: string;
    slug: string;
    description: string;
    tags: string[];
    popularity: number;
    isNew: boolean;
    config: SiteConfigJSON;
  }>>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Modals
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [previewViewport, setPreviewViewport] = useState<DeviceFrameViewport>("desktop");
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);

  // Admin JSON Validator
  const [newTemplateJSON, setNewTemplateJSON] = useState<string>("");
  const [jsonValidationResult, setJsonValidationResult] = useState<{ valid?: boolean; errors?: string[] } | null>(null);

  useEffect(() => {
    authApi.me().then((res) => {
      if (res.data) setUser(res.data.user || res.data);
    }).catch(() => {});
  }, []);

  // ── Fetch templates from the backend DB (single source of truth) ────────
  useEffect(() => {
    let cancelled = false;

    const mapBackendTemplate = (t: any): {
      id: string;
      name: string;
      category: string;
      slug: string;
      description: string;
      tags: string[];
      popularity: number;
      isNew: boolean;
      config: SiteConfigJSON;
    } => ({
      id: t._id || t.slug || t.name,
      slug: t.slug || (t.defaultConfig?.meta?.slug as string) || "",
      name: t.name || t.defaultConfig?.meta?.title || "Untitled Template",
      category: t.category || t.defaultConfig?.meta?.category || "portfolio",
      description: t.description || t.defaultConfig?.meta?.description || "",
      tags: t.tags || t.defaultConfig?.meta?.tags || [],
      popularity: t.defaultConfig?.meta?.popularity || 90,
      isNew: t.defaultConfig?.meta?.isNew || false,
      config: t.defaultConfig as SiteConfigJSON,
    });

    const loadFromBackend = async () => {
      try {
        const res = await templatesApi.list();
        const data = res.data || [];
        if (cancelled) return;

        if (Array.isArray(data) && data.length > 0) {
          const mapped = data
            .filter((t: any) => t && t.defaultConfig)
            .map(mapBackendTemplate);
          setTemplates(mapped);
        } else {
          setTemplates([]);
        }
      } catch (err: any) {
        if (!cancelled) setTemplates([]);
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    };

    loadFromBackend();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTemplates = templates;

  // Compute category buttons dynamically from database templates
  const templateCategories = useMemo(() => {
    const cats = new Set<string>();
    templates.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    const dynamicList = Array.from(cats).map((catId) => ({
      id: catId,
      label: catId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
    return [{ id: "all", label: "All Templates" }, ...dynamicList];
  }, [templates]);

  const filteredTemplates = allTemplates.filter((t) => {
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreateFromTemplate = async (templateConfig: SiteConfigJSON, name?: string) => {
    setIsCreating(true);
    try {
      const projName = name || templateConfig.meta.title || "My Digital Presence";
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

      if (!token) {
        // Guest mode — jump straight into visual studio quick-start without forcing login
        sessionStorage.setItem("nexora-quick-start-draft", JSON.stringify({
          name: projName,
          slug: projName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"),
          category: templateConfig.meta.category || "portfolio",
          config: templateConfig,
        }));
        router.push("/editor/quick-start");
        return;
      }

      const res = await projectsApi.create({
        name: projName,
        category: templateConfig.meta.category || "portfolio",
        config: templateConfig,
      });
      if (res.data?._id) {
        toast.success("Project created from template!");
        // ★ Pre-cache the freshly created project (which carries the full
        // template config) so the editor can render it instantly without a
        // second network fetch right after navigating.
        try {
          sessionStorage.setItem(
            `nexora-pending-project:${res.data._id}`,
            JSON.stringify(res.data)
          );
        } catch {
          /* ignore quota / privacy-mode failures — editor falls back to fetch */
        }
        router.push(`/editor/${res.data._id}`);
      }
    } catch (err: any) {
      // Fallback for network error — allow guest editing anyway
      const projName = name || templateConfig.meta.title || "My Digital Presence";
      sessionStorage.setItem("nexora-quick-start-draft", JSON.stringify({
        name: projName,
        slug: projName.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-"),
        category: templateConfig.meta.category || "portfolio",
        config: templateConfig,
      }));
      router.push("/editor/quick-start");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenModal = (template: any) => {
    setPreviewViewport("desktop");
    setPreviewTemplate(template);
  };

  const handleOpenInNewTab = (template: any) => {
    const targetKey = template.slug || template.id;
    try {
      sessionStorage.setItem(
        `nexora-tpl-preview:${targetKey}`,
        JSON.stringify({
          config: template.config,
          name: template.name,
          category: template.category,
          description: template.description,
          slug: template.slug,
          id: template.id,
        })
      );
    } catch {
      /* ignore */
    }

    window.open(`/templates/preview/${encodeURIComponent(targetKey)}`, "_blank", "noopener,noreferrer");
  };

  const handleValidateJSON = () => {
    try {
      const parsed = JSON.parse(newTemplateJSON);
      setJsonValidationResult(validateTemplateJSON(parsed));
    } catch (e: any) {
      setJsonValidationResult({ valid: false, errors: [`JSON Error: ${e.message}`] });
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar
        user={user}
        onOpenAdminModal={() => setShowAdminModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Gallery Header ──────── */}
        <div className="flex flex-col gap-2 sm:gap-3 pb-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Templates
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            Choose from {allTemplates.length} handcrafted, responsive templates — portfolios, restaurants, digital cards, products, and link-in-bio sites.
          </p>
        </div>

        {/* ── Category Filter Pills & Search ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {templateCategories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 shadow-xs"
            />
          </div>
        </div>

        {/* ── Template Cards Grid ─────────────────────────────────────────── */}
        {templatesLoading ? (
          <div className="py-20 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-indigo-500" /> Loading templates…
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="py-20 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm">
            No templates match your filter. Try another category or keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTemplates.map((template) => {
              const IconComp = CATEGORY_ICON_COMPONENTS[template.category] || Globe;
              const primaryColor = template.config.theme.primaryColor || "#4F46E5";

              return (
                <div
                  key={template.id}
                  className="group bg-white rounded-[18px] border border-slate-200/80 overflow-hidden flex flex-col shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_-16px_rgba(16,24,40,0.12)] transition-all duration-300 ease-out cursor-pointer will-change-transform hover:-translate-y-1.5 hover:shadow-[0_28px_52px_-18px_rgba(16,24,40,0.22)] p-3"
                  onClick={() => handleOpenModal(template)}
                >
                  {/* ── Live Preview Area (the hero) ─────────────────────── */}
                  <div className="relative shrink-0 rounded-[13px] overflow-hidden">
                    <div className="origin-top transform-gpu transition-transform duration-500 ease-out group-hover:scale-[1.02]">
                      <TemplateThumbnail config={template.config} name={template.name} category={template.category} />
                    </div>
                  </div>

                  {/* ── Template Info ─────────────────────────────────────── */}
                  <div className="px-1 pt-4 pb-1 flex-1 flex flex-col gap-3">
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400 flex items-center gap-1.5">
                        <IconComp size={11} style={{ color: primaryColor }} />
                        {template.category.replace("_", " ")}
                      </p>
                      <h3 className="text-[15px] font-semibold text-slate-900 leading-snug line-clamp-1">
                        {template.name}
                      </h3>
                      <p className="text-[12px] text-slate-500 leading-relaxed line-clamp-2">
                        {template.description}
                      </p>
                    </div>

                    {/* ── Actions ────────────────────────────────────────── */}
                    <div className="flex items-center gap-2 pt-1 mt-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickFillName("");
                          setQuickFillPhone("");
                          setQuickFillService("");
                          setQuickFillModal({ open: true, templateConfig: template.config });
                        }}
                        disabled={isCreating}
                        className="flex-1 h-[42px] rounded-[10px] text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors duration-250 disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={14} /> Use Template
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInNewTab(template);
                        }}
                        className="px-4 h-[42px] rounded-[10px] text-[13px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors duration-250 flex items-center justify-center gap-1.5"
                        title="Open live preview in new browser tab"
                      >
                        <Eye size={14} className="text-slate-400" /> Preview
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Template Preview Modal (In-Page Popup) ───────────────────────────── */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2 truncate">
                    {previewTemplate.name}
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                      {previewTemplate.category?.replace("_", " ")}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 truncate max-w-md hidden sm:block">{previewTemplate.description}</p>
                </div>
              </div>

              {/* Viewport Switcher */}
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
                <button
                  onClick={() => setPreviewViewport("desktop")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    previewViewport === "desktop"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Desktop View"
                >
                  <Monitor size={13} />
                  <span className="hidden md:inline">Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewViewport("tablet")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    previewViewport === "tablet"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Tablet View"
                >
                  <Tablet size={13} />
                  <span className="hidden md:inline">Tablet</span>
                </button>
                <button
                  onClick={() => setPreviewViewport("mobile")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                    previewViewport === "mobile"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Android Mobile View"
                >
                  <Smartphone size={13} />
                  <span className="hidden md:inline">Mobile</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleOpenInNewTab(previewTemplate)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all flex items-center gap-1.5 shadow-xs"
                  title="Open live preview in new browser tab"
                >
                  <ExternalLink size={13} className="text-slate-400" />
                  <span className="hidden sm:inline">New Tab</span>
                </button>
                <button
                  onClick={() => {
                    setQuickFillName("");
                    setQuickFillPhone("");
                    setQuickFillService("");
                    setPreviewTemplate(null);
                    setQuickFillModal({ open: true, templateConfig: previewTemplate.config });
                  }}
                  disabled={isCreating}
                  className="px-4 sm:px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  <span className="hidden sm:inline">Use Template</span>
                  <span className="sm:hidden">Use</span>
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Live Render Area */}
            <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden bg-slate-950 p-2 sm:p-6 flex flex-col items-center custom-scrollbar">
              {previewViewport === "desktop" ? (
                <div className="w-full max-w-6xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
                  <SiteRenderer config={previewTemplate.config} />
                </div>
              ) : (
                <div className="my-auto py-2">
                  <DeviceFrame viewport={previewViewport}>
                    <SiteRenderer config={previewTemplate.config} />
                  </DeviceFrame>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick-Fill Onboarding Modal ─────────────────────────────────────── */}
      {quickFillModal.open && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setQuickFillModal({ open: false, templateConfig: null })}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-8 space-y-7 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Quick-fill your site</h3>
                <button onClick={() => setQuickFillModal({ open: false, templateConfig: null })} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-500">Answer 3 quick questions and we'll pre-fill your entire site — ready to publish in minutes.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">1. Your business or site name</label>
                <input
                  type="text"
                  value={quickFillName}
                  onChange={(e) => setQuickFillName(e.target.value)}
                  placeholder="e.g. Sunrise Bakery, Dr. Patel Clinic, Alex Portfolio"
                  autoFocus
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">2. WhatsApp / phone number</label>
                <input
                  type="tel"
                  value={quickFillPhone}
                  onChange={(e) => setQuickFillPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
                />
                <p className="text-[11px] text-slate-400">Leads from your contact form will be sent here via WhatsApp.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">3. Your main service or tagline</label>
                <input
                  type="text"
                  value={quickFillService}
                  onChange={(e) => setQuickFillService(e.target.value)}
                  placeholder="e.g. Fresh artisan bread & pastries since 2010"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={handleQuickFillSubmit}
                disabled={isCreating || !quickFillName.trim()}
                className="w-full h-12 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Build My Site
              </button>
              <button
                onClick={() => {
                  setQuickFillModal({ open: false, templateConfig: null });
                  if (quickFillModal.templateConfig) handleCreateFromTemplate(quickFillModal.templateConfig);
                }}
                className="w-full h-10 rounded-2xl text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Skip — I'll fill in manually
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Admin Template Manager Modal ────────────────────────────────────── */}
      {showAdminModal && isAdmin && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAdminModal(false)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <Shield className="text-amber-600" size={20} />
                <h3 className="font-bold text-slate-900">Admin Template Manager</h3>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">Paste template JSON schema to validate:</label>
              <textarea
                rows={10}
                value={newTemplateJSON}
                onChange={(e) => setNewTemplateJSON(e.target.value)}
                placeholder='{ "meta": { ... }, "theme": { ... }, "sections": [ ... ] }'
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-400"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={handleValidateJSON}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Validate JSON Schema
                </button>
                {jsonValidationResult && (
                  <div className="flex items-center gap-2 text-xs">
                    {jsonValidationResult.valid ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check size={14} /> Valid Schema!
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertTriangle size={14} /> Schema Errors
                      </span>
                    )}
                  </div>
                )}
              </div>
              {jsonValidationResult?.errors && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-mono space-y-1">
                  {jsonValidationResult.errors.map((err, idx) => (
                    <div key={idx}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
