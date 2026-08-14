import { Request, Response } from "express";
import { Project } from "../models/Project.js";
import { buildStaticSite } from "../services/siteCompiler.js";

// GET /api/v1/preview/:slug
// Public endpoint — serves the compiled static HTML of a published site
export const previewSite = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const project = await Project.findOne({ slug });
    if (!project) {
      return res.status(404).send(`
        <!DOCTYPE html><html><head><title>Not Found</title></head>
        <body style="font-family:sans-serif;background:#090D16;color:#94a3b8;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
          <div style="text-align:center">
            <h1 style="font-size:4rem;color:#6366f1;margin:0">404</h1>
            <p style="font-size:1.2rem;margin-top:1rem">Site not found: <code>${slug}</code></p>
            <a href="http://localhost:3000" style="display:inline-block;margin-top:1.5rem;padding:0.75rem 2rem;background:#6366f1;color:#fff;border-radius:10px;text-decoration:none">← Back to Platform</a>
          </div>
        </body></html>
      `);
    }

    if (project.status !== "published") {
      return res.status(403).send(`
        <!DOCTYPE html><html><head><title>Not Published</title></head>
        <body style="font-family:sans-serif;background:#090D16;color:#94a3b8;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0">
          <div style="text-align:center">
            <h1 style="font-size:3rem;color:#f59e0b;margin:0">🚧</h1>
            <p style="font-size:1.2rem;margin-top:1rem">This site hasn't been published yet.</p>
            <a href="http://localhost:3000" style="display:inline-block;margin-top:1.5rem;padding:0.75rem 2rem;background:#6366f1;color:#fff;border-radius:10px;text-decoration:none">← Back to Platform</a>
          </div>
        </body></html>
      `);
    }

    // Always compile fresh HTML from project.config using latest siteCompiler
    const { html } = await buildStaticSite(project);

    // Persist latest compiled HTML to project document
    if (project.publishedHtml !== html) {
      project.publishedHtml = html;
      await project.save();
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.send(html);
  } catch (error: any) {
    res.status(500).send(`
      <!DOCTYPE html><html><head><title>Error</title></head>
      <body style="font-family:sans-serif;background:#090D16;color:#ef4444;padding:2rem">
        <h1>Server Error</h1><p>${error.message}</p>
      </body></html>
    `);
  }
};

// GET /api/v1/preview/:slug/sitemap.xml
export const previewSitemap = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { buildSitemap } = await import("../services/siteCompiler.js");
    const xml = buildSitemap(slug);
    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
