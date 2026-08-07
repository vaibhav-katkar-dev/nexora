"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { templatesApi, authApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { TemplateThumbnail } from "@/components/renderer/TemplateThumbnail";
import { validateTemplateJSON } from "@ai-platform/templates";
import { Navbar } from "@/components/navigation/Navbar";
import {
  Shield,
  Plus,
  Search,
  Loader2,
  Trash2,
  RotateCcw,
  Pencil,
  Eye,
  X,
  Check,
  AlertTriangle,
  Upload,
  LayoutTemplate,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileJson,
  Sparkles,
  Lock,
  Star,
  Globe,
  Archive,
  Clock,
} from "lucide-react";

// ─── Monaco editor (reused from the app) ───────────────────────────────────
const MonacoEditor = dynamic(
  () =>
    import("@monaco-editor/react").then((mod) => {
      mod.loader.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs" } });
      return mod;
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-500 mr-2" /> Loading editor…
      </div>
    ),
  }
);

const CATEGORIES = [
  "portfolio", "resume", "digital_card", "restaurant_menu", "business",
  "product_landing", "startup_landing", "personal", "event", "link_in_bio", "blank",
];

const STATUSES = ["published", "draft", "archived"] as const;

type TemplateRow = {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  thumbnailUrl: string;
  imageUrl?: string;
  previewUrl?: string;
  tags?: string[];
  version?: string;
author?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  status: string;
  featuredOrder?: number;
  useCount?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  defaultConfig?: any;
};

type SortKey = "createdAt" | "updatedAt" | "name" | "category" | "status" | "featuredOrder" | "useCount";

interface FormState {
  name: string;
  slug: string;
  category: string;
  description: string;
  thumbnailUrl: string;
  imageUrl: string;
  previewUrl: string;
  tags: string;
  version: string;
  author: string;
  isPublic: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  status: string;
  featuredOrder: number;
  defaultConfigJson: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  slug: "",
  category: "portfolio",
  description: "",
  thumbnailUrl: "",
  imageUrl: "",
  previewUrl: "",
  tags: "",
  version: "1.0.0",
  author: "Nexora AI",
  isPublic: true,
  isFeatured: false,
  isPremium: false,
  status: "published",
  featuredOrder: 0,
  defaultConfigJson: "",
};

export default function AdminTemplatesPage() {
  const router = useRouter();
  const toast = useToast();

  const [user, setUser] = useState<{ email: string; role?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // List state
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [featuredFilter, setFeaturedFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Preview modal (temporary state only — never persisted)
  const [previewData, setPreviewData] = useState<{ _id: string; name: string; category: string; defaultConfig: any } | null>(null);

  // Bulk import modal
  const [showBulk, setShowBulk] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkResult, setBulkResult] = useState<{ imported?: any[]; failed?: any[]; duplicates?: any[] } | null>(null);
  const [importing, setImporting] = useState(false);

  // Trash view
  const [showTrash, setShowTrash] = useState(false);
  const [trash, setTrash] = useState<TemplateRow[]>([]);

  // Auth + admin guard
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
      return;
    }
    authApi
      .me()
      .then((res) => {
        const u = res.data?.user || res.data;
        setUser(u);
        if (u?.role !== "admin") {
          toast.error("Admin access required");
          router.replace("/templates");
        }
      })
      .catch(() => router.replace("/login"))
      .finally(() => {
        setAuthChecked(true);
        setLoading(false);
      });
  }, [router, toast]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await templatesApi.adminList({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        featured: featuredFilter || undefined,
        sortBy,
        sortOrder,
      });
      if (res.data) {
        setTemplates(res.data);
        setTotal(res.meta?.total || 0);
      }
    } catch (err: any) {
      toast.error("Failed to load templates", err.message || "Please try again.");
    }
  }, [page, limit, debouncedSearch, statusFilter, categoryFilter, featuredFilter, sortBy, sortOrder, toast]);

  useEffect(() => {
    if (authChecked && user?.role === "admin") fetchTemplates();
  }, [fetchTemplates, authChecked, user?.role]);

  const fetchTrash = useCallback(async () => {
    try {
      const res = await templatesApi.adminTrash();
      if (res.data) setTrash(res.data);
    } catch (err: any) {
      toast.error("Failed to load trash", err.message || "Please try again.");
    }
  }, [toast]);

  useEffect(() => {
    if (showTrash) fetchTrash();
  }, [showTrash, fetchTrash]);

  const pages = Math.max(1, Math.ceil(total / limit));

  // ── Form handlers ────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFormErrors([]);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (t: TemplateRow) => {
    setEditingId(t._id);
    setForm({
      name: t.name,
      slug: t.slug,
      category: t.category,
      description: t.description || "",
      thumbnailUrl: t.thumbnailUrl || "",
      imageUrl: t.imageUrl || "",
      previewUrl: t.previewUrl || "",
      tags: (t.tags || []).join(", "),
      version: t.version || "1.0.0",
      author: t.author || "",
      isPublic: t.isPublic ?? true,
      isFeatured: t.isFeatured || false,
      isPremium: t.isPremium || false,
      status: t.status || "published",
      featuredOrder: t.featuredOrder || 0,
      defaultConfigJson: "",
    });
    // Fetch full config for editing
    templatesApi
      .get(t._id)
      .then((res) => {
        if (res.data?.defaultConfig) {
          setForm((prev) => ({ ...prev, defaultConfigJson: JSON.stringify(res.data.defaultConfig, null, 2) }));
        }
      })
      .catch((err) => toast.error("Failed to load config", err.message));
    setFormErrors([]);
    setShowForm(true);
  };

  const setFormField = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => {
    let defaultConfig: any = null;
    if (form.defaultConfigJson.trim()) {
      try {
        defaultConfig = JSON.parse(form.defaultConfigJson);
      } catch (e: any) {
        throw new Error("Template JSON is not valid JSON: " + e.message);
      }
    }
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    return {
      name: form.name,
      slug: form.slug || undefined,
      category: form.category,
      description: form.description,
      thumbnailUrl: form.thumbnailUrl,
      imageUrl: form.imageUrl,
      previewUrl: form.previewUrl,
      tags,
      version: form.version,
      author: form.author,
      isPublic: form.isPublic,
      isFeatured: form.isFeatured,
      isPremium: form.isPremium,
      status: form.status,
      featuredOrder: form.featuredOrder,
      defaultConfig,
    };
  };

  const handleSave = async () => {
    const errors: string[] = [];
    if (!form.name.trim()) errors.push("Name is required.");
    if (!form.category.trim()) errors.push("Category is required.");

    let config: any = null;
    if (form.defaultConfigJson.trim()) {
      try {
        config = JSON.parse(form.defaultConfigJson);
        const v = validateTemplateJSON(config);
        if (!v.valid) errors.push(`Template JSON schema invalid: ${(v.errors || []).join("; ")}`);
      } catch (e: any) {
        errors.push("Template JSON is not valid JSON: " + e.message);
      }
    } else {
      errors.push("Template JSON is required.");
    }

    if (errors.length) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    setFormErrors([]);
    try {
      const payload = { ...buildPayload(), defaultConfig: config };
      if (editingId) {
        await templatesApi.update(editingId, payload);
        toast.success("Template updated");
      } else {
        await templatesApi.create(payload);
        toast.success("Template created");
      }
      setShowForm(false);
      resetForm();
      fetchTemplates();
    } catch (err: any) {
      const msg = err.message || "Save failed";
      setFormErrors([msg]);
      toast.error("Save failed", msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Status / publish toggle ──────────────────────────────────────────────
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await templatesApi.updateStatus(id, status);
      toast.success(`Template ${status}`);
      fetchTemplates();
    } catch (err: any) {
      toast.error("Status change failed", err.message || "Please try again.");
    }
  };

  // ── Soft delete / restore / permanent ────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm("Soft-delete this template? It can be restored later.")) return;
    try {
      await templatesApi.remove(id);
      toast.success("Template soft-deleted");
      fetchTemplates();
    } catch (err: any) {
      toast.error("Delete failed", err.message || "Please try again.");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await templatesApi.restore(id);
      toast.success("Template restored");
      fetchTrash();
      fetchTemplates();
    } catch (err: any) {
      toast.error("Restore failed", err.message || "Please try again.");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("PERMANENTLY delete this template? This CANNOT be undone.")) return;
    try {
      await templatesApi.permanentDelete(id);
      toast.success("Template permanently deleted");
      fetchTrash();
    } catch (err: any) {
      toast.error("Permanent delete failed", err.message || "Please try again.");
    }
  };

  // ── Preview (read-only, temp state) ──────────────────────────────────────
  const openPreview = async (t: TemplateRow) => {
    try {
      const res = await templatesApi.preview(t._id);
      if (res.data) {
        setPreviewData(res.data);
      } else {
        toast.error("No config found for preview");
      }
    } catch (err: any) {
      toast.error("Preview failed", err.message || "Please try again.");
    }
  };

  // ── Bulk import ──────────────────────────────────────────────────────────
  const handleBulkImport = async () => {
    if (!bulkJson.trim()) {
      toast.error("Paste import JSON first");
      return;
    }
    let parsed: any[];
    try {
      parsed = JSON.parse(bulkJson);
    } catch (e: any) {
      toast.error("Invalid JSON", e.message);
      return;
    }
    if (!Array.isArray(parsed)) {
      toast.error("Invalid format", "JSON must be an array of template objects.");
      return;
    }
    setImporting(true);
    setBulkResult(null);
    try {
      const res = await templatesApi.bulkImport(parsed);
      setBulkResult(res.data);
      toast.success(
        `Imported ${res.meta?.importedCount || 0}`,
        `${res.meta?.duplicateCount || 0} duplicates, ${res.meta?.failedCount || 0} failed`
      );
      fetchTemplates();
    } catch (err: any) {
      toast.error("Bulk import failed", err.message || "Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm("Seed the 11 preset templates into the database? Existing ones will be skipped.")) return;
    try {
await templatesApi.seed();
      toast.success("Preset templates seeded");
      fetchTemplates();
    } catch (err: any) {
      toast.error("Seed failed", err.message || "Please try again.");
    }
  };

  // ── Derived sorted list is server-side; client just renders ─────────────
  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      published: "bg-emerald-50 text-emerald-700 border-emerald-200",
      draft: "bg-amber-50 text-amber-700 border-amber-200",
      archived: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return map[s] || map.draft;
  };

  const statusIcon = (s: string) => {
    if (s === "published") return <Check size={11} />;
    if (s === "archived") return <Archive size={11} />;
    return <Clock size={11} />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col">
        <Navbar user={null} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading Admin Template Manager…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <Shield className="text-amber-500" size={28} /> Admin Template Manager
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create, edit, publish, bulk-import, and manage all templates. 100% additive — bundled gallery untouched.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSeed}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <Sparkles size={14} className="text-indigo-400" /> Seed Presets
            </button>
            <button
              onClick={() => { setShowBulk(true); setBulkResult(null); setBulkJson(""); }}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <Upload size={14} className="text-emerald-400" /> Bulk Import
            </button>
            <button
              onClick={() => { setShowForm(true); resetForm(); }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> New Template
            </button>
          </div>
        </div>

        {/* ── Toolbar: search / filters / sort ───────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search name, description, tags…"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={14} className="text-slate-500 hidden sm:block" />
              {/* Status filter */}
              <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-1 border border-slate-800">
                <button
                  onClick={() => { setStatusFilter(""); setPage(1); }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${!statusFilter ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  All
                </button>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setStatusFilter(statusFilter === s ? "" : s); setPage(1); }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold capitalize transition-all ${statusFilter === s ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {/* Featured filter */}
              <select
                value={featuredFilter}
                onChange={(e) => { setFeaturedFilter(e.target.value); setPage(1); }}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="">All featured</option>
                <option value="true">Featured only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            {/* Category filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category:</span>
              <button
                onClick={() => { setCategoryFilter(""); setPage(1); }}
                className={`px-2 py-1 rounded-md text-[11px] font-bold ${!categoryFilter ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}`}
              >
                All
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCategoryFilter(categoryFilter === c ? "" : c); setPage(1); }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold ${categoryFilter === c ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}`}
                >
                  {c.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-xs text-slate-300 focus:outline-none"
              >
                <option value="createdAt">Newest</option>
                <option value="updatedAt">Updated</option>
                <option value="name">Name</option>
                <option value="category">Category</option>
                <option value="status">Status</option>
                <option value="featuredOrder">Order</option>
                <option value="useCount">Usage</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-2 py-2 rounded-lg border border-slate-800 bg-slate-950 text-slate-300 hover:text-white text-xs font-bold"
                title="Toggle sort order"
              >
                {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Trash toggle + count ───────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Showing <span className="font-bold text-white">{templates.length}</span> of <span className="font-bold text-white">{total}</span> templates
          </p>
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              showTrash ? "bg-rose-600/20 text-rose-300 border-rose-600/40" : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            <Trash2 size={13} /> {showTrash ? "Hide Trash" : "View Trash"}
            {trash.length > 0 && <span className="px-1.5 py-0.5 rounded-md bg-rose-600/20 text-rose-300 text-[10px]">{trash.length}</span>}
          </button>
        </div>

        {/* ── Trash view ─────────────────────────────────────────────────── */}
        {showTrash && (
          <div className="bg-slate-900 border border-rose-900/40 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="text-xs font-extrabold text-rose-300 flex items-center gap-2">
                <Trash2 size={14} /> Soft-Deleted Templates
              </h3>
              <span className="text-[11px] text-slate-500">{trash.length} in trash</span>
            </div>
            {trash.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">Trash is empty.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {trash.map((t) => (
                  <div key={t._id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-slate-200">{t.name}</p>
                      <p className="text-[11px] text-slate-500">/{t.slug} · {t.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRestore(t._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 border border-emerald-700/40 hover:bg-emerald-600/10 transition-all flex items-center gap-1"
                      >
                        <RotateCcw size={12} /> Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(t._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-400 border border-rose-700/40 hover:bg-rose-600/10 transition-all flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete Permanently
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Templates grid ─────────────────────────────────────────────── */}
        {templates.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl py-16 flex flex-col items-center gap-3 text-center px-6">
            <LayoutTemplate size={32} className="text-slate-600" />
            <p className="text-sm font-bold text-slate-300">No templates found</p>
            <p className="text-xs text-slate-500 max-w-sm">
              Try adjusting your filters, or create a new template with the button above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {templates.map((t) => (
              <div
                key={t._id}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.3),0_10px_24px_-14px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out will-change-transform hover:border-indigo-600/40 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]"
              >
                {/* ── Live Preview Area ─────────────────────────────────── */}
                <div className="relative shrink-0">
                  <div className="origin-top transform-gpu transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                    {t.defaultConfig ? (
                      <TemplateThumbnail config={t.defaultConfig} name={t.name} category={t.category} height={190} />
                    ) : (
                      <div className="relative h-[190px] w-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                        {t.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <LayoutTemplate size={28} className="text-slate-600" />
                        )}
                        {/* Legacy fallback depth */}
                        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_-20px_28px_-16px_rgba(0,0,0,0.4)]" />
                      </div>
                    )}
                  </div>

                  {/* Glass overlay */}
                  <div className="pointer-events-none absolute inset-0 rounded-t-2xl bg-gradient-to-b from-black/25 via-transparent to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Status badge */}
                  <span className={`absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border backdrop-blur-md ${statusBadge(t.status)}`}>
                    {statusIcon(t.status)} {t.status}
                  </span>

                  {/* Badges */}
                  <div className="absolute top-2 right-2 z-10 flex gap-1">
                    {t.isFeatured && <span className="w-6 h-6 rounded-full bg-amber-500/90 text-white flex items-center justify-center shadow-lg shadow-amber-500/30"><Star size={12} className="fill-white" /></span>}
                    {t.isPremium && <span className="w-6 h-6 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg shadow-purple-500/30"><Lock size={12} /></span>}
                  </div>

                  {/* Usage count */}
                  <span className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold">
                    {t.useCount || 0} uses
                  </span>

                  {/* Shine sweep on hover */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-12 translate-x-[-160%] group-hover:translate-x-[420%] transition-transform duration-[900ms] ease-out" />
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-extrabold text-sm text-slate-100 truncate">{t.name}</h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">/{t.slug} · <span className="text-indigo-400">{t.category}</span></p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{t.description || "No description"}</p>
                    <div className="flex flex-wrap gap-1">
                      {(t.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-400">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-3 border-t border-slate-800">
                    <button onClick={() => openPreview(t)} title="Preview" className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-600">
                      <Eye size={14} />
                    </button>
                    <button onClick={() => openEdit(t)} title="Edit" className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-indigo-400 hover:border-indigo-600">
                      <Pencil size={14} />
                    </button>
                    {/* Status toggle */}
                    <select
                      value={t.status}
                      onChange={(e) => handleStatusChange(t._id, e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-[11px] font-bold text-slate-300 focus:outline-none"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button onClick={() => handleDelete(t._id)} title="Delete" className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300"
              >
                {[6, 12, 24, 48].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3 py-1 text-xs font-bold text-slate-300">{page} / {pages}</span>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="p-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ── Create / Edit Modal ──────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { if (!saving) setShowForm(false); }}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                {editingId ? <Pencil size={16} className="text-indigo-400" /> : <Plus size={16} className="text-indigo-400" />}
                {editingId ? "Edit Template" : "Create Template"}
              </h3>
              <button onClick={() => { if (!saving) setShowForm(false); }} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"><X size={16} /></button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Validation errors */}
              {formErrors.length > 0 && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs text-rose-300 font-mono space-y-1">
                  {formErrors.map((e, i) => <div key={i}>• {e}</div>)}
                </div>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Name *</label>
                  <input value={form.name} onChange={(e) => setFormField("name", e.target.value)} placeholder="My Template" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Slug (auto if blank)</label>
                  <input value={form.slug} onChange={(e) => setFormField("slug", e.target.value)} placeholder="my-template" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Category *</label>
                  <select value={form.category} onChange={(e) => setFormField("category", e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setFormField("status", e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none">
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setFormField("description", e.target.value)} rows={2} placeholder="Short description shown in gallery" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Thumbnail URL</label>
                  <input value={form.thumbnailUrl} onChange={(e) => setFormField("thumbnailUrl", e.target.value)} placeholder="https://…/thumb.png" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Preview Image URL</label>
                  <input value={form.previewUrl} onChange={(e) => setFormField("previewUrl", e.target.value)} placeholder="https://…/preview.png" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Cover Image URL</label>
                  <input value={form.imageUrl} onChange={(e) => setFormField("imageUrl", e.target.value)} placeholder="https://…/cover.png" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Tags (comma separated)</label>
                  <input value={form.tags} onChange={(e) => setFormField("tags", e.target.value)} placeholder="modern, dark, minimal" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Version</label>
                  <input value={form.version} onChange={(e) => setFormField("version", e.target.value)} placeholder="1.0.0" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Author</label>
                  <input value={form.author} onChange={(e) => setFormField("author", e.target.value)} placeholder="Nexora AI" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Featured Order</label>
                  <input type="number" value={form.featuredOrder} onChange={(e) => setFormField("featuredOrder", Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-4 pt-2">
                {([
                  { key: "isPublic", label: "Public" },
                  { key: "isFeatured", label: "Featured" },
                  { key: "isPremium", label: "Premium" },
                ] as { key: "isPublic" | "isFeatured" | "isPremium"; label: string }[]).map((t) => (
                  <button key={t.key} onClick={() => setFormField(t.key, !form[t.key])} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${form[t.key] ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300" : "bg-slate-950 border-slate-700 text-slate-400"}`}>
                    <span className={`w-3 h-3 rounded-full border ${form[t.key] ? "bg-indigo-500 border-indigo-400" : "border-slate-600"}`}>
                      {form[t.key] && <Check size={10} className="text-white" />}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* JSON editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <FileJson size={12} className="text-indigo-400" /> Template JSON (SiteConfigSchema) *
                  </label>
                  <span className="text-[10px] text-slate-500">Validated against SiteConfigSchema on save</span>
                </div>
                <div className="h-72 border border-slate-800 rounded-xl overflow-hidden">
                  <MonacoEditor
                    height="100%"
                    theme="vs-dark"
                    language="json"
                    value={form.defaultConfigJson}
                    onChange={(val) => setFormField("defaultConfigJson", val || "")}
                    options={{ fontSize: 13, minimap: { enabled: false }, wordWrap: "on", lineNumbers: "on", padding: { top: 12 }, scrollBeyondLastLine: false }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0 bg-slate-950/50">
              <button onClick={() => { if (!saving) setShowForm(false); }} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 disabled:opacity-50">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {saving ? "Saving…" : editingId ? "Save Changes" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal (read-only, temp state) ────────────────────────── */}
      {previewData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewData(null)}>
          <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full h-[88vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{previewData.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">/{previewData.name?.toLowerCase().replace(/\s+/g, "-")} · {previewData.category}</p>
              </div>
              <button onClick={() => setPreviewData(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-auto bg-white">
              <SiteRenderer config={previewData.defaultConfig} />
            </div>
          </div>
        </div>
      )}

      {/* ── Bulk Import Modal ────────────────────────────────────────────── */}
      {showBulk && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { if (!importing) setShowBulk(false); }}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Upload size={16} className="text-emerald-400" /> Bulk Import Templates
              </h3>
              <button onClick={() => { if (!importing) setShowBulk(false); }} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste a JSON <b>array</b> of template objects. Each must have <code className="text-indigo-300">name</code>, <code className="text-indigo-300">category</code>, and <code className="text-indigo-300">defaultConfig</code>. Valid templates are imported; duplicates &amp; invalid ones are reported without corrupting the database.
              </p>
              <div className="h-64 border border-slate-800 rounded-xl overflow-hidden">
                <MonacoEditor
                  height="100%"
                  theme="vs-dark"
                  language="json"
                  value={bulkJson}
                  onChange={(val) => setBulkJson(val || "")}
                  options={{ fontSize: 13, minimap: { enabled: false }, wordWrap: "on", lineNumbers: "on", padding: { top: 12 }, scrollBeyondLastLine: false }}
                />
              </div>

              {/* Result report */}
              {bulkResult && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center">
                      <p className="text-2xl font-extrabold text-emerald-400">{bulkResult.imported?.length || 0}</p>
                      <p className="text-[11px] text-emerald-300 uppercase font-bold">Imported</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/40 text-center">
                      <p className="text-2xl font-extrabold text-amber-400">{bulkResult.duplicates?.length || 0}</p>
                      <p className="text-[11px] text-amber-300 uppercase font-bold">Duplicates</p>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-center">
                      <p className="text-2xl font-extrabold text-rose-400">{bulkResult.failed?.length || 0}</p>
                      <p className="text-[11px] text-rose-300 uppercase font-bold">Failed</p>
                    </div>
                  </div>
{(bulkResult.failed?.length ?? 0) > 0 && (
                    <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl text-xs text-rose-300 font-mono space-y-1 max-h-32 overflow-y-auto">
                      {(bulkResult.failed || []).map((f, i) => (
                        <div key={i}>• [{f.index}] {f.name || "?"}: {f.error}</div>
                      ))}
                    </div>
                  )}
                  {(bulkResult.duplicates?.length ?? 0) > 0 && (
                    <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-300 font-mono space-y-1 max-h-32 overflow-y-auto">
                      {(bulkResult.duplicates || []).map((d, i) => (
                        <div key={i}>• [{d.index}] {d.name || "?"}: {d.error}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0 bg-slate-950/50">
              <button onClick={() => { if (!importing) setShowBulk(false); }} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800">Close</button>
              <button onClick={handleBulkImport} disabled={importing} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1.5 disabled:opacity-50">
                {importing ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                {importing ? "Importing…" : "Import Templates"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
