import { Router } from "express";
import { previewSite, previewSitemap } from "../controllers/previewController.js";

const router = Router();

// Public routes — no auth required
router.get("/:slug", previewSite);
router.get("/:slug/sitemap.xml", previewSitemap);

export default router;
