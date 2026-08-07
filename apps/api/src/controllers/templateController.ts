import { Request, Response } from "express";
import { Template } from "../models/Template.js";
import { presetTemplates, getAllTemplates } from "@ai-platform/templates";

// ─── GET /api/v1/templates — List templates ────────────────────────────────────
export const listTemplates = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const filter: any = { isPublic: true };
    if (category) filter.category = category;

    let templates = await Template.find(filter).sort({ featuredOrder: 1, createdAt: -1 }).lean();

    // Fallback to presets if database has no templates yet
    if (templates.length === 0) {
      const presets = getAllTemplates();
      const mappedPresets = presets.map((p, index) => ({
        _id: `preset_${p.category}`,
        name: p.config.meta.title || p.name,
        category: p.category,
        thumbnailUrl: `/templates/${p.category}.png`,
        defaultConfig: p.config,
        isPublic: true,
        featuredOrder: index + 1,
      }));
      return res.json({ success: true, data: mappedPresets, meta: { total: mappedPresets.length, isPreset: true } });
    }

    res.json({ success: true, data: templates, meta: { total: templates.length } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// ─── GET /api/v1/templates/:id — Get template details ────────────────────────
export const getTemplate = async (req: Request, res: Response) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      // Check if it's a preset category key
      const preset = presetTemplates[req.params.id];
      if (preset) {
        return res.json({
          success: true,
          data: {
            _id: req.params.id,
            name: preset.meta.title,
            category: preset.meta.category,
            defaultConfig: preset,
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

// ─── POST /api/v1/templates/bulk — Add/Import Bulk Templates ────────────────
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
      if (!item.name || !item.category || !item.defaultConfig) {
        continue;
      }

      const doc = await Template.findOneAndUpdate(
        { category: item.category, name: item.name },
        {
          name: item.name,
          category: item.category,
          thumbnailUrl: item.thumbnailUrl || `/templates/${item.category}.png`,
          defaultConfig: item.defaultConfig,
          isPublic: item.isPublic !== undefined ? item.isPublic : true,
          featuredOrder: item.featuredOrder || 0,
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

// ─── POST /api/v1/templates/seed — Seed default 11 preset templates into DB ─
export const seedPresetTemplates = async (_req: Request, res: Response) => {
  try {
    const allPresets = getAllTemplates();
    const inserted: any[] = [];

    for (let i = 0; i < allPresets.length; i++) {
      const p = allPresets[i];
      const doc = await Template.findOneAndUpdate(
        { category: p.category },
        {
          name: p.config.meta.title || `${p.category.toUpperCase()} Template`,
          category: p.category,
          thumbnailUrl: `/templates/${p.category}.png`,
          defaultConfig: p.config,
          isPublic: true,
          featuredOrder: i + 1,
        },
        { upsert: true, new: true }
      );
      inserted.push(doc);
    }

    res.status(200).json({
      success: true,
      message: `Successfully seeded ${inserted.length} templates into database`,
      data: inserted,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SEED_FAILED", message: error.message } });
  }
};
