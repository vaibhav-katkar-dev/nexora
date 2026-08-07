import { Router } from "express";
import {
  listTemplates,
  getTemplate,
  addBulkTemplates,
  seedPresetTemplates,
} from "../controllers/templateController.js";
import { authenticateJwt, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/v1/templates — List all templates (or filter by ?category=)
router.get("/", listTemplates);

// GET /api/v1/templates/:id — Get specific template
router.get("/:id", getTemplate);

// POST /api/v1/templates/bulk — Upload / Insert bulk templates array (ADMIN ONLY)
router.post("/bulk", authenticateJwt, requireAdmin, addBulkTemplates);

// POST /api/v1/templates/seed — Seed 11 preset templates (ADMIN ONLY)
router.post("/seed", authenticateJwt, requireAdmin, seedPresetTemplates);

export default router;
