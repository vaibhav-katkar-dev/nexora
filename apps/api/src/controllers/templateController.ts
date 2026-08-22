import { Request, Response } from "express";
import { Template, TemplateStatus } from "../models/Template.js";
import { presetTemplates, getAllTemplates } from "@ai-platform/templates";
import { SiteConfigSchema } from "@ai-platform/shared";
import { z } from "zod";
import mongoose from "mongoose";

// ──────────────────────────────────────────────────────────────────────────
// VALIDATION SCHEMAS (zod) — all input is validated & sanitized server-side
// Never trust frontend permissions or payloads.
// ──────────────────────────────────────────────────────────────────────────
const TemplateStatusEnum = z.enum(["draft", "published", "archived"]);

const TemplateUpsertSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
    .optional(),
  category: z.string().min(1, "Category is required").max(100, "Category too long"),
  description: z.string().max(1000, "Description too long").optional(),
  thumbnailUrl: z.string().max(1000, "Thumbnail URL too long").optional(),
  imageUrl: z.string().max(1000, "Cover URL too long").optional(),
  previewUrl: z.string().max(1000, "Preview URL too long").optional(),
  tags: z.array(z.string().max(50)).max(20, "Too many tags").optional(),
  defaultConfig: SiteConfigSchema,
  version: z.string().max(30, "Version too long").optional(),
  author: z.string().max(100, "Author too long").optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isPremium: z.boolean().optional(),
  status: TemplateStatusEnum.optional(),
  featuredOrder: z.number().int().min(0).optional(),
});

const ListQuerySchema = z.object({
  page: z.preprocess((v) => Number(v || 1), z.number().int().min(1).max(1000)),
  limit: z.preprocess((v) => Number(v || 20), z.number().int().min(1).max(100)),
  search: z.string().max(200).optional(),
  status: TemplateStatusEnum.optional(),
  category: z.string().max(100).optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "name", "category", "status", "featuredOrder", "useCount"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  featured: z.enum(["true", "false"]).optional(),
  premium: z.enum(["true", "false"]).optional(),
});

// Defensive: strip "undefined"/"null"/empty query params so callers that
// accidentally send literal "undefined" strings never trigger 400 errors.
const cleanQuery = (query: any): any => {
  if (!query || typeof query !== "object") return query;
  const clean: any = {};
  for (const key of Object.keys(query)) {
    const value = query[key];
    if (value === undefined || value === null || value === "") continue;
    if (value === "undefined" || value === "null") continue;
    clean[key] = value;
  }
  return clean;
};

const slugify = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "template";

const STATUS_ORDER: Record<TemplateStatus, number> = { published: 0, draft: 1, archived: 2 };

// ──────────────────────────────────────────────────────────────────────────
// HELPER — lightweight projection for list endpoints (no heavy JSON payload)
// Supports 10k+ templates by NOT returning full defaultConfig in listings.
// ──────────────────────────────────────────────────────────────────────────
const LIST_PROJECTION = {
  name: 1,
  slug: 1,
  category: 1,
  description: 1,
  thumbnailUrl: 1,
  imageUrl: 1,
  previewUrl: 1,
  tags: 1,
  version: 1,
  author: 1,
  isPublic: 1,
  isFeatured: 1,
  isPremium: 1,
  status: 1,
  featuredOrder: 1,
  useCount: 1,
  createdAt: 1,
  updatedAt: 1,
};

// Admin list projection — same as LIST_PROJECTION but also includes the
// defaultConfig so the client can render live, non-interactive previews.
// Only used in the paginated admin list (limit ≤ 100) to keep payloads small.
const ADMIN_LIST_PROJECTION = {
  ...LIST_PROJECTION,
  defaultConfig: 1,
};

// ──────────────────────────────────────────────────────────────────────────
// GET /api/v1/templates/admin?page=&limit=&search=&status=&category=&sortBy=&sortOrder=
// Admin list — paginated, searchable, filterable, sortable. Lightweight.
// ──────────────────────────────────────────────────────────────────────────
export const adminListTemplates = async (req: Request, res: Response) => {
  try {
    const parsed = ListQuerySchema.parse(cleanQuery(req.query));
    const { page, limit, search, status, category, sortBy, sortOrder, featured, premium } = parsed;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (featured === "true") filter.isFeatured = true;
    if (premium === "true") filter.isPremium = true;
    // Search across name/description/tags using text index if query present
    if (search) {
      filter.$text = { $search: search };
    }

    const sortDir = sortOrder === "asc" ? 1 : -1;
    const sort: any = { [sortBy]: sortDir, _id: 1 };

    const [templates, total] = await Promise.all([
      Template.find(filter)
        .select(ADMIN_LIST_PROJECTION)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Template.countDocuments(filter),
    ]);

    // For text search, Mongo no longer sorts by relevance once we apply our own sort.
    // We deliberately sort by chosen field for predictable pagination.

    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: templates,
      meta: { page, limit, total, pages },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Invalid query parameters", details: error.errors },
      });
    }
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// GET /api/v1/templates — List templates (existing, backward compatible)
// Reads from DB; falls back to presets if DB empty. Now parses status from draft/archived as well.
// ──────────────────────────────────────────────────────────────────────────
export const listTemplates = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const filter: any = { isPublic: true, status: "published", deletedAt: null };
    if (category && category !== "all") filter.category = category;

    // Public listing includes defaultConfig so the gallery can render live
    // previews from the saved template configuration (read-only, no auth).
    const templates = await Template.find(filter)
      .sort({ featuredOrder: 1, createdAt: -1 })
      .select(ADMIN_LIST_PROJECTION)
      .lean();

    res.json({ success: true, data: templates, meta: { total: templates.length } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// GET /api/v1/templates/:id — Get template details (existing, backward compatible)
// ──────────────────────────────────────────────────────────────────────────
export const getTemplate = async (req: Request, res: Response) => {
  try {
    let template = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      template = await Template.findOne({ _id: req.params.id, deletedAt: null }).lean();
    }
    if (!template) {
      // Fallback: check slug
      template = await Template.findOne({ slug: req.params.id, deletedAt: null }).lean();
    }
    if (!template) {
      const preset = presetTemplates[req.params.id];
      if (preset) {
        return res.json({
          success: true,
          data: {
            _id: req.params.id,
            name: preset.meta.title,
            slug: req.params.id,
            category: preset.meta.category,
            defaultConfig: preset,
            status: "published",
            isPublic: true,
          },
        });
      }
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
    }
    res.json({ success: true, data: template });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// POST /api/v1/templates — Create template (admin)
// ──────────────────────────────────────────────────────────────────────────
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const data = TemplateUpsertSchema.parse(req.body);
    const slug = data.slug || slugify(data.name);

    // Reject duplicate slug among non-deleted templates
    const existing = await Template.findOne({ slug, deletedAt: null });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_SLUG", message: `A template with slug "${slug}" already exists` },
      });
    }

    const doc = await Template.create({
      name: data.name,
      slug,
      category: data.category,
      description: data.description || "",
      thumbnailUrl: data.thumbnailUrl || `/templates/${data.category}.png`,
      imageUrl: data.imageUrl,
      previewUrl: data.previewUrl,
      tags: data.tags || [],
      defaultConfig: data.defaultConfig,
      version: data.version || "1.0.0",
      author: data.author || "Oninsite AI",
      isPublic: data.isPublic ?? true,
      isFeatured: data.isFeatured ?? false,
      isPremium: data.isPremium ?? false,
      status: data.status || "published",
      featuredOrder: data.featuredOrder ?? 0,
      useCount: 0,
      deletedAt: null,
    });

    res.status(201).json({ success: true, message: "Template created", data: doc });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Validation failed", details: error.errors },
      });
    }
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_SLUG", message: "A template with this slug already exists" },
      });
    }
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// PUT /api/v1/templates/:id — Update template (admin). Preserves ID.
// ──────────────────────────────────────────────────────────────────────────
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const data = TemplateUpsertSchema.partial().parse(req.body);

    let template = await Template.findOne({ _id: req.params.id, deletedAt: null });
    if (!template && mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
    }
    if (!template) {
      // try slug
      template = await Template.findOne({ slug: req.params.id, deletedAt: null });
    }
    if (!template) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
    }

    // If changing slug, reject duplicates (excluding self)
    if (data.slug && data.slug !== template.slug) {
      const dup = await Template.findOne({ slug: data.slug, _id: { $ne: template._id }, deletedAt: null });
      if (dup) {
        return res.status(409).json({
          success: false,
          error: { code: "DUPLICATE_SLUG", message: `A template with slug "${data.slug}" already exists` },
        });
      }
    }

    if (data.slug === undefined) {
      // If no slug provided but name changed, keep existing slug to avoid breaking references.
      // Only explicitly-provided slug can change.
    }

    const updated = await Template.findByIdAndUpdate(template._id, { $set: data }, { new: true, runValidators: true });

    res.json({ success: true, message: "Template updated", data: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Validation failed", details: error.errors },
      });
    }
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        error: { code: "DUPLICATE_SLUG", message: "A template with this slug already exists" },
      });
    }
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// PATCH /api/v1/templates/:id/status — publish / unpublish / archive (admin)
// Changing status requires no application deployment.
// ──────────────────────────────────────────────────────────────────────────
export const updateTemplateStatus = async (req: Request, res: Response) => {
  try {
    const { status } = z.object({ status: TemplateStatusEnum }).parse(req.body);

    const updated = await Template.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { status } },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
    }
    res.json({ success: true, message: `Template ${status}`, data: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: "INVALID_STATUS", message: "Invalid status", details: error.errors } });
    }
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/templates/:id — Soft delete (admin). Preferred.
// ──────────────────────────────────────────────────────────────────────────
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const updated = await Template.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { $set: { deletedAt: new Date() } },
      { new: false }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
    }
    res.json({ success: true, message: "Template soft-deleted", data: { _id: updated._id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// POST /api/v1/templates/:id/restore — Restore soft-deleted template (admin)
// ──────────────────────────────────────────────────────────────────────────
export const restoreTemplate = async (req: Request, res: Response) => {
  try {
    const restored = await Template.findOneAndUpdate(
      { _id: req.params.id, deletedAt: { $ne: null } },
      { $set: { deletedAt: null } },
      { new: true }
    );
    if (!restored) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Deleted template not found" } });
    }
    res.json({ success: true, message: "Template restored", data: restored });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/templates/:id/permanent — Permanently delete (admin, confirm-only)
// ──────────────────────────────────────────────────────────────────────────
export const permanentDeleteTemplate = async (req: Request, res: Response) => {
  try {
    const deleted = await Template.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
    }
    res.json({ success: true, message: "Template permanently deleted", data: { _id: deleted._id } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// POST /api/v1/templates/admin/bulk-delete — Soft-delete MANY templates (admin, safe)
// Accepts an array of ids; soft-deletes (sets deletedAt) each non-deleted one.
// Never destroys data — everything stays restorable in Trash. Ignores ids that
// are already deleted or don't exist, so a partial selection never errors.
// ──────────────────────────────────────────────────────────────────────────
export const bulkDeleteTemplates = async (req: Request, res: Response) => {
  try {
    const body = z
      .object({
        ids: z.array(z.string()).min(1, "At least one id is required").max(500, "Too many ids"),
      })
      .parse(req.body);

    const validIds = body.ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "No valid template ids provided" },
      });
    }

    const result = await Template.updateMany(
      { _id: { $in: validIds }, deletedAt: null },
      { $set: { deletedAt: new Date() } }
    );

    res.json({
      success: true,
      message: `Soft-deleted ${result.modifiedCount} template(s)`,
      data: { deleted: result.modifiedCount, matched: result.matchedCount },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Invalid request body", details: error.errors },
      });
    }
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// POST /api/v1/templates/bulk-import — Import one or many templates (admin)
// Validates each item; skips duplicates safely; continues on partial failure.
// Ever imported item is wrapped so a failure does not corrupt the DB.
// ──────────────────────────────────────────────────────────────────────────
export const bulkImportTemplates = async (req: Request, res: Response) => {
  try {
    const { templates } = z
      .object({
        templates: z.array(z.unknown()).max(100, "Maximum 100 templates per import"),
      })
      .parse(req.body);

    if (!Array.isArray(templates) || templates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Request body must contain a non-empty 'templates' array" },
      });
    }

    const imported: any[] = [];
    const failed: Array<{ index: number; name?: string; error: string }> = [];
    const duplicates: Array<{ index: number; name?: string; slug?: string; error: string }> = [];

    for (let i = 0; i < templates.length; i++) {
      const item = templates[i] as any;
      try {
        const parsed = TemplateUpsertSchema.parse(item);
        const slug = parsed.slug || slugify(parsed.name);

        // Duplicate check (non-deleted)
        const existing = await Template.findOne({ slug, deletedAt: null });
        if (existing) {
          duplicates.push({
            index: i,
            name: parsed.name,
            slug,
            error: `Slug "${slug}" already exists`,
          });
          continue;
        }

        const doc = await Template.create({
          name: parsed.name,
          slug,
          category: parsed.category,
          description: parsed.description || "",
          thumbnailUrl: parsed.thumbnailUrl || `/templates/${parsed.category}.png`,
          imageUrl: parsed.imageUrl,
          previewUrl: parsed.previewUrl,
          tags: parsed.tags || [],
          defaultConfig: parsed.defaultConfig,
          version: parsed.version || "1.0.0",
          author: parsed.author || "Oninsite AI",
          isPublic: parsed.isPublic ?? true,
          isFeatured: parsed.isFeatured ?? false,
          isPremium: parsed.isPremium ?? false,
          status: parsed.status || "published",
          featuredOrder: parsed.featuredOrder ?? 0,
          useCount: 0,
          deletedAt: null,
        });
        imported.push(doc);
      } catch (err: any) {
        let message = err?.message || "Validation failed";
        if (err instanceof z.ZodError) {
          message = err.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        }
        if (err?.code === 11000) {
          const slug = err?.keyValue?.slug || "";
          duplicates.push({ index: i, name: item?.name, slug, error: `Duplicate slug "${slug}"` });
          continue;
        }
        failed.push({ index: i, name: item?.name, error: message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${imported.length}, skipped ${duplicates.length} duplicates, ${failed.length} failed`,
      data: { imported, failed, duplicates },
      meta: { importedCount: imported.length, failedCount: failed.length, duplicateCount: duplicates.length },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Invalid request body", details: error.errors },
      });
    }
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// POST /api/v1/templates/bulk — Add/import bulk templates (existing, keep compat)
// ──────────────────────────────────────────────────────────────────────────
export const addBulkTemplates = async (req: Request, res: Response) => {
  try {
    const { templates } = req.body;
    if (!Array.isArray(templates) || templates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Request body must contain a non-empty 'templates' array" },
      });
    }

    const inserted: any[] = [];
    for (const item of templates) {
      if (!item.name || !item.category || !item.defaultConfig) continue;
      const slug = item.slug || slugify(item.name);
      const doc = await Template.findOneAndUpdate(
        { slug, deletedAt: null },
        {
          $set: {
            name: item.name,
            slug,
            category: item.category,
            description: item.description || "",
            thumbnailUrl: item.thumbnailUrl || `/templates/${item.category}.png`,
            imageUrl: item.imageUrl,
            previewUrl: item.previewUrl,
            tags: item.tags || [],
            defaultConfig: item.defaultConfig,
            version: item.version || "1.0.0",
            author: item.author || "Oninsite AI",
            isPublic: item.isPublic !== undefined ? item.isPublic : true,
            isFeatured: item.isFeatured || false,
            isPremium: item.isPremium || false,
            status: item.status || "published",
            featuredOrder: item.featuredOrder || 0,
          },
        },
        { upsert: true, new: true }
      );
      inserted.push(doc);
    }

    res.status(201).json({
      success: true,
      message: `Successfully processed ${inserted.length} templates`,
      data: inserted,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "BULK_FAILED", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// POST /api/v1/templates/seed — Seed default 11 preset templates into DB (admin, existing)
// ──────────────────────────────────────────────────────────────────────────
export const seedPresetTemplates = async (_req: Request, res: Response) => {
  try {
    const allPresets = getAllTemplates();
    const inserted: any[] = [];
    const skipped: any[] = [];

    for (let i = 0; i < allPresets.length; i++) {
      const p = allPresets[i];
      const slug = p.slug || slugify(p.name);
      const existing = await Template.findOne({ slug, deletedAt: null });
      if (existing) {
        skipped.push({ slug, name: p.name, reason: "Already exists" });
        continue;
      }
      const doc = await Template.create({
        name: p.config.meta.title || `${p.category.toUpperCase()} Template`,
        slug,
        category: p.category,
        description: p.config.meta.description || "",
        thumbnailUrl: `/templates/${p.category}.png`,
        tags: p.config.meta.tags || [],
        defaultConfig: p.config,
        version: p.config.meta.version || "1.0.0",
        author: p.config.meta.author || "Oninsite AI",
        isPublic: true,
        status: "published",
        featuredOrder: i + 1,
        useCount: 0,
        deletedAt: null,
      });
      inserted.push(doc);
    }

    res.status(200).json({
      success: true,
      message: `Seeded ${inserted.length} templates (${skipped.length} skipped as duplicates)`,
      data: inserted,
      meta: { seeded: inserted.length, skipped: skipped.length },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SEED_FAILED", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// GET /api/v1/templates/admin/trash — list soft-deleted templates (admin)
// ──────────────────────────────────────────────────────────────────────────
export const listDeletedTemplates = async (_req: Request, res: Response) => {
  try {
    const deleted = await Template.find({ deletedAt: { $ne: null } })
      .select(LIST_PROJECTION)
      .sort({ deletedAt: -1 })
      .lean();
    res.json({ success: true, data: deleted, meta: { total: deleted.length } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/templates/admin/trash — PERMANENTLY delete ALL soft-deleted
// templates at once (admin, confirm-only). This CANNOT be undone.
// Returns the number of permanently removed documents.
// ──────────────────────────────────────────────────────────────────────────
export const emptyTrash = async (_req: Request, res: Response) => {
  try {
    const result = await Template.deleteMany({ deletedAt: { $ne: null } });

    res.json({
      success: true,
      message: `Permanently deleted ${result.deletedCount} template(s) from trash`,
      data: { deleted: result.deletedCount },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// GET /api/v1/templates/:id/preview — Get template defaultConfig for live preview (admin)
// Safe: read-only, no DB modification. Preview is rendered client-side with temp state.
// ──────────────────────────────────────────────────────────────────────────
export const previewTemplate = async (req: Request, res: Response) => {
  try {
    let template: any = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      template = await Template.findOne({ _id: req.params.id }).lean();
    }
    if (!template) template = await Template.findOne({ slug: req.params.id }).lean();

    if (!template) {
      const preset = presetTemplates[req.params.id];
      if (preset) {
        return res.json({ success: true, data: { _id: req.params.id, defaultConfig: preset, name: preset.meta.title } });
      }
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Template not found" } });
    }

    // Return only what's needed to render (defaultConfig + metadata for title bar)
    res.json({
      success: true,
      data: {
        _id: template._id,
        name: template.name,
        category: template.category,
        status: template.status,
        defaultConfig: template.defaultConfig,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ──────────────────────────────────────────────────────────────────────────
// GET /api/v1/templates/admin/export — Export ALL templates (admin, read-only)
// Returns the full template documents (including defaultConfig) as a JSON array
// so admins can download a complete backup / shareable .json file.
// ──────────────────────────────────────────────────────────────────────────
export const exportAllTemplates = async (_req: Request, res: Response) => {
  try {
    const templates = await Template.find({})
      .sort({ featuredOrder: 1, createdAt: -1 })
      .lean();

    const payload = templates.map((t) => ({
      _id: t._id,
      name: t.name,
      slug: t.slug,
      category: t.category,
      description: t.description || "",
      thumbnailUrl: t.thumbnailUrl,
      imageUrl: t.imageUrl,
      previewUrl: t.previewUrl,
      tags: t.tags || [],
      defaultConfig: t.defaultConfig,
      version: t.version || "1.0.0",
      author: t.author || "Oninsite AI",
      isPublic: t.isPublic,
      isFeatured: t.isFeatured || false,
      isPremium: t.isPremium || false,
      status: t.status,
      featuredOrder: t.featuredOrder || 0,
      useCount: t.useCount || 0,
      deletedAt: t.deletedAt || null,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    res.json({
      success: true,
      message: `Exported ${payload.length} templates`,
      data: payload,
      meta: { total: payload.length },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

export { STATUS_ORDER };

