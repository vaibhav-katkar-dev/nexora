import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/renderer/SiteRenderer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

/**
 * Server component that fetches the template config at request time so the
 * rendered HTML (title + full page content) is crawlable / indexable by
 * search engines like Google. The interactive preview then renders client-side
 * via <SiteRenderer>.
 */

interface TemplatePreviewData {
  defaultConfig?: any;
  config?: any;
  name?: string;
  category?: string;
  description?: string;
}

async function fetchTemplate(id: string): Promise<TemplatePreviewData | null> {
  try {
    // Use the PUBLIC getTemplate endpoint (no auth) so this page is crawlable
    // and indexable by search engines. It returns { data: { defaultConfig, ... } }.
    const res = await fetch(`${API_BASE}/templates/${encodeURIComponent(id)}`, {
      // Revalidate on a short interval so fresh admin edits show up, while
      // still allowing the route to be cached & indexed by crawlers.
      next: { revalidate: 60 },
      cache: "force-cache",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data as TemplatePreviewData | undefined;
    if (!data) return null;
    const cfg = data.defaultConfig || data.config;
    if (!cfg) return null;
    return {
      defaultConfig: cfg,
      name: data.name || cfg.meta?.title || "Template Preview",
      category: data.category || cfg.meta?.category || "portfolio",
      description: data.description || cfg.meta?.description || "",
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const data = await fetchTemplate(params.id);
  const title = data?.name || "Template Preview";
  const description = data?.description || "Live preview of a Nexora template.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function TemplatePreviewPage({ params }: { params: { id: string } }) {
  const data = await fetchTemplate(params.id);

  if (!data?.defaultConfig) {
    notFound();
    return null;
  }

  return (
    <main className="min-h-screen">
      {/* Inert SEO fallback text (hidden visually) — reinforces indexable content */}
      <h1 style={{ display: "none" }}>{data.name}</h1>
      <p style={{ display: "none" }}>{data.description}</p>

      <SiteRenderer config={data.defaultConfig} />
    </main>
  );
}
