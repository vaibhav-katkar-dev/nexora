import { Router } from "express";
import {
  listTemplates,
  getTemplate,
  addBulkTemplates,
  seedPresetTemplates,
  adminListTemplates,
  createTemplate,
  updateTemplate,
  updateTemplateStatus,
  deleteTemplate,
  restoreTemplate,
  permanentDeleteTemplate,
bulkImportTemplates,
listDeletedTemplates,
  previewTemplate,
exportAllTemplates,
  bulkDeleteTemplates,
  emptyTrash,
} from "../controllers/templateController.js";
import { authenticateJwt, requireAdmin } from "../middleware/auth.js";

const router = Router();

// ─── PUBLIC ROUTES (read-only, no auth) ─────────────────────────────────────
// GET /api/v1/templates — List public published templates (or filter by ?category=)
router.get("/", listTemplates);

// GET /api/v1/templates/:id — Get specific template (by id or slug)
router.get("/:id", getTemplate);

// ─── ADMIN-ONLY ROUTES (protected by auth + role) ──────────────────────────
router.use(authenticateJwt, requireAdmin);

// GET /api/v1/templates/admin — Admin dashboard list (paginated, search, filter, sort, lightweight)
router.get("/admin/list", adminListTemplates);

// GET /api/v1/templates/admin/trash — soft-deleted templates
router.get("/admin/trash", listDeletedTemplates);

// DELETE /api/v1/templates/admin/trash — permanently delete ALL soft-deleted templates (admin, confirm-only)
router.delete("/admin/trash", emptyTrash);

// GET /api/v1/templates/admin/export — export ALL templates as JSON (admin)
router.get("/admin/export", exportAllTemplates);

// POST /api/v1/templates/admin/bulk-delete — soft-delete MANY templates (admin, safe)
router.post("/admin/bulk-delete", bulkDeleteTemplates);

// POST /api/v1/templates — Create template
router.post("/", createTemplate);

// POST /api/v1/templates/bulk — Upload / Insert bulk templates array (backward compat)
router.post("/bulk", addBulkTemplates);

// POST /api/v1/templates/bulk-import — Import one/many templates with validation report
router.post("/bulk-import", bulkImportTemplates);

// POST /api/v1/templates/seed — Seed preset templates
router.post("/seed", seedPresetTemplates);

// GET /api/v1/templates/:id/preview — get defaultConfig for live preview (read-only)
router.get("/:id/preview", previewTemplate);

// PUT /api/v1/templates/:id — Update template
router.put("/:id", updateTemplate);

// PATCH /api/v1/templates/:id/status — publish/unpublish/archive
router.patch("/:id/status", updateTemplateStatus);

// POST /api/v1/templates/:id/restore — restore soft-deleted template
router.post("/:id/restore", restoreTemplate);

// DELETE /api/v1/templates/:id — soft delete
router.delete("/:id", deleteTemplate);

// DELETE /api/v1/templates/:id/permanent — permanent delete
router.delete("/:id/permanent", permanentDeleteTemplate);

export default router;
