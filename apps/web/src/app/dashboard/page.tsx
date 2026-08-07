"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { projectsApi, authApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { SiteConfigJSON } from "@ai-platform/shared";
import { Navbar } from "@/components/navigation/Navbar";
import {
  Globe,
  Plus,
  Trash2,
  Sparkles,
  LayoutGrid,
  Send,
  Clock,
  CheckCircle2,
  FolderKanban,
  Loader2,
  Search,
  Copy,
  ExternalLink,
  Wand2,
  LayoutTemplate,
} from "lucide-react";



type Project = {
  _id: string;
  name: string;
  category: string;
  status: string;
  slug: string;
  updatedAt: string;
};

type ProjectTab = "all" | "draft" | "published";

export default function DashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email: string; role?: string; name?: string } | null>(null);

  // Filters
  const [projectTab, setProjectTab] = useState<ProjectTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);

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

  // Handle Blank site creation
  const handleCreateBlank = async () => {
    setIsCreating(true);
    try {
      const blankConfig: SiteConfigJSON = {
        meta: { title: "Blank Canvas Site", category: "blank", description: "Start from a clean canvas" },
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
            title: "Welcome to Your New Site",
            subtitle: "Click any section in the sidebar to start customizing your design.",
            visible: true,
            content: {},
          },
        ],
      };
      const res = await projectsApi.create({
        name: "Blank Canvas Site",
        category: "blank",
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

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete this project permanently?")) return;
    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      toast.success("Project deleted");
    } catch (err: any) {
      toast.error("Failed to delete project", err.message || "Please try again.");
    }
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
            <p className="text-sm font-medium">Loading your projects hub…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      <Navbar user={user} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* ── Page Title Header ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <FolderKanban className="text-indigo-600" size={28} /> My Projects Workspace
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage, edit, publish, and duplicate all your digital presence sites in one place.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/templates"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
            >
              <LayoutTemplate size={14} className="text-indigo-600" /> Browse Templates
            </Link>
            <Link
              href="/ai-builder"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Wand2 size={14} /> AI Builder
            </Link>
          </div>
        </div>

        {/* ── Quick Action Cards Banner ───────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* AI Generator Card */}
          <Link
            href="/ai-builder"
            className="md:col-span-2 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl p-7 text-white relative overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
          >
            <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-400 via-transparent to-transparent" />
            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles size={12} /> AI Digital Architect
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                Generate a Brand New Site with AI
              </h2>
              <p className="text-xs text-indigo-200/80 max-w-md leading-relaxed">
                Describe your business or vision — portfolio, restaurant, startup — and AI builds layouts, color palettes, and copywriting instantly.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-2 text-xs font-bold text-indigo-300 group-hover:text-white transition-colors">
              Open AI Architect Studio →
            </div>
          </Link>

          {/* Start From Blank Card */}
          <div
            onClick={handleCreateBlank}
            className="bg-white border border-slate-200 rounded-2xl p-7 flex flex-col justify-between hover:border-indigo-400/60 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="space-y-2.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Plus size={22} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Start From Blank
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Build from scratch with a clean canvas, empty sections, and custom design settings.
              </p>
            </div>
            <div className="pt-4 flex items-center text-xs font-bold text-indigo-600">
              {isCreating ? "Creating blank site…" : "Create blank site →"}
            </div>
          </div>
        </section>

        {/* ── My Projects Section ─────────────────────────────────────────── */}
        <section className="space-y-5">
          {/* Controls Bar: Search + Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:bg-white transition-all"
              />
            </div>

            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 shrink-0">
              {([
                { key: "all", label: "All", count: projects.length, icon: LayoutGrid },
                { key: "draft", label: "Drafts", count: draftCount, icon: Clock },
                { key: "published", label: "Published", count: publishedCount, icon: CheckCircle2 },
              ] as { key: ProjectTab; label: string; count: number; icon: any }[]).map((tab) => {
                const TabIcon = tab.icon;
                const isActive = projectTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setProjectTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <TabIcon size={12} />
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
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl py-16 px-6 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                <Globe size={24} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                {searchQuery
                  ? "No projects match your search"
                  : projectTab === "all"
                  ? "No projects created yet"
                  : `No ${projectTab} projects`}
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                {projectTab === "all"
                  ? "Pick a handcrafted template or use AI Architect to build your first site in 60 seconds."
                  : `You currently have no projects in ${projectTab} status.`}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <Link
                  href="/templates"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Browse Templates
                </Link>
                <Link
                  href="/ai-builder"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  Use AI Builder
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProjects.map((proj) => {
                const isPublished = proj.status === "published";
                return (
                  <div
                    key={proj._id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-indigo-300/80 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Status + Category Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {proj.category.replace("_", " ")}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isPublished
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {isPublished ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                          {isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      {/* Name */}
                      <h3 className="font-extrabold text-sm text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {proj.name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Updated {new Date(proj.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-1.5 pt-4 border-t border-slate-100 mt-4">
                      <Link
                        href={`/editor/${proj._id}`}
                        className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 text-center transition-colors shadow-xs"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/publish/${proj._id}`}
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                        title="Publish site"
                      >
                        <Send size={13} />
                      </Link>
                      {isPublished && proj.slug && (
                        <Link
                          href={`/${proj.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                          title="View live published site"
                        >
                          <ExternalLink size={13} />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDuplicateProject(proj._id)}
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                        title="Duplicate project"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj._id)}
                        className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                        title="Delete project"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
