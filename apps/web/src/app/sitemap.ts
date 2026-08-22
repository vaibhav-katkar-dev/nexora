import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://Oninsite.site";

  // Static marketing pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Fetch indexable published user sites from backend API
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    // Strip trailing /api/v1 to reach backend root sitemap endpoint
    const backendBase = apiUrl.replace(/\/api\/v1\/?$/, "");
    const res = await fetch(`${backendBase}/sitemap-entries`, { next: { revalidate: 3600 } });
    
    if (res.ok) {
      const payload = await res.json();
      if (Array.isArray(payload?.data)) {
        const dynamicEntries: MetadataRoute.Sitemap = payload.data.map((item: any) => ({
          url: item.url,
          lastModified: new Date(item.lastModified),
          changeFrequency: "weekly",
          priority: 0.8,
        }));
        return [...staticPages, ...dynamicEntries];
      }
    }
  } catch (err) {
    console.error("Failed to fetch user sites for Next.js sitemap:", err);
  }

  return staticPages;
}
