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

  const handleOpenPreview = (template: any) => {
    try {
      sessionStorage.setItem(
        `nexora-tpl-preview:${template.slug}`,
        JSON.stringify({ config: template.config })
      );
    } catch {
      /* ignore */
    }

    const isMobileScreen = typeof window !== "undefined" && window.innerWidth < 768;
    if (isMobileScreen) {
      window.open(`/templates/preview/${template.slug}`, "_blank", "noopener,noreferrer");
    } else {
      setPreviewTemplate(template);
    }
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
        {/* ── Gallery Header (understated — templates are the focus) ──────── */}
        <div className="flex flex-col gap-3 pb-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
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
                  onClick={() => handleOpenPreview(template)}
                >
                  {/* ── Live Preview Area (the hero) ─────────────────────── */}
                  <div className="relative shrink-0 rounded-[13px] overflow-hidden">
{/* Live desktop render fills the wide 16:9 preview; subtle scale on hover */}
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
                          handleCreateFromTemplate(template.config);
                        }}
                        disabled={isCreating}
                        className="flex-1 h-[42px] rounded-[10px] text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors duration-250 disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <Sparkles size={14} /> Use Template
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPreview(template);
                        }}
                        className="px-4 h-[42px] rounded-[10px] text-[13px] font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-colors duration-250 flex items-center justify-center gap-1.5"
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

      {/* ── Template Preview Modal ──────────────────────────────────────────── */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{previewTemplate.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{previewTemplate.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCreateFromTemplate(previewTemplate.config)}
                  disabled={isCreating}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Sparkles size={13} /> Use This Template
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Live Render Area */}
            <div className="flex-1 overflow-auto bg-white">
              <SiteRenderer config={previewTemplate.config} />
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
