import { Request, Response } from "express";
import { Project } from "../models/Project.js";
import { Domain } from "../models/Domain.js";
import { evaluateProjectQuality } from "../services/qualityChecker.js";

const PAGE_SIZE = 1000;

/**
 * GET /sitemap-entries — Returns JSON list of indexable site entries for Next.js sitemap integration
 */
export const getSitemapEntriesJson = async (req: Request, res: Response) => {
  try {
    const hostBase = process.env.CLIENT_URL || "https://Oninsite.site";

    const projects = await Project.find({
      status: "published",
      "seo.noIndex": { $ne: true },
    })
      .select("_id slug config publishedAt updatedAt qualityStatus customCode")
      .sort({ updatedAt: -1 })
      .limit(PAGE_SIZE)
      .lean();

    const siteIds = projects.map((p) => p._id);
    const primaryDomains = await Domain.find({
      siteId: { $in: siteIds },
      isPrimary: true,
    }).lean();

    const domainMap = new Map<string, string>();
    for (const d of primaryDomains) {
      domainMap.set(d.siteId.toString(), d.normalizedDomain);
    }

    const entries: Array<{ url: string; lastModified: string }> = [];

    for (const proj of projects) {
      const quality = evaluateProjectQuality(proj as any);
      if (quality.status !== "legitimate") continue;

      const primaryCustomDomain = domainMap.get(proj._id.toString());
      const url = primaryCustomDomain
        ? `https://${primaryCustomDomain}/`
        : `${hostBase.replace(/\/$/, "")}/${proj.slug}`;

      entries.push({
        url,
        lastModified: (proj.publishedAt || proj.updatedAt || new Date()).toISOString(),
      });
    }

    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=14400");
    res.json({ success: true, data: entries });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

/**
 * GET /sitemap.xml — Dynamic XML sitemap index or single sitemap file
 */
export const getSitemapXml = async (req: Request, res: Response) => {
  try {
    const hostBase = process.env.CLIENT_URL || "https://Oninsite.site";

    // Query indexable candidate sites
    const filter = {
      status: "published",
      "seo.noIndex": { $ne: true },
    };

    const totalCount = await Project.countDocuments(filter);

    // If total count is under PAGE_SIZE, return a clean single sitemap.xml
    if (totalCount <= PAGE_SIZE) {
      const xml = await buildSitemapPageXml(1, hostBase);
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=14400");
      return res.send(xml);
    }

    // If over PAGE_SIZE, return a sitemap index file pointing to sharded sitemaps
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
    let indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    indexXml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (let p = 1; p <= totalPages; p++) {
      indexXml += `  <sitemap>\n`;
      indexXml += `    <loc>${hostBase.replace(/\/$/, "")}/sitemaps/${p}.xml</loc>\n`;
      indexXml += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      indexXml += `  </sitemap>\n`;
    }

    indexXml += `</sitemapindex>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=14400");
    res.send(indexXml);
  } catch (error: any) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
};

/**
 * GET /sitemaps/:page.xml — Paginated sharded sitemap XML
 */
export const getSitemapPageXml = async (req: Request, res: Response) => {
  try {
    const pageNum = parseInt(req.params.page, 10) || 1;
    const hostBase = process.env.CLIENT_URL || "https://Oninsite.site";
    const xml = await buildSitemapPageXml(pageNum, hostBase);

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=14400");
    res.send(xml);
  } catch (error: any) {
    console.error("Error generating sitemap page:", error);
    res.status(500).send("Error generating sitemap page");
  }
};

/**
 * GET /robots.txt — Dynamic robots.txt
 */
export const getRobotsTxt = (req: Request, res: Response) => {
  const hostBase = process.env.CLIENT_URL || "https://Oninsite.site";
  const content = [
    "# Oninsite Robots Directive",
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /dashboard/",
    "Disallow: /editor/",
    "Disallow: /settings/",
    "Disallow: /api/",
    "",
    `Sitemap: ${hostBase.replace(/\/$/, "")}/sitemap.xml`,
  ].join("\n");

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(content);
};

/**
 * Helper to build XML for a specific sitemap page (batch size = 1,000)
 */
async function buildSitemapPageXml(page: number, hostBase: string): Promise<string> {
  const skip = (page - 1) * PAGE_SIZE;

  const projects = await Project.find({
    status: "published",
    "seo.noIndex": { $ne: true },
  })
    .select("_id slug config publishedAt updatedAt qualityStatus customCode")
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(PAGE_SIZE)
    .lean();

  if (projects.length === 0) {
    let emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    emptyXml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
    return emptyXml;
  }

  // Fetch all primary/active custom domains for these project IDs
  const siteIds = projects.map((p) => p._id);
  const primaryDomains = await Domain.find({
    siteId: { $in: siteIds },
    isPrimary: true,
  }).lean();

  const domainMap = new Map<string, string>();
  for (const d of primaryDomains) {
    domainMap.set(d.siteId.toString(), d.normalizedDomain);
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const proj of projects) {
    // Quality check validation
    const quality = evaluateProjectQuality(proj as any);
    if (quality.status !== "legitimate") {
      continue; // Exclude thin or abusive sites from sitemap
    }

    const primaryCustomDomain = domainMap.get(proj._id.toString());
    const loc = primaryCustomDomain
      ? `https://${primaryCustomDomain}/`
      : `${hostBase.replace(/\/$/, "")}/${proj.slug}`;

    const lastmod = (proj.publishedAt || proj.updatedAt || new Date()).toISOString();

    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
