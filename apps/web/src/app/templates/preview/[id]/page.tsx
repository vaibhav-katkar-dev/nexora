import { TemplatePreviewClient } from "./TemplatePreviewClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface TemplatePreviewData {
  defaultConfig?: any;
  config?: any;
  name?: string;
  category?: string;
  description?: string;
}

async function fetchTemplate(id: string): Promise<TemplatePreviewData | null> {
  try {
    const res = await fetch(`${API_BASE}/templates/${encodeURIComponent(id)}`, {
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

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Inert SEO fallback text for search crawlers */}
      {data?.name && <h1 style={{ display: "none" }}>{data.name}</h1>}
      {data?.description && <p style={{ display: "none" }}>{data.description}</p>}

      <TemplatePreviewClient id={params.id} initialData={data} />
    </main>
  );
}
