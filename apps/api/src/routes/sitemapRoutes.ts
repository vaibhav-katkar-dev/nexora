import { Router } from "express";
import {
  getSitemapXml,
  getSitemapPageXml,
  getSitemapEntriesJson,
  getRobotsTxt,
} from "../controllers/sitemapController.js";

const router = Router();

// Public routes for sitemap and robots.txt
router.get("/sitemap.xml", getSitemapXml);
router.get("/sitemaps/:page.xml", getSitemapPageXml);
router.get("/sitemap-entries", getSitemapEntriesJson);
router.get("/robots.txt", getRobotsTxt);

export default router;
