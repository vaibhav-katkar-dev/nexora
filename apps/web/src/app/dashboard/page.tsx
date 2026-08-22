"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projectsApi, authApi, formsApi, analyticsApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { SiteConfigJSON } from "@ai-platform/shared";
import { Navbar } from "@/components/navigation/Navbar";
import { QuickBusinessSetupModal } from "@/components/common/QuickBusinessSetupModal";
import { BusinessProfile, injectBusinessProfileIntoConfig } from "@/lib/businessProfile";
import {
  Globe,
  Plus,
  Trash2,
  Sparkles,
  LayoutGrid,
  Send,
  Clock,
  CheckCircle2,
  Loader2,
  Search,
  ExternalLink,
  Wand2,
  LayoutTemplate,
  Settings,
  Pencil,
  MessageCircle,
  BarChart3,
  Users,
  Download,
  Star,
  Mail,
  Phone,
  Eye,
  MousePointerClick,
  Timer,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  RefreshCw,
  X,
  Share2,
} from "lucide-react";
import { QrModal } from "@/components/common/QrModal";
import { DomainSeoModal } from "@/components/dashboard/DomainSeoModal";
import { ProjectSettingsPanel } from "@/components/dashboard/ProjectSettingsPanel";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { buildPublishedSiteUrl } from "@/lib/siteUrl";

type Project = {
  _id: string;
  name: string;
  category: string;
  status: string;
  slug: string;
  updatedAt: string;
};

type ProjectTab = "all" | "draft" | "published";
type DashboardView = "sites" | "leads" | "analytics";

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const [dashboardView, setDashboardView] = useState<DashboardView>("sites");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; role?: string; name?: string } | null>(null);

  // Filters & modals for projects
  const [projectTab, setProjectTab] = useState<ProjectTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [qrModalData, setQrModalData] = useState<{ isOpen: boolean; url: string; title: string; slug: string }>({
    isOpen: false,
    url: "",
    title: "",
    slug: "",
  });
  const [domainSeoModalData, setDomainSeoModalData] = useState<{ isOpen: boolean; site: any }>({
    isOpen: false,
    site: null,
  });
  const [settingsPanelProject, setSettingsPanelProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirmState, setDeleteConfirmState] = useState<{ isOpen: boolean; projectId: string; projectName: string }>({
    isOpen: false,
    projectId: "",
    projectName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Leads & Form Responses State ──────────────────────────────────────────
  const [leads, setLeads] = useState<any[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsFilterProject, setLeadsFilterProject] = useState<string>("all");
  const [leadsFilterStatus, setLeadsFilterStatus] = useState<"all" | "unread" | "starred">("all");
  const [leadsSearch, setLeadsSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [leadsMeta, setLeadsMeta] = useState<{ total: number; unreadCount: number; totalAll: number; page: number; limit: number; totalPages: number }>({
    total: 0,
    unreadCount: 0,
    totalAll: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  // ── Site Analytics State ──────────────────────────────────────────────────
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<number>(30);
  const [selectedAnalyticsProject, setSelectedAnalyticsProject] = useState<string>("all");
  const [dashboardSummary, setDashboardSummary] = useState<any | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const meRes = await authApi.me();
      if (meRes.data) setUser(meRes.data.user || meRes.data);
      const projRes = await projectsApi.getAll();
      if (projRes.data) setProjects(projRes.data);
    } catch (err) {
      console.error("Dashboard load error", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const params: any = { page: 1, limit: 50 };
      if (leadsFilterProject !== "all") params.projectId = leadsFilterProject;
      if (leadsFilterStatus === "unread") params.isRead = false;
      if (leadsFilterStatus === "starred") params.isStarred = true;
      if (leadsSearch.trim()) params.search = leadsSearch.trim();

      const res = await formsApi.getResponses(params);
      if (res?.data) {
        setLeads(res.data);
        if (res.meta) setLeadsMeta(res.meta);
      }
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLeadsLoading(false);
    }
  }, [leadsFilterProject, leadsFilterStatus, leadsSearch]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const summaryRes = await analyticsApi.getDashboardSummary(analyticsPeriod);
      if (summaryRes?.data) setDashboardSummary(summaryRes.data);

      if (selectedAnalyticsProject !== "all") {
        const projRes = await analyticsApi.getProjectAnalytics(selectedAnalyticsProject, analyticsPeriod);
        if (projRes?.data) setAnalyticsData(projRes.data);
      } else if (summaryRes?.data) {
        setAnalyticsData(summaryRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [selectedAnalyticsProject, analyticsPeriod]);

  // Auth guard — redirect to login if no token
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (dashboardView === "leads") {
      fetchLeads();
    } else if (dashboardView === "analytics") {
      fetchAnalytics();
    }
  }, [dashboardView, fetchLeads, fetchAnalytics]);

  // Initial light fetch for lead count badge
  useEffect(() => {
    formsApi.getResponses({ limit: 1 }).then((res) => {
      if (res?.meta) setLeadsMeta((prev) => ({ ...prev, unreadCount: res.meta.unreadCount, totalAll: res.meta.totalAll }));
    }).catch(() => {});
  }, []);

  const [showCreateBlankModal, setShowCreateBlankModal] = useState(false);

  // Handle Blank site creation
  const handleCreateBlank = async (profile?: BusinessProfile | null) => {
    setIsCreating(true);
    try {
      const projName = profile?.brandName?.trim() || "Blank Canvas Site";
      let blankConfig: SiteConfigJSON = {
        meta: { title: projName, category: (profile?.category || "blank") as any, description: profile?.tagline || "Start from a clean canvas" },
        theme: {
          primaryColor: "#4F46E5",
          secondaryColor: "#8B5CF6",
          accentColor: "#F59E0B",
          backgroundColor: "#F8FAFC",
          textColor: "#111827",
          fontFamily: "Inter",
          headingFont: "Inter",
          bodyFont: "Inter",
          borderRadius: "12px",
          buttonVariant: "rounded",
          cardVariant: "glass",
          shadow: "md",
          mode: "light",
          spacingScale: "comfortable",
          animations: true,
        },
        sections: [
          {
            id: "hero-blank",
            type: "hero",
            variant: "centered",
            title: projName,
            subtitle: profile?.tagline || "Click any section in the sidebar to start customizing your design.",
            visible: true,
            content: {
              ctaText: profile?.ctaText || "Get in Touch",
            },
          },
          {
            id: "contact-blank",
            type: "contact",
            variant: "default",
            title: "Get in Touch",
            subtitle: "Send us a message or inquiry.",
            visible: true,
            content: {
              phone: profile?.phone || "",
              whatsapp: profile?.whatsapp || profile?.phone || "",
              email: profile?.email || "",
              address: profile?.location || "",
              formConfig: {
                enabled: true,
                destination: "both",
                submitButtonText: "Send Message",
                successMessage: "Thank you! Your message has been received.",
                whatsappNumber: profile?.whatsapp || profile?.phone || "",
                notifyEmail: profile?.email || "",
              },
            },
          },
        ],
      };

      if (profile) {
        blankConfig = injectBusinessProfileIntoConfig(blankConfig, profile);
      }

      const res = await projectsApi.create({
        name: projName,
        category: (profile?.category || "blank") as any,
        config: blankConfig,
      });
      if (res.data?._id) router.push(`/editor/${res.data._id}`);
    } catch (err: any) {
      toast.error("Failed to create project", err.message || "Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicateProject = async (id: string) => {
    try {
      const res = await projectsApi.duplicate(id);
      if (res.data) {
        setProjects((prev) => [res.data, ...prev]);
        toast.success("Project duplicated successfully");
      }
    } catch (err: any) {
      toast.error("Duplicate failed", err.message || "Please try again.");
    }
  };

  const handleDeleteProject = (id: string) => {
    const proj = projects.find((p) => p._id === id);
    setDeleteConfirmState({
      isOpen: true,
      projectId: id,
      projectName: proj?.name || "this project",
    });
  };

  const confirmDeleteProject = async () => {
    const id = deleteConfirmState.projectId;
    if (!id) return;
    setIsDeleting(true);
    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success("Project deleted");
      setDeleteConfirmState({ isOpen: false, projectId: "", projectName: "" });
    } catch (err: any) {
      toast.error("Failed to delete project", err.message || "Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Lead actions
  const handleToggleLeadRead = async (lead: any) => {
    try {
      const newReadState = !lead.isRead;
      await formsApi.updateResponse(lead._id, { isRead: newReadState });
      setLeads((prev) => prev.map((item) => (item._id === lead._id ? { ...item, isRead: newReadState } : item)));
      setLeadsMeta((prev) => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount + (newReadState ? -1 : 1)),
      }));
      if (selectedLead?._id === lead._id) {
        setSelectedLead({ ...selectedLead, isRead: newReadState });
      }
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleToggleLeadStarred = async (lead: any) => {
    try {
      const newStarredState = !lead.isStarred;
      await formsApi.updateResponse(lead._id, { isStarred: newStarredState });
      setLeads((prev) => prev.map((item) => (item._id === lead._id ? { ...item, isStarred: newStarredState } : item)));
      if (selectedLead?._id === lead._id) {
        setSelectedLead({ ...selectedLead, isStarred: newStarredState });
      }
    } catch (err) {
      toast.error("Failed to update star");
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await formsApi.deleteResponse(id);
      setLeads((prev) => prev.filter((item) => item._id !== id));
      setLeadsMeta((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      if (selectedLead?._id === id) setSelectedLead(null);
      toast.success("Inquiry deleted");
    } catch (err) {
      toast.error("Failed to delete inquiry");
    }
  };

  // Open WhatsApp reply
  const handleReplyWhatsApp = (lead: any) => {
    const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      toast.error("No phone number provided", "This inquiry did not include a valid phone number.");
      return;
    }
    const text = `Hi ${lead.name}, thank you for reaching out to us regarding ${lead.projectName || "your inquiry"}!`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  // Filter projects by tab + search query
  const filteredProjects = projects.filter((p) => {
    const matchesTab =
      projectTab === "all"
        ? true
        : projectTab === "draft"
        ? p.status === "draft" || !p.status
        : p.status === "published";
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const draftCount = projects.filter((p) => p.status === "draft" || !p.status).length;
  const publishedCount = projects.filter((p) => p.status === "published").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar user={null} />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Loading your digital presence hub…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Page Header & View Switcher ─────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Studio Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your published websites, incoming form leads, and real-time visitor analytics.
            </p>
          </div>

          {/* Main View Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl shrink-0 self-start md:self-auto border border-slate-300/40">
            <button
              onClick={() => setDashboardView("sites")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                dashboardView === "sites"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid size={14} className={dashboardView === "sites" ? "text-indigo-600" : ""} />
              <span>My Sites</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-700 font-extrabold">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => setDashboardView("leads")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                dashboardView === "leads"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageCircle size={14} className={dashboardView === "leads" ? "text-emerald-600" : ""} />
              <span>Form Leads</span>
              {leadsMeta.unreadCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-black animate-pulse">
                  {leadsMeta.unreadCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 text-slate-600 font-extrabold">
                  {leadsMeta.totalAll || 0}
                </span>
              )}
            </button>

            <button
              onClick={() => setDashboardView("analytics")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                dashboardView === "analytics"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 size={14} className={dashboardView === "analytics" ? "text-indigo-600" : ""} />
              <span>Site Analytics</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: MY SITES                                                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {dashboardView === "sites" && (
          <div className="space-y-8">
            {/* Quick Action Cards Banner */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              {/* AI Generator Card */}
              <Link
                href="/ai-builder"
                className="sm:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-2xl p-5 sm:p-7 text-white relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-10"
                  style={{ background: "radial-gradient(circle at center, white 0%, transparent 70%)" }}
                />
                <div className="relative z-10 space-y-2.5 sm:space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-white/15 text-white border border-white/20">
                    <Sparkles size={12} /> Built with AI
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                    Start a new site with AI
                  </h2>
                  <p className="text-sm text-indigo-100/80 max-w-md leading-relaxed line-clamp-3 sm:line-clamp-none">
                    Tell us what your site is for — a portfolio, a restaurant, a startup — and AI writes the content, picks the layout and gets it ready to publish.
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-2 text-sm font-semibold text-indigo-200 group-hover:text-white transition-colors">
                  Try AI builder →
                </div>
              </Link>

              {/* Start From Blank Card */}
              <div
                onClick={() => setShowCreateBlankModal(true)}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="space-y-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Start from scratch
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Blank canvas, your rules. Add interactive forms & sections as you go.
                  </p>
                </div>
                <div className="pt-4 text-sm font-semibold text-indigo-600">
                  {isCreating ? "Creating…" : "Open blank editor →"}
                </div>
              </div>
            </section>

            {/* My Projects Section */}
            <section className="space-y-5">
              {/* Controls Bar: Search + Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 p-3 sm:p-4 rounded-2xl shadow-xs">
                {/* Search Input */}
                <div className="relative flex-1 min-w-0">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Find a project…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
                  />
                </div>

                {/* Tab switcher */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
                  {([
                    { key: "all", label: "All", count: projects.length, icon: LayoutGrid },
                    { key: "draft", label: "Drafts", count: draftCount, icon: Clock },
                    { key: "published", label: "Live", count: publishedCount, icon: CheckCircle2 },
                  ] as { key: ProjectTab; label: string; count: number; icon: any }[]).map((tab) => {
                    const TabIcon = tab.icon;
                    const isActive = projectTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setProjectTab(tab.key)}
                        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-white text-slate-900 shadow-xs font-bold"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <TabIcon size={12} className="hidden sm:inline" />
                        {tab.label}
                        <span
                          className={`ml-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                            isActive ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Project Cards Grid */}
              {filteredProjects.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 px-6 flex flex-col items-center gap-3 text-center">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Globe size={22} className="text-slate-400" />
                  </div>
                  <p className="text-base font-semibold text-slate-800">
                    {searchQuery
                      ? `Nothing found for "${searchQuery}"`
                      : projectTab === "all"
                      ? "You haven't built anything yet"
                      : `No ${projectTab} projects`}
                  </p>
                  <p className="text-sm text-slate-400 max-w-xs">
                    {projectTab === "all"
                      ? "Pick a template to get started, or let AI build one from your description."
                      : `Switch to "All" to see your other projects.`}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      href="/templates"
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      Browse templates
                    </Link>
                    <Link
                      href="/ai-builder"
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
                    >
                      Use AI builder
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProjects.map((proj) => {
                    const isPublished = proj.status === "published";
                    const liveUrl = buildPublishedSiteUrl(proj.slug);

                    return (
                      <div
                        key={proj._id}
                        className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col group"
                      >
                        {/* Status accent bar */}
                        <div className={`h-1 w-full ${isPublished ? "bg-emerald-400" : "bg-amber-300"}`} />

                        <div className="p-4 flex flex-col gap-3 flex-1">
                          {/* Header row */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {proj.name}
                              </h3>
                              <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                                {proj.category.replace(/_/g, " ")}
                              </p>
                            </div>

                            {/* Settings icon → opens panel */}
                            <button
                              onClick={() => setSettingsPanelProject(proj)}
                              title="Project settings"
                              className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
                            >
                              <Settings size={14} />
                            </button>
                          </div>

                          {/* Status + date row */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isPublished
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-600"
                              }`}
                            >
                              {isPublished ? <CheckCircle2 size={9} /> : <Clock size={9} />}
                              {isPublished ? "Live" : "Draft"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(proj.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>

                          {/* Quick shortcuts for Leads and Analytics */}
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setLeadsFilterProject(proj._id);
                                setDashboardView("leads");
                              }}
                              className="flex-1 py-1 px-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 text-[10px] font-bold transition-all flex items-center justify-center gap-1 border border-slate-200/60"
                              title="View Form Inquiries for this site"
                            >
                              <MessageCircle size={11} className="text-emerald-600" />
                              <span>Leads</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedAnalyticsProject(proj._id);
                                setDashboardView("analytics");
                              }}
                              className="flex-1 py-1 px-2 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 text-[10px] font-bold transition-all flex items-center justify-center gap-1 border border-slate-200/60"
                              title="View Visitor Analytics for this site"
                            >
                              <BarChart3 size={11} className="text-indigo-600" />
                              <span>Analytics</span>
                            </button>
                          </div>
                        </div>

                        {/* Footer actions */}
                        <div className="flex items-stretch border-t border-slate-100">
                          <Link
                            href={`/editor/${proj._id}`}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil size={12} />
                            Edit
                          </Link>

                          {isPublished && proj.slug ? (
                            <a
                              href={liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors border-l border-slate-100"
                            >
                              <ExternalLink size={12} />
                              View Live
                            </a>
                          ) : (
                            <Link
                              href={`/publish/${proj._id}`}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors border-l border-slate-100"
                            >
                              <Send size={12} />
                              Publish
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: FORM RESPONSES & LEADS                                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {dashboardView === "leads" && (
          <div className="space-y-6">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Inquiries</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{leadsMeta.totalAll || leads.length}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MessageCircle size={22} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Unread Leads</p>
                  <h3 className="text-2xl font-black text-emerald-600 mt-1">{leadsMeta.unreadCount || 0}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Star size={22} />
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Connected Sites</p>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{projects.length}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Globe size={22} />
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search leads by name, email, phone, message..."
                  value={leadsSearch}
                  onChange={(e) => setLeadsSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all"
                />
              </div>

              {/* Site selector dropdown */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={leadsFilterProject}
                  onChange={(e) => setLeadsFilterProject(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Sites</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                {/* Status selector */}
                <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                  <button
                    onClick={() => setLeadsFilterStatus("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      leadsFilterStatus === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setLeadsFilterStatus("unread")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      leadsFilterStatus === "unread" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => setLeadsFilterStatus("starred")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      leadsFilterStatus === "starred" ? "bg-white text-amber-600 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    Starred
                  </button>
                </div>

                {/* CSV Export & Refresh */}
                <a
                  href={formsApi.getExportUrl(leadsFilterProject !== "all" ? leadsFilterProject : undefined)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </a>

                <button
                  onClick={fetchLeads}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                  title="Refresh responses"
                >
                  <RefreshCw size={14} className={leadsLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Leads Table / Cards */}
            {leadsLoading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 size={24} className="animate-spin text-indigo-600" />
                <p className="text-xs font-semibold">Loading responses…</p>
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <MessageCircle size={24} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Form Submissions Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  When visitors fill out the contact form on your published sites, their inquiries and contact details will appear here instantly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div
                    key={lead._id}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      !lead.isRead ? "border-emerald-300/80 bg-emerald-50/20" : "border-slate-200"
                    }`}
                  >
                    {/* Sender Info & Message Preview */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {(lead.name || "U").charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{lead.name}</h4>
                          {!lead.isRead && (
                            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white">
                              NEW
                            </span>
                          )}
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {lead.projectName || lead.projectSlug}
                          </span>
                          {(lead.utm?.campaign || lead.utm?.source) && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/60" title={`UTM Source: ${lead.utm.source || "n/a"} | Medium: ${lead.utm.medium || "n/a"}`}>
                              🎯 {lead.utm.campaign || lead.utm.source}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(lead.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                          <a href={`mailto:${lead.email}`} className="hover:text-indigo-600 flex items-center gap-1">
                            <Mail size={12} /> {lead.email}
                          </a>
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="hover:text-emerald-600 flex items-center gap-1 font-mono">
                              <Phone size={12} /> {lead.phone}
                            </a>
                          )}
                        </div>

                        <p className="text-xs text-slate-700 line-clamp-2 pt-1 font-normal leading-relaxed">
                          {lead.message || "(No message body)"}
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions Bar */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {lead.phone && (
                        <button
                          onClick={() => handleReplyWhatsApp(lead)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all flex items-center gap-1.5"
                          title="Reply to lead on WhatsApp"
                        >
                          <MessageCircle size={13} />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      <a
                        href={`mailto:${lead.email}?subject=Regarding your inquiry on ${lead.projectName || "Oninsite"}`}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all flex items-center gap-1.5"
                        title="Reply via email"
                      >
                        <Mail size={13} />
                        <span>Email</span>
                      </a>

                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all"
                        title="View details"
                      >
                        <Eye size={13} />
                      </button>

                      <button
                        onClick={() => handleToggleLeadStarred(lead)}
                        className={`p-2 rounded-xl transition-all ${
                          lead.isStarred
                            ? "text-amber-500 bg-amber-50"
                            : "text-slate-400 hover:text-amber-500 hover:bg-slate-100"
                        }`}
                        title="Star lead"
                      >
                        <Star size={14} className={lead.isStarred ? "fill-amber-500" : ""} />
                      </button>

                      <button
                        onClick={() => handleToggleLeadRead(lead)}
                        className={`p-2 rounded-xl transition-all ${
                          lead.isRead
                            ? "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                            : "text-emerald-600 bg-emerald-100/60"
                        }`}
                        title={lead.isRead ? "Mark as unread" : "Mark as read"}
                      >
                        <CheckCircle2 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteLead(lead._id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete lead"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* VIEW 3: SITE ANALYTICS & INSIGHTS                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {dashboardView === "analytics" && (
          <div className="space-y-6">
            {/* Filter / Scope Toolbar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Site:</label>
                <select
                  value={selectedAnalyticsProject}
                  onChange={(e) => setSelectedAnalyticsProject(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Combined Dashboard Overview</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                  <button
                    onClick={() => setAnalyticsPeriod(7)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      analyticsPeriod === 7 ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    Last 7 Days
                  </button>
                  <button
                    onClick={() => setAnalyticsPeriod(30)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      analyticsPeriod === 30 ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    Last 30 Days
                  </button>
                </div>

                <button
                  onClick={fetchAnalytics}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all"
                  title="Refresh analytics"
                >
                  <RefreshCw size={14} className={analyticsLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {/* Metrics KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pageviews</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Eye size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {analyticsData?.totalViews ?? dashboardSummary?.totalViews ?? 0}
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <TrendingUp size={11} className="text-emerald-500" />
                  <span>Real-time visitor views</span>
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unique Visitors</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {analyticsData?.uniqueVisitors ?? dashboardSummary?.uniqueVisitors ?? 0}
                </h3>
                <p className="text-[11px] text-slate-400">Daily unique visitor hashes</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Time on Site</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Timer size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {(() => {
                    const sec = analyticsData?.avgDurationSeconds ?? dashboardSummary?.avgDurationSeconds ?? 0;
                    if (sec <= 0) return "< 30s";
                    const mins = Math.floor(sec / 60);
                    const remSec = sec % 60;
                    return mins > 0 ? `${mins}m ${remSec}s` : `${sec}s`;
                  })()}
                </h3>
                <p className="text-[11px] text-slate-400">Engagement duration</p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inquiries & Leads</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageCircle size={16} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-emerald-600">
                  {analyticsData?.totalSubmissions ?? dashboardSummary?.totalSubmissions ?? 0}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {analyticsData?.totalViews > 0
                    ? `${((analyticsData.totalSubmissions / analyticsData.totalViews) * 100).toFixed(1)}% conversion rate`
                    : "Ready to collect leads"}
                </p>
              </div>
            </div>

            {/* Daily Trend Timeline Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Daily Traffic & Views Trend</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Page views per day over the selected window</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {analyticsPeriod} Days Window
                </span>
              </div>

              {/* Responsive SVG Bar Timeline */}
              {analyticsData?.dailyTrend && analyticsData.dailyTrend.length > 0 ? (
                <div className="pt-4">
                  <div className="h-44 flex items-end gap-1 sm:gap-2 px-2 border-b border-slate-200">
                    {analyticsData.dailyTrend.map((d: any, idx: number) => {
                      const maxViews = Math.max(1, ...analyticsData.dailyTrend.map((t: any) => t.views || 0));
                      const heightPercent = Math.max(8, Math.round(((d.views || 0) / maxViews) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded-md shadow-lg transition-opacity whitespace-nowrap z-20">
                            <div>{d.date}</div>
                            <div className="text-indigo-300 font-bold">{d.views || 0} views</div>
                            {d.submissions > 0 && <div className="text-emerald-400 font-bold">{d.submissions} leads</div>}
                          </div>

                          {/* Bar */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              d.views > 0
                                ? "bg-gradient-to-t from-indigo-600 to-indigo-400 group-hover:from-indigo-500 group-hover:to-indigo-300"
                                : "bg-slate-100"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Dates label axis */}
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 px-1">
                    <span>{analyticsData.dailyTrend[0]?.date}</span>
                    <span>{analyticsData.dailyTrend[Math.floor(analyticsData.dailyTrend.length / 2)]?.date}</span>
                    <span>{analyticsData.dailyTrend[analyticsData.dailyTrend.length - 1]?.date}</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No trend points available for this period yet.
                </div>
              )}
            </div>

            {/* Breakdown Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Device Breakdown */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Monitor size={14} className="text-indigo-600" />
                  <span>Device Breakdown</span>
                </h4>

                {(() => {
                  const dev = analyticsData?.deviceBreakdown || { desktop: 0, mobile: 0, tablet: 0 };
                  const total = (dev.desktop || 0) + (dev.mobile || 0) + (dev.tablet || 0) || 1;
                  const dPercent = Math.round(((dev.desktop || 0) / total) * 100);
                  const mPercent = Math.round(((dev.mobile || 0) / total) * 100);
                  const tPercent = Math.round(((dev.tablet || 0) / total) * 100);

                  return (
                    <div className="space-y-3 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1 text-slate-700">
                            <Monitor size={12} /> Desktop
                          </span>
                          <span className="text-slate-900 font-bold">{dPercent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div style={{ width: `${dPercent}%` }} className="h-full bg-indigo-600 rounded-full" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1 text-slate-700">
                            <Smartphone size={12} /> Mobile
                          </span>
                          <span className="text-slate-900 font-bold">{mPercent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div style={{ width: `${mPercent}%` }} className="h-full bg-emerald-500 rounded-full" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1 text-slate-700">
                            <Tablet size={12} /> Tablet
                          </span>
                          <span className="text-slate-900 font-bold">{tPercent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div style={{ width: `${tPercent}%` }} className="h-full bg-violet-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Traffic Referrers */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Share2 size={14} className="text-emerald-600" />
                  <span>Top Referrers</span>
                </h4>

                <div className="space-y-2.5 pt-1">
                  {analyticsData?.topReferrers && analyticsData.topReferrers.length > 0 ? (
                    analyticsData.topReferrers.map((ref: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 capitalize">{ref.source}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-mono">{ref.count} views</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {ref.percentage}%
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-4 text-center">
                      Direct traffic & local visits
                    </div>
                  )}
                </div>
              </div>

              {/* Marketing & UTM Campaigns */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-600" />
                  <span>UTM Campaigns</span>
                </h4>

                <div className="space-y-2.5 pt-1">
                  {analyticsData?.topUtmCampaigns && analyticsData.topUtmCampaigns.length > 0 ? (
                    analyticsData.topUtmCampaigns.map((utm: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                          {utm.campaign}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 font-mono">
                          {utm.count} visits
                        </span>
                      </div>
                    ))
                  ) : analyticsData?.topUtmSources && analyticsData.topUtmSources.length > 0 ? (
                    analyticsData.topUtmSources.map((utm: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                          {utm.source}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 font-mono">
                          {utm.count} visits
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-4 text-center">
                      Add ?utm_campaign=... or ?utm_source=... to campaign links to track traffic sources.
                    </div>
                  )}
                </div>
              </div>

              {/* Top CTA Actions */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MousePointerClick size={14} className="text-violet-600" />
                  <span>Popular Interactions</span>
                </h4>

                <div className="space-y-2.5 pt-1">
                  {analyticsData?.topActions && analyticsData.topActions.length > 0 ? (
                    analyticsData.topActions.map((act: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[130px]">
                          {act.target}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-50 text-violet-700 font-mono">
                          {act.count} clicks
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 py-4 text-center">
                      Interactive link & button clicks will record here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Lead Details Modal ────────────────────────────────────────────── */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 px-2 py-0.5 rounded-md bg-indigo-50">
                  {selectedLead.projectName}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedLead.name}</h3>
                <p className="text-xs text-slate-400">{new Date(selectedLead.createdAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Email:</span>
                  <a href={`mailto:${selectedLead.email}`} className="font-bold text-indigo-600 hover:underline">
                    {selectedLead.email}
                  </a>
                </div>
                {selectedLead.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Phone:</span>
                    <a href={`tel:${selectedLead.phone}`} className="font-bold text-emerald-600 hover:underline font-mono">
                      {selectedLead.phone}
                    </a>
                  </div>
                )}
                {selectedLead.referrer && (
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Referrer:</span>
                    <span className="text-slate-700 truncate max-w-[220px]">{selectedLead.referrer}</span>
                  </div>
                )}
                {(selectedLead.utm?.campaign || selectedLead.utm?.source) && (
                  <div className="flex justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-purple-600 font-bold">Marketing Campaign:</span>
                    <span className="text-purple-700 font-mono font-bold">
                      {selectedLead.utm.campaign || "n/a"} ({selectedLead.utm.source || "direct"}{selectedLead.utm.medium ? ` / ${selectedLead.utm.medium}` : ""})
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Message Content</label>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message || "(Empty message)"}
                </div>
              </div>

              {selectedLead.customData && Object.keys(selectedLead.customData).length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Additional Fields</label>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    {Object.entries(selectedLead.customData).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500 font-medium capitalize">{k}:</span>
                        <span className="font-bold text-slate-800">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              {selectedLead.phone && (
                <button
                  onClick={() => handleReplyWhatsApp(selectedLead)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <MessageCircle size={14} /> Open WhatsApp
                </button>
              )}
              <a
                href={`mailto:${selectedLead.email}?subject=Regarding your inquiry on ${selectedLead.projectName}`}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all flex items-center gap-1.5"
              >
                <Mail size={14} /> Reply by Email
              </a>
            </div>
          </div>
        </div>
      )}

      <QrModal
        isOpen={qrModalData.isOpen}
        onClose={() => setQrModalData({ ...qrModalData, isOpen: false })}
        url={qrModalData.url}
        title={qrModalData.title}
        slug={qrModalData.slug}
      />

      <DomainSeoModal
        isOpen={domainSeoModalData.isOpen}
        onClose={() => setDomainSeoModalData({ isOpen: false, site: null })}
        site={domainSeoModalData.site}
        onSiteUpdated={fetchData}
      />

      <ProjectSettingsPanel
        project={settingsPanelProject}
        onClose={() => setSettingsPanelProject(null)}
        onDuplicate={handleDuplicateProject}
        onDelete={handleDeleteProject}
        onOpenDomainSeo={(proj) => setDomainSeoModalData({ isOpen: true, site: proj })}
        onOpenQr={(proj, url) =>
          setQrModalData({ isOpen: true, url, title: proj.name, slug: proj.slug })
        }
        onCopyLink={(url) => {
          navigator.clipboard.writeText(url);
          toast.success("Link copied!", url);
        }}
      />

      <ConfirmModal
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState({ isOpen: false, projectId: "", projectName: "" })}
        onConfirm={confirmDeleteProject}
        title="Delete Project?"
        message={`Are you sure you want to permanently delete "${deleteConfirmState.projectName}"? This action cannot be undone.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />

      {/* ── Quick Business Setup Wizard Modal ── */}
      <QuickBusinessSetupModal
        isOpen={showCreateBlankModal}
        onClose={() => setShowCreateBlankModal(false)}
        templateName="Blank Canvas Site"
        onSubmit={(profile) => {
          setShowCreateBlankModal(false);
          handleCreateBlank(profile);
        }}
        onSkip={() => {
          setShowCreateBlankModal(false);
          handleCreateBlank(null);
        }}
        isSubmitting={isCreating}
      />
    </div>
  );
}
