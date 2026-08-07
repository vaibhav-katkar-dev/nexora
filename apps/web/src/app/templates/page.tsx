"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { projectsApi, authApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { SiteConfigJSON } from "@ai-platform/shared";
import { getAllTemplates, validateTemplateJSON } from "@ai-platform/templates";
import { Navbar } from "@/components/navigation/Navbar";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
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
  Star,
  Check,
  AlertTriangle,
  X,
  Loader2,
  Shield,
  Search,
  LayoutGrid,
  Wand2,
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

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "portfolio", label: "Portfolio" },
  { id: "resume", label: "Resume" },
  { id: "digital_card", label: "Digital Card" },
  { id: "restaurant_menu", label: "Restaurant" },
  { id: "business", label: "Business" },
  { id: "product_landing", label: "Product Landing" },
  { id: "startup_landing", label: "Startup Landing" },
  { id: "personal", label: "Personal" },
  { id: "event", label: "Event" },
  { id: "link_in_bio", label: "Link in Bio" },
];

export default function TemplateGalleryPage() {
  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<{ email: string; role?: string; name?: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);

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

  const allTemplates = getAllTemplates();

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
      const res = await projectsApi.create({
        name: projName,
        category: templateConfig.meta.category || "portfolio",
        config: templateConfig,
      });
      if (res.data?._id) {
        toast.success("Project created from template!");
        router.push(`/editor/${res.data._id}`);
      }
    } catch (err: any) {
      toast.error("Failed to create project", err.message || "Please try again.");
    } finally {
      setIsCreating(false);
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
        {/* ── Gallery Header Banner ────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-md">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent" />
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <LayoutGrid size={13} /> Handcrafted Designs
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Template Gallery
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
              Choose from {allTemplates.length} JSON-driven, responsive templates for portfolios, restaurants, digital cards, products, and link-in-bio sites.
            </p>
          </div>
        </div>

        {/* ── Category Filter Pills & Search ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {TEMPLATE_CATEGORIES.map((cat) => {
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
        {filteredTemplates.length === 0 ? (
          <div className="py-20 bg-white border border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm">
            No templates match your filter. Try another category or keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const IconComp = CATEGORY_ICON_COMPONENTS[template.category] || Globe;
              const primaryColor = template.config.theme.primaryColor || "#4F46E5";

              return (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all duration-200 group cursor-pointer"
                  onClick={() => setPreviewTemplate(template)}
                >
                  {/* Visual Skeleton Sketch */}
                  <div
                    className="h-44 w-full relative p-5 flex flex-col justify-between overflow-hidden border-b border-slate-100"
                    style={{ background: `linear-gradient(135deg, ${primaryColor}15, #F8FAFC 80%)` }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-xs">
                        <IconComp size={11} style={{ color: primaryColor }} />
                        {template.category.replace("_", " ")}
                      </span>
                      {template.isNew && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 border border-amber-200">
                          NEW
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="h-4 w-3/4 rounded-md bg-slate-900/10" />
                      <div className="h-2.5 w-1/2 rounded-md bg-slate-900/6" />
                      <div className="flex gap-2 pt-1">
                        <div className="h-7 w-20 rounded-lg" style={{ background: primaryColor, opacity: 0.85 }} />
                        <div className="h-7 w-14 rounded-lg bg-slate-200" />
                      </div>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {template.name}
                        </h3>
                        <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          {(template.popularity / 20).toFixed(1)}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template);
                        }}
                        className="py-2 px-3 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1"
                      >
                        <Eye size={13} /> Preview
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateFromTemplate(template.config);
                        }}
                        disabled={isCreating}
                        className="flex-1 py-2 px-4 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Sparkles size={13} /> Use Template
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
