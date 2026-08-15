import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nexora.site";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/dashboard/",
        "/editor/",
        "/settings/",
        "/api/",
        "/publish/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
