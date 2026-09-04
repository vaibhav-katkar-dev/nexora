import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://okinsite.com";
  const cleanBase = baseUrl.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/editor/",
          "/settings/",
          "/api/",
        ],
      },
    ],
    sitemap: `${cleanBase}/sitemap.xml`,
  };
}
