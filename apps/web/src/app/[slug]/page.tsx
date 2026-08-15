"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { projectsApi } from "@/lib/api";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";
import { injectSeoHeadTags } from "@/lib/seoGenerator";
import { Loader2, ArrowLeft } from "lucide-react";

const RESERVED_SLUGS = ["dashboard", "login", "register", "editor", "api", "admin", "favicon.ico"];

export default function PublicSitePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || RESERVED_SLUGS.includes(slug.toLowerCase())) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    projectsApi
      .getPublic(slug)
      .then((res) => {
        if (res?.data) {
          if (
            res.data.redirectTo &&
            typeof window !== "undefined" &&
            window.location.hostname !== new URL(res.data.redirectTo).hostname
          ) {
            window.location.replace(res.data.redirectTo);
            return;
          }
          setProject(res.data);
          injectSeoHeadTags({
            config: res.data.config,
            seo: res.data.seo,
            slug: slug,
            projectName: res.data.name,
            robots: res.data.robots,
            canonicalUrl: res.data.seo?.canonicalUrl,
          });
        } else {
          setError("Site not found");
        }
      })
      .catch((err) => {
        setError(err.message || "This page could not be found.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-sm font-medium">Loading digital presence…</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ background: "var(--bg)", minHeight: "100vh" }} className="flex items-center justify-center p-6">
        <div className="card max-w-md w-full text-center p-8 space-y-6" style={{ borderRadius: "24px" }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold" style={{ background: "var(--brand-subtle)", color: "var(--brand)" }}>
            404
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Page Not Found</h1>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {error || `The requested site "${slug}" does not exist or has not been published yet.`}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link href="/dashboard" className="btn btn-primary btn-lg gap-2">
              <ArrowLeft className="w-4 h-4" /> Go to Studio Dashboard
            </Link>
            <Link href="/" className="btn btn-ghost text-xs" style={{ color: "var(--text-secondary)" }}>
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <SiteRenderer config={project.config} customCode={project.customCode} />
    </main>
  );
}
