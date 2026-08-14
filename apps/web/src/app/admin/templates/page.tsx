"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { templatesApi, authApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { TemplateThumbnail } from "@/components/renderer/TemplateThumbnail";
import { validateTemplateJSON, checkTemplateCompatibility, TemplateCompatibilityReport } from "@ai-platform/templates";
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
  Download,
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

  // ── Live JSON + Preview split view (client-side only, never persisted) ──
  const [splitPreview, setSplitPreview] = useState(false);
  const [liveConfig, setLiveConfig] = useState<any | null>(null);
  const [liveConfigError, setLiveConfigError] = useState<string | null>(null);

  // Preview modal (temporary state only — never persisted)
  const [previewData, setPreviewData] = useState<{ _id: string; name: string; category: string; defaultConfig: any } | null>(null);

// Bulk import modal
  const [showBulk, setShowBulk] = useState(false);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkResult, setBulkResult] = useState<{ imported?: any[]; failed?: any[]; duplicates?: any[] } | null>(null);
  const [importing, setImporting] = useState(false);

  // JSON Creation Guide & Compatibility Check modal
  const [showGuide, setShowGuide] = useState(false);
  const [compatibilityReport, setCompatibilityReport] = useState<TemplateCompatibilityReport | null>(null);

// Trash view
  const [showTrash, setShowTrash] = useState(false);
  const [trash, setTrash] = useState<TemplateRow[]>([]);

  // Bulk select (safe soft-delete)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
    // Edit mode is JSON-first: load the FULL template document (metadata +
    // defaultConfig) into the editor so users can edit everything in one JSON.
    setForm({
      ...EMPTY_FORM,
      name: t.name,
      slug: t.slug,
      category: t.category,
      status: t.status || "published",
    });
    templatesApi
      .get(t._id)
      .then((res) => {
        const doc: any = res.data;
        if (doc) {
          const full = {
            name: doc.name,
            slug: doc.slug,
            category: doc.category,
            description: doc.description || "",
            imageUrl: doc.imageUrl || "",
            previewUrl: doc.previewUrl || "",
            version: doc.version || "1.0.0",
            author: doc.author || "Nexora AI",
            isPublic: doc.isPublic ?? true,
            isFeatured: doc.isFeatured || false,
            isPremium: doc.isPremium || false,
            status: doc.status || "published",
            featuredOrder: doc.featuredOrder || 0,
            tags: doc.tags || [],
            thumbnailUrl: doc.thumbnailUrl || "",
            defaultConfig: doc.defaultConfig || null,
            ...(doc.defaultConfig?.meta ? { meta: doc.defaultConfig.meta } : {}),
          };
          // Include everything: metadata fields + defaultConfig at top level.
          setForm({
            ...EMPTY_FORM,
            name: full.name,
            slug: full.slug,
            category: full.category,
            description: full.description,
            thumbnailUrl: full.thumbnailUrl,
            imageUrl: full.imageUrl,
            previewUrl: full.previewUrl,
            tags: (full.tags || []).join(", "),
            version: full.version,
            author: full.author,
            isPublic: full.isPublic,
            isFeatured: full.isFeatured,
            isPremium: full.isPremium,
            status: full.status,
            featuredOrder: full.featuredOrder,
            defaultConfigJson: JSON.stringify(
              { ...full.defaultConfig, meta: { ...full.defaultConfig?.meta, ...(full.meta || {}) } },
              null,
              2
            ),
          });
        }
      })
      .catch((err) => toast.error("Failed to load config", err.message));
    setFormErrors([]);
    setShowForm(true);
  };

const setFormField = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // ── Live JSON → preview (debounced, client-side only — never persisted) ──
  useEffect(() => {
    if (!splitPreview) {
      setLiveConfig(null);
      setLiveConfigError(null);
      return;
    }
    const raw = (form.defaultConfigJson || "").trim();
    if (!raw) {
      setLiveConfig(null);
      setLiveConfigError("Paste a SiteConfigJSON to preview.");
      return;
    }
    const t = setTimeout(() => {
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          setLiveConfig(null);
          setLiveConfigError("JSON must be a single template object (SiteConfigSchema).");
          return;
        }
        setLiveConfig(parsed);
        setLiveConfigError(null);
      } catch (e: any) {
        setLiveConfig(null);
        setLiveConfigError("Invalid JSON: " + e.message);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [form.defaultConfigJson, splitPreview]);

  const buildPayload = () => {
    let defaultConfig: any = null;
    if (form.defaultConfigJson.trim()) {
      try {
        defaultConfig = JSON.parse(form.defaultConfigJson);
      } catch (e: any) {
        throw new Error("Template JSON is not valid JSON: " + e.message);
      }
    }
    const meta = defaultConfig?.meta || {};

    // In edit mode, the JSON is the single source of truth: derive all
    // template metadata fields from it (name, slug, category, thumbnail,
    // tags, status, etc.). Fall back to the form fields for create mode.
    return {
      name: meta.title || (editingId ? meta.title : form.name),
      slug: meta.slug || form.slug || undefined,
      category: meta.category || form.category,
      description: meta.description || form.description,
      thumbnailUrl: meta.title ? `/templates/${meta.category || form.category}.png` : form.thumbnailUrl,
      imageUrl: form.imageUrl,
      previewUrl: form.previewUrl,
      tags: Array.isArray(meta.tags) ? meta.tags : form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      version: meta.version || form.version,
      author: meta.author || form.author,
      isPublic: form.isPublic,
      isFeatured: form.isFeatured,
      isPremium: form.isPremium,
      status: form.status,
      featuredOrder: form.featuredOrder,
      defaultConfig,
    };
  };

  const handleRunCompatibilityCheck = () => {
    if (!form.defaultConfigJson.trim()) {
      toast.error("Template JSON is empty", "Paste or load a template JSON config first.");
      return;
    }
    try {
      const parsed = JSON.parse(form.defaultConfigJson);
      const report = checkTemplateCompatibility(parsed);
      setCompatibilityReport(report);
      if (report.overallValid) {
        toast.success("Compatibility Check Passed!", `Score: ${report.score}% — Template is ready to publish.`);
      } else {
        toast.error("Compatibility Warning", `Score: ${report.score}% — Issues detected in template config.`);
      }
    } catch (e: any) {
      toast.error("Invalid JSON Syntax", e.message);
    }
  };

  const handleSave = async () => {
    const errors: string[] = [];
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

  // ── Empty trash (permanent wipe of ALL soft-deleted templates) ──────────
  const [emptyingTrash, setEmptyingTrash] = useState(false);

  const handleEmptyTrash = async () => {
    if (trash.length === 0) return;
    if (!confirm(`PERMANENTLY delete ALL ${trash.length} templates in trash? This CANNOT be undone.`)) return;
    setEmptyingTrash(true);
    try {
      const res = await templatesApi.emptyTrash();
      toast.success(`Trash emptied`, `${res.data?.deleted ?? trash.length} template(s) permanently deleted.`);
      fetchTrash();
      clearSelection();
      fetchTemplates();
    } catch (err: any) {
      toast.error("Empty trash failed", err.message || "Please try again.");
    } finally {
      setEmptyingTrash(false);
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

// ── Download all templates (export as .json file) ───────────────────────
  const [exporting, setExporting] = useState(false);

  const handleDownloadAll = async () => {
    setExporting(true);
    try {
      const res = await templatesApi.exportAll();
      const data = res.data || [];
      if (data.length === 0) {
        toast.error("No templates to export");
        return;
      }
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nexora-templates-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${data.length} templates`, "Full JSON backup saved.");
    } catch (err: any) {
      toast.error("Export failed", err.message || "Please try again.");
    } finally {
      setExporting(false);
    }
  };

// ── Bulk select / bulk delete (safe soft-delete) ────────────────────────
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const pageIds = templates.map((t) => t._id);
      const allSelected = pageIds.every((id) => next.has(id));
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!confirm(`Soft-delete ${ids.length} selected template(s)? They can be restored later from Trash.`)) return;
    setBulkDeleting(true);
    try {
      const res = await templatesApi.bulkDelete(ids);
      toast.success(`Deleted ${res.data?.deleted || ids.length} template(s)`, "Moved to Trash — restorable.");
      setSelectedIds(new Set());
      fetchTemplates();
    } catch (err: any) {
      toast.error("Bulk delete failed", err.message || "Please try again.");
    } finally {
      setBulkDeleting(false);
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
              onClick={handleDownloadAll}
              disabled={exporting}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Download all templates as a .json backup"
            >
              {exporting ? <Loader2 size={14} className="animate-spin text-sky-400" /> : <Download size={14} className="text-sky-400" />}
              {exporting ? "Exporting…" : "Download All"}
            </button>
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
              onClick={() => setShowGuide(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-all flex items-center gap-1.5"
              title="Open the JSON template creation guide"
            >
              <FileJson size={14} className="text-sky-400" /> Creation Guide
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

{/* ── Bulk select / bulk delete action bar ──────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={templates.length > 0 && templates.every((t) => selectedIds.has(t._id))}
                onChange={toggleSelectAllOnPage}
                className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-300">
                Select all on page
              </span>
            </label>
            <span className="text-[11px] text-slate-500">
              {selectedIds.size > 0 ? (
                <span className="text-indigo-300 font-bold">{selectedIds.size} selected</span>
              ) : (
                "Tick cards to select multiple templates"
              )}
            </span>
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Clear ({selectedIds.size})
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {bulkDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                {bulkDeleting ? "Deleting…" : `Delete Selected (${selectedIds.size})`}
              </button>
            </div>
          )}
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">{trash.length} in trash</span>
                {trash.length > 0 && (
                  <button
                    onClick={handleEmptyTrash}
                    disabled={emptyingTrash}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    title="Permanently delete ALL templates in trash"
                  >
                    {emptyingTrash ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    {emptyingTrash ? "Emptying…" : "Empty Trash"}
                  </button>
                )}
              </div>
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
                      <TemplateThumbnail config={t.defaultConfig} name={t.name} category={t.category} />
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

                  {/* Selection checkbox */}
                  <label
                    className="absolute bottom-2 right-2 z-20 flex items-center justify-center w-6 h-6 rounded-md bg-black/60 backdrop-blur-sm border border-white/20 cursor-pointer hover:bg-indigo-600/60 transition-colors"
                    title={selectedIds.has(t._id) ? "Deselect" : "Select"}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(t._id)}
                      onChange={() => toggleSelect(t._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                    />
                  </label>
                  {selectedIds.has(t._id) && (
                    <div className="pointer-events-none absolute inset-0 z-10 ring-2 ring-inset ring-indigo-500/70 rounded-t-2xl bg-indigo-500/5" />
                  )}

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

              {/* Edit mode: read-only context header (JSON is the editor) */}
              {editingId && (
                <div className="px-4 py-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-200">{form.name}</span>
                  <span className="text-slate-500">/{form.slug}</span>
                  <span className="text-indigo-400">{form.category}</span>
                  <span className="text-slate-500">Edit everything in the JSON below — name, slug, category, description, tags, thumbnail &amp; config.</span>
                </div>
              )}

              {/* Metadata (create only — edit mode is JSON-first) */}
              {!editingId && (
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
              )}

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

{/* JSON editor + Live Preview (split view) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5">
                    <FileJson size={12} className="text-indigo-400" /> Template JSON (SiteConfigSchema) *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Validated on save</span>
                    <button
                      type="button"
                      onClick={() => setSplitPreview((v) => !v)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        splitPreview
                          ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                          : "bg-slate-950 border-slate-700 text-slate-400 hover:text-slate-200"
                      }`}
                      title={splitPreview ? "Hide live preview" : "Show live preview beside the JSON"}
                    >
                      <Eye size={12} /> {splitPreview ? "Hide Preview" : "Live Preview"}
                    </button>
                  </div>
                </div>

                {splitPreview ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Left: JSON editor */}
                    <div className="h-80 border border-slate-800 rounded-xl overflow-hidden">
                      <MonacoEditor
                        height="100%"
                        theme="vs-dark"
                        language="json"
                        value={form.defaultConfigJson}
                        onChange={(val) => setFormField("defaultConfigJson", val || "")}
                        options={{ fontSize: 12, minimap: { enabled: false }, wordWrap: "on", lineNumbers: "on", padding: { top: 12 }, scrollBeyondLastLine: false }}
                      />
                    </div>
                    {/* Right: live preview */}
                    <div className="h-80 rounded-xl bg-white border border-slate-800 overflow-auto">
                      {liveConfigError ? (
                        <div className="h-full flex items-center justify-center p-4">
                          <div className="text-center">
                            <AlertTriangle size={20} className="text-amber-400 mx-auto mb-2" />
                            <p className="text-[11px] text-amber-500 font-mono max-w-[220px]">{liveConfigError}</p>
                          </div>
                        </div>
                      ) : liveConfig ? (
                        <SiteRenderer config={liveConfig} />
                      ) : (
                        <div className="h-full flex items-center justify-center p-4">
                          <div className="text-center text-slate-400">
                            <Eye size={20} className="mx-auto mb-2 opacity-50" />
                            <p className="text-[11px] font-semibold">Paste JSON to preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
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
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-950/50">
              <button
                onClick={handleRunCompatibilityCheck}
                className="px-4 py-2 rounded-xl text-xs font-bold text-amber-300 border border-amber-500/40 bg-amber-950/30 hover:bg-amber-900/50 transition-all flex items-center gap-1.5"
              >
                <Sparkles size={13} className="text-amber-400" /> Run Compatibility Check
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => { if (!saving) setShowForm(false); }} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 disabled:opacity-50">
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Create Template"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Compatibility Report Modal ────────────────────────────────────── */}
      {compatibilityReport && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCompatibilityReport(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className={compatibilityReport.overallValid ? "text-emerald-400" : "text-amber-400"} size={20} />
                <h3 className="font-bold text-slate-100 text-sm">Template Compatibility Audit</h3>
              </div>
              <button onClick={() => setCompatibilityReport(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"><X size={16} /></button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${compatibilityReport.overallValid ? "bg-emerald-950/30 border-emerald-700/40 text-emerald-200" : "bg-amber-950/30 border-amber-700/40 text-amber-200"}`}>
                <div>
                  <div className="text-xs uppercase font-extrabold tracking-wider font-mono opacity-75">Compatibility Score</div>
                  <div className="text-2xl font-black">{compatibilityReport.score}% — {compatibilityReport.overallValid ? "Ready to Publish" : "Action Recommended"}</div>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono ${compatibilityReport.overallValid ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"}`}>
                  {compatibilityReport.overallValid ? "PASS ✓" : "WARNING ⚠"}
                </div>
              </div>

              <div className="space-y-2.5">
                {compatibilityReport.checks.map((chk, idx) => (
                  <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 ${chk.passed ? "text-emerald-400" : "text-rose-400"}`}>
                      {chk.passed ? <Check size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>{chk.title}</span>
                        <span className="font-mono text-[10px] uppercase text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">{chk.category}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{chk.message}</p>
                      {chk.details && chk.details.length > 0 && (
                        <ul className="mt-1.5 space-y-0.5 pl-3 list-disc text-[11px] text-rose-300/90 font-mono">
                          {chk.details.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex justify-end bg-slate-950/50">
              <button onClick={() => setCompatibilityReport(null)} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500">Close Audit Report</button>
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

      {/* ── Creation Guide Modal ─────────────────────────────────────────── */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowGuide(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 shrink-0">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <FileJson size={16} className="text-sky-400" /> Template JSON Creation Guide
              </h3>
              <button onClick={() => setShowGuide(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"><X size={16} /></button>
            </div>

<div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Intro */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-700/40 text-[11px] text-indigo-200 leading-relaxed">
                <b className="text-indigo-100">AI / Template Author Guide.</b> A template is a <b className="text-white">SiteConfigJSON</b> object. It defines <code className="text-sky-300">meta</code>, <code className="text-sky-300">theme</code>, <code className="text-sky-300">sections</code>, optional <code className="text-sky-300">seo</code>, and optional <code className="text-sky-300">customCode</code>. The JSON is validated against the schema on save and must be <b className="text-white">strictly valid</b> (see Critical Rules below). Everything below is the reference an AI must follow to generate a working template.
              </div>

              {/* CRITICAL RULES */}
              <section>
                <h4 className="text-xs font-extrabold text-rose-300 uppercase tracking-wider mb-2">⚠ · Critical Rules (reject the JSON if violated)</h4>
                <ol className="text-[11px] text-rose-200/90 space-y-2 list-decimal pl-4">
                  <li>
                    <b className="text-white">No raw newlines inside string values.</b> In particular <code className="text-slate-200">customCode.css</code> and any long text <b className="text-white">must escape line breaks as <code className="text-emerald-300">\n</code></b>. A literal newline inside a JSON string throws <code className="text-slate-200">"Bad control character in string literal"</code>. Write the CSS as a single-line string joined by <code className="text-emerald-300">\n</code>, or generate it programmatically with <code className="text-emerald-300">JSON.stringify</code>.
                  </li>
                  <li>
                    <b className="text-white">No comments in JSON.</b> JSON does not support <code className="text-slate-200">//</code> or <code className="text-slate-200">/* */</code>. Remove them.
                  </li>
                  <li>
                    <b className="text-white">No trailing commas</b> after the last item of an array/object.
                  </li>
                  <li>
                    <b className="text-white">All keys &amp; strings are double-quoted</b> (<code className="text-emerald-300">"key"</code>), not single-quoted.
                  </li>
                  <li>
                    <b className="text-white">CSS scoping:</b> Use the <code className="text-slate-200">body.tpl-{"<slug>"}</code> OR bare <code className="text-slate-200">body</code>-prefixed selectors (e.g. <code className="text-slate-200">body nav</code>, <code className="text-slate-200">body #hero h1</code>, <code className="text-slate-200">body::before</code>, <code className="text-slate-200">body section h2</code>) so the sanitizer rewrites them to the container. Do <b className="text-white">not</b> use <code className="text-slate-200">@import</code>, <code className="text-slate-200">@charset</code>, <code className="text-slate-200">javascript:</code>, or <code className="text-slate-200">behavior:</code> — those are rejected.
                  </li>
                  <li>
                    <b className="text-white">Unique <code className="text-slate-200">meta.slug</code></b> — it becomes the container class (<code className="text-slate-200">nexora-tpl-{"<slug>"}</code>) and the URL slug.
                  </li>
                </ol>
              </section>

              {/* 1. Top-level structure */}
              <section>
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider mb-2">1 · Top-level structure</h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`{
  "meta": {
    "id": "my-tpl",
    "slug": "my-tpl",
    "title": "My Template",
    "category": "portfolio",
    "description": "Short description",
    "author": "Nexora AI",
    "version": "1.0.0",
    "tags": ["modern", "dark"],
    "popularity": 90,
    "isNew": true,
    "status": "published"
  },
  "theme": { ... },
  "sections": [ ... ],
  "seo": { "metaTitle": "...", "metaDescription": "...", "ogImage": "...", "keywords": ["..."] },
  "customCode": { "html": "", "css": "...", "js": "..." }
}`}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  <code className="text-indigo-300">meta</code>, <code className="text-indigo-300">theme</code>, <code className="text-indigo-300">sections</code> required; <code className="text-indigo-300">seo</code> &amp; <code className="text-indigo-300">customCode</code> optional. Valid categories: <code className="text-slate-300">portfolio, resume, digital_card, restaurant_menu, business, product_landing, startup_landing, personal, event, link_in_bio, blank</code>.
                </p>
              </section>

              {/* 2. Theme */}
              <section>
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider mb-2">2 · Theme</h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`"theme": {
  "mode": "dark",                 // "light" | "dark" | "glassmorphism"
  "primaryColor": "#3B82F6",
  "secondaryColor": "#8B5CF6",
  "accentColor": "#F59E0B",
  "backgroundColor": "#090D16",
  "textColor": "#F8FAFC",
  "fontFamily": "Inter",
  "headingFont": "Inter",
  "bodyFont": "Inter",
  "borderRadius": "12px",
  "buttonVariant": "rounded",     // "rounded" | "pill" | "square"
  "cardVariant": "glass",         // "glass" | "border" | "solid"
  "shadow": "md",
  "spacingScale": "comfortable",
  "animations": true
}`}
                </div>
              </section>

              {/* 3. Sections — schema */}
              <section>
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider mb-2">3 · Section shape</h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`{
  "id": "unique-section-id",   // required, unique
  "type": "hero",              // required, one of the supported types
  "variant": "centered",       // optional free-form
  "title": "...",              // optional
  "subtitle": "...",           // optional
  "badge": "...",              // optional
  "content": { ... },          // optional object, type-specific (see below)
  "visible": true              // optional, default true
}`}
                </div>
                <p className="text-[11px] text-slate-500 mt-2 mb-2">
                  Supported <code className="text-slate-300">type</code> values:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["hero","navbar","about","features","portfolio_grid","menu_list","timeline","gallery","pricing","faq","testimonials","team","services","digital_card","contact","links","maps","whatsapp","blog","footer","custom_html"].map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-slate-800 text-sky-300 text-[10px] font-mono">{t}</span>
                  ))}
                </div>
              </section>

              {/* 4. Per-type content schemas */}
              <section>
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider mb-2">4 · Per-type <code className="text-sky-200">content</code> schema</h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`// navbar
{ "links": [{ "label": "About", "url": "#about" }],
  "ctaText": "Book", "ctaLink": "#contact" }

// hero
{ "ctaText": "Get Started", "ctaLink": "#contact",
  "secondaryCtaText": "Learn More", "secondaryCtaLink": "#about",
  "avatarUrl": "https://...", // optional hero image
  "stats": [{ "label": "Years", "value": "10" }] }

// about
{ "bio": "...", "highlights": ["..."],
  "skills": ["React", "Node"], "avatar": "https://..." }

// features
{ "items": [{ "title": "Speed", "desc": "...", "icon": "Zap" }] }  // icon from: Sparkles Zap CheckCircle2 Mail Phone MapPin ExternalLink ChevronDown Globe Star Clock Briefcase GraduationCap Shield Rocket User Heart Code2 Calendar Github Instagram Youtube Twitch Linkedin Facebook Twitter

// services
{ "items": [{ "title": "Hair", "desc": "...", "icon": "Sparkles", "image": "https://..." }] }

// portfolio_grid
{ "projects": [{ "name": "Project", "desc": "...", "tag": "Web", "image": "https://...", "url": "..." }] }

// menu_list
{ "categories": [{ "name": "Starters",
    "items": [{ "name": "Bruschetta", "desc": "...", "price": "$8", "badge": "POPULAR" }] }] }

// gallery
{ "images": [{ "url": "https://...", "alt": "..." }] }

// pricing
{ "plans": [{ "name": "Basic", "desc": "...", "price": "$9",
    "isPopular": false, "badge": "Most Popular",
    "features": ["Feature 1", "Feature 2"] }] }

// faq
{ "items": [{ "question": "Q?", "answer": "A." }] }

// testimonials
{ "items": [{ "quote": "...", "author": "Name", "role": "Client",
    "avatar": "https://..." }] }

// team
{ "members": [{ "name": "Jane", "role": "Designer",
    "avatar": "https://...", "bio": "..." }] }

// digital_card
{ "socials": { "email": "...", "phone": "...", "linkedin": "...", "twitter": "..." },
  "customLinks": [{ "label": "Portfolio", "url": "...", "badge": "New", "icon": "ExternalLink" }],
  "avatar": "https://...", "bio": "...", "location": "...",
  "ctaText": "Contact", "ctaLink": "..." }

// links
{ "links": [{ "label": "Portfolio", "url": "...", "badge": "New", "icon": "Globe" }] }

// contact
{ "email": "a@b.com", "phone": "+1 555 0000", "address": "Street",
  "hours": "9-5", "instagram": "https://...", "github": "https://...",
  "ctaText": "Send", "ctaLink": "#" }

// maps
{ "embedUrl": "https://...", "address": "...", "query": "...",
  "lat": 40.7, "lng": -74.0, "zoom": 15, "height": 380 }

// whatsapp
{ "phone": "+123456", "defaultText": "Hi!", "buttonText": "Chat",
  "availability": "Online now" }

// timeline
{ "items": [{ "period": "2020", "role": "Engineer",
  "company": "Acme", "desc": "..." }] }

// custom_html (fully bespoke — put full markup, NOT a full <html> doc)
{ "html": "<div class='my-block'>...</div>" }
`}
                </div>
              </section>

              {/* 5. Custom CSS */}
              <section>
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider mb-2">5 · Custom CSS (animations &amp; flair)</h4>
                <p className="text-[11px] text-slate-500 mb-2">
                  Put animated/global CSS in <code className="text-slate-200">customCode.css</code>. Use the <code className="text-slate-200">body.tpl-{"<slug>"}</code> prefix OR bare <code className="text-slate-200">body</code>-prefixed selectors — the sanitizer rewrites them to the container class. <b className="text-rose-300">Every newline must be <code className="text-emerald-300">\n</code>, not a raw line break.</b>
                </p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`"customCode": {
  "css": "body.tpl-my-tpl { background: #0D1117; }\\nbody.tpl-my-tpl .card:hover { transform: translateY(-4px); }\\nbody section h2 { color: #C9A227; }"
}`}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  In the raw JSON file, those are literal backslash-n sequences. In Monaco you can paste a compact single-line CSS string. The container class is <code className="text-slate-200">nexora-tpl-{"<slug>"}</code>.
                </p>
              </section>

              {/* 6. Custom JS */}
              <section>
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider mb-2">6 · Custom JS</h4>
                <p className="text-[11px] text-slate-500 mb-2">
                  Optional interactivity in <code className="text-slate-200">customCode.js</code>. It runs after render. Use <code className="text-slate-200">document.querySelector</code> with the template's own classes/ids. Keep it dependency-free (IIFE wrapped automatically).
                </p>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`"js": "var h=document.querySelector('.hamburger');h&&h.addEventListener('click',function(){document.querySelector('.menu').classList.toggle('open');});"`}
                </div>
              </section>

              {/* 7. Full worked example */}
              <section>
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider mb-2">7 · Complete minimal example (copy-paste ready)</h4>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`{
  "meta": {
    "id": "acme-store",
    "slug": "acme-store",
    "title": "Acme Store",
    "category": "business",
    "description": "A clean business one-pager.",
    "author": "Nexora AI",
    "version": "1.0.0",
    "tags": ["business", "clean"],
    "popularity": 85,
    "isNew": true,
    "status": "published"
  },
  "theme": {
    "mode": "dark",
    "primaryColor": "#C9A227",
    "secondaryColor": "#0B3B2E",
    "accentColor": "#E7C9A9",
    "backgroundColor": "#0B3B2E",
    "textColor": "#F7F3EA",
    "headingFont": "Cormorant Garamond",
    "bodyFont": "Jost",
    "borderRadius": "16px",
    "buttonVariant": "pill",
    "cardVariant": "glass",
    "animations": true
  },
  "sections": [
    {
      "id": "navbar",
      "type": "navbar",
      "content": {
        "links": [
          { "label": "Services", "url": "#services" },
          { "label": "Contact", "url": "#contact" }
        ],
        "ctaText": "Book Now",
        "ctaLink": "#contact"
      },
      "visible": true
    },
    {
      "id": "hero",
      "type": "hero",
      "title": "Welcome to Acme",
      "subtitle": "Modern solutions for modern business.",
      "badge": "New",
      "content": {
        "ctaText": "Get Started",
        "ctaLink": "#contact",
        "stats": [ { "label": "Clients", "value": "500+" } ]
      },
      "visible": true
    },
    {
      "id": "services",
      "type": "services",
      "title": "Our Services",
      "content": {
        "items": [
          { "title": "Consulting", "desc": "Expert advice.", "icon": "Sparkles" }
        ]
      },
      "visible": true
    },
    {
      "id": "contact",
      "type": "contact",
      "title": "Contact",
      "content": {
        "email": "hi@acme.com",
        "phone": "+1 555 0100",
        "address": "1 Main St"
      },
      "visible": true
    },
    { "id": "footer", "type": "footer", "title": "Acme Store", "visible": true }
  ],
  "seo": {
    "metaTitle": "Acme Store",
    "metaDescription": "Modern business solutions.",
    "keywords": ["business", "store"]
  },
  "customCode": {
    "html": "",
    "css": "body nav { backdrop-filter: blur(12px); }\\nbody #hero h1 { color: #C9A227; }",
    "js": ""
  }
}`}
                </div>
              </section>

              {/* 8. Pro tips */}
              <section>
                <h4 className="text-xs font-extrabold text-sky-300 uppercase tracking-wider mb-2">8 · Pro tips</h4>
                <ul className="text-[11px] text-slate-400 space-y-1.5 list-disc pl-4">
                  <li>Use unique <code className="text-slate-200">meta.slug</code> — it becomes the container class and URL slug.</li>
                  <li>Reuse an exported template (<b>Download All</b>) as a starting point, then tweak the JSON.</li>
                  <li>Validate with <b>Live Preview</b> in the editor before saving.</li>
                  <li>For fully bespoke layouts, use <code className="text-slate-200">custom_html</code> sections with full markup in <code className="text-slate-200">content.html</code> — but keep <code className="text-slate-200">customCode.html</code> empty to avoid duplication.</li>
                  <li>Prefer structured sections (<code className="text-slate-200">hero, services, gallery, testimonials, contact</code>) for editability; reserve <code className="text-slate-200">custom_html</code> for one-off creative blocks.</li>
                  <li>Always include <code className="text-slate-200">@keyframes</code> inside <code className="text-slate-200">@media (prefers-reduced-motion: reduce)</code> no-op overrides for accessibility.</li>
                </ul>
              </section>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end shrink-0 bg-slate-950/50">
              <button onClick={() => setShowGuide(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-800">Close</button>
              <button onClick={() => { setShowGuide(false); setShowForm(true); resetForm(); }} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5">
                <Plus size={13} /> Create a Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
