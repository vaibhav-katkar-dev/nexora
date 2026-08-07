"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { projectsApi } from "@/lib/api";
import { Navbar } from "@/components/navigation/Navbar";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Copy,
  ExternalLink,
  Loader2,
  Sparkles,
  Shield,
  Eye,
  Lock,
  Search,
  Check,
  RefreshCw,
} from "lucide-react";

const RESERVED_SLUGS = [
  "dashboard",
  "login",
  "register",
  "editor",
  "admin",
  "api",
  "publish",
  "favicon.ico",
];

export default function PublishWizardPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [siteName, setSiteName] = useState("");
  const [slug, setSlug] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Validation state
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isSlugValid, setIsSlugValid] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  // Fetch Project
  useEffect(() => {
    if (!projectId) return;
    projectsApi
      .getOne(projectId)
      .then((res) => {
        if (res?.data) {
          const p = res.data;
          setProject(p);
          setSiteName(p.name || "My Digital Site");
          setSlug(p.slug || slugify(p.name || "my-site"));
          setSeoTitle(p.seo?.metaTitle || p.name || "");
          setSeoDescription(p.seo?.metaDescription || p.config?.meta?.description || "");
        }
      })
      .catch((err) => console.error("Failed to load project", err))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Slug generator helper
  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Real-time Slug Validation
  const validateSlug = useCallback((inputSlug: string) => {
    const formatted = inputSlug.toLowerCase().trim();
    if (!formatted) {
      setSlugError("Slug cannot be empty");
      setIsSlugValid(false);
      return;
    }
    if (!/^[a-z0-9-]+$/.test(formatted)) {
      setSlugError("Slug can only contain lowercase letters, numbers, and hyphens");
      setIsSlugValid(false);
      return;
    }
    if (RESERVED_SLUGS.includes(formatted)) {
      setSlugError(`"${formatted}" is a reserved system path and cannot be used`);
      setIsSlugValid(false);
      return;
    }
    setSlugError(null);
    setIsSlugValid(true);
  }, []);

  const handleSlugChange = (val: string) => {
    setSlug(val);
    validateSlug(val);
  };

  const handleTitleChange = (val: string) => {
    setSiteName(val);
    if (!slug || slug === slugify(siteName)) {
      const generated = slugify(val);
      setSlug(generated);
      validateSlug(generated);
    }
  };

  const handlePublishSubmit = async () => {
    if (!isSlugValid) return;
    setIsPublishing(true);
    try {
      // 1. Update Project Slug & Details
      await projectsApi.update(projectId, {
        name: siteName,
        seo: { metaTitle: seoTitle, metaDescription: seoDescription },
      });
      await projectsApi.updateSlug(projectId, slug);

      // 2. Execute Publish Action
      const pubRes = await projectsApi.publish(projectId);
      if (pubRes?.data?.staticUrl) {
        setPublishedUrl(pubRes.data.staticUrl);
      } else {
        setPublishedUrl(`https://nexora.site/${slug}`);
      }
    } catch (err: any) {
      alert(err.message || "Failed to publish website. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
        <p className="text-sm font-medium">Preparing Publish Wizard...</p>
      </div>
    );
  }

  const livePreviewUrl = `https://nexora.site/${slug || "your-slug"}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Top Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/editor/${projectId}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Editor
          </Link>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
            Publishing Wizard
          </span>
        </div>

        {/* ── Wizard Progress Bar ────────────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm mb-6 sm:mb-8 flex items-center">
          {[
            { step: 1, label: "Identity", sub: "URL slug & name" },
            { step: 2, label: "SEO", sub: "Title & description" },
            { step: 3, label: "Launch", sub: "Publish live" },
          ].map((s, i) => (
            <>
              <div key={s.step} className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    currentStep >= s.step ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentStep > s.step ? <Check size={14} /> : s.step}
                </div>
                <div className="min-w-0 hidden xs:block sm:block">
                  <div className="text-xs font-bold text-slate-900 truncate">{s.label}</div>
                  <div className="text-[10px] text-slate-500 truncate hidden sm:block">{s.sub}</div>
                </div>
              </div>
              {i < 2 && <div className="h-px bg-slate-200 flex-1 mx-2 sm:mx-4" />}
            </>
          ))}
        </div>

        {/* ── STEP 1: Site Identity & Custom Slug ───────────────────────────── */}
        {currentStep === 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                Step 1: Website Name & Custom Slug
              </h2>
              <p className="text-xs text-slate-500">
                Choose a clear name and unique web address for your public site.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website Name
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  placeholder="e.g. My Professional Portfolio"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Custom URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => { const g = slugify(siteName); setSlug(g); validateSlug(g); }}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                    title="Auto-generate from site name"
                  >
                    <RefreshCw size={11} /> Auto-generate
                  </button>
                </div>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-indigo-500 focus-within:bg-white transition-all">
                  <span className="px-2 sm:px-3 text-[10px] sm:text-xs text-slate-400 font-mono bg-slate-100 py-3 border-r border-slate-200 select-none whitespace-nowrap">
                    nexora.site/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    className="flex-1 bg-transparent px-3 py-2.5 text-xs text-slate-900 font-mono focus:outline-none min-w-0"
                    placeholder="my-custom-slug"
                  />
                </div>

                {/* Validation Status Indicator */}
                <div className="mt-2 text-xs">
                  {slugError ? (
                    <span className="text-rose-600 font-medium flex items-center gap-1">
                      <AlertCircle size={14} /> {slugError}
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Slug is valid and available!
                    </span>
                  )}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Your Live URL
                </span>
                <div className="font-mono text-xs sm:text-sm text-indigo-700 font-bold break-all">
                  {livePreviewUrl}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                disabled={!isSlugValid}
                onClick={() => setCurrentStep(2)}
                className="px-5 sm:px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-all flex items-center gap-2 shadow-sm"
              >
                Continue to SEO <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: SEO Title & Description ───────────────────────────────── */}
        {currentStep === 2 && (
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                Step 2: SEO Title & Meta Description
              </h2>
              <p className="text-xs text-slate-500">
                Optimize how your website appears on Google Search and social media shares.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Search Engine Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  placeholder="e.g. Alex Morgan — Senior UI Architect & Developer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={4}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"
                  placeholder="Summarize your website in 150-160 characters..."
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
              >
                Continue to Launch <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Domain & Launch Action ───────────────────────────────── */}
        {currentStep === 3 && (
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
                Step 3: Launch Your Website
              </h2>
              <p className="text-xs text-slate-500">
                Review visibility settings and publish to the global CDN network.
              </p>
            </div>

            <div className="space-y-6">
              {/* Live Card Summary */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                    Publish Summary
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Ready to Deploy
                  </span>
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-900">{siteName}</div>
                  <div className="font-mono text-xs text-indigo-600 font-semibold">{livePreviewUrl}</div>
                </div>
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 bg-white">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Eye size={15} className="text-indigo-600" /> Public Access
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Allow search engines and visitors to view your published site.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>

              {/* Custom Domain Feature Teaser */}
              <div className="p-4 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Globe size={15} /> Custom Domain Support (Coming Soon)
                  </div>
                  <div className="text-[11px] text-indigo-700">
                    Connect your own domain name (e.g. www.yourname.com) directly.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                disabled={isPublishing}
                onClick={handlePublishSubmit}
                className="px-8 py-3 rounded-xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md"
              >
                {isPublishing ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}{" "}
                Publish Website Now
              </button>
            </div>
          </div>
        )}

        {/* ── Success Modal ────────────────────────────────────────────────── */}
        {publishedUrl && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl space-y-5 animate-scale-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Your Site is Live!</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Congratulations! Your digital presence has been published to the global edge network.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-mono text-indigo-600 font-bold break-all">
                {publishedUrl}
              </div>

              <div className="flex gap-3">
                <a
                  href={publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  Visit Site Live <ExternalLink size={15} />
                </a>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="py-3 px-5 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
