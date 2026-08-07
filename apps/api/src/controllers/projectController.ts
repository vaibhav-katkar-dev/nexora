import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { Project } from "../models/Project.js";
import { SiteConfigSchema } from "@ai-platform/shared";
import { z } from "zod";
import { randomUUID } from "crypto";

// Helper function to generate short ID
const generateShortId = (): string => {
  return randomUUID().replace(/-/g, '').substring(0, 6);
};

const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string(),
  config: SiteConfigSchema,
});

const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: SiteConfigSchema.optional(),
  customCode: z
    .object({
      html: z.string().optional(),
      css: z.string().optional(),
      js: z.string().optional(),
    })
    .optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      ogImage: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

// GET /api/v1/projects — list user projects with pagination
export const listProjects = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const filter: any = { userId: req.user!.userId };
    if (status) filter.status = status;

    const [projects, total] = await Promise.all([
      Project.find(filter)
        .select("-config -customCode") // lightweight list — no heavy payload
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Project.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: projects,
      meta: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// GET /api/v1/projects/public/:slug — public view of project by slug
export const getPublicProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug }).lean();
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Site not found" },
      });
    }
    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// GET /api/v1/projects/:id — full project with config
export const getProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found" },
      });
    }
    res.json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// POST /api/v1/projects — create project
export const createProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, config } = CreateProjectSchema.parse(req.body);

    // Generate unique slug: name-randomID
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${generateShortId()}`;

    const project = await Project.create({
      userId: req.user!.userId,
      name,
      slug,
      category,
      config,
      seo: {
        metaTitle: config.meta?.title || name,
        metaDescription: config.meta?.description || "",
      },
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Validation failed", details: error.errors },
      });
    }
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// PUT /api/v1/projects/:id — update (auto-save target)
export const updateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = UpdateProjectSchema.parse(req.body);
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found" },
      });
    }
    res.json({ success: true, message: "Project saved", data: project });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: `Validation failed: ${details}`, details: error.errors },
      });
    }
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// POST /api/v1/projects/:id/duplicate — deep clone project
export const duplicateProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const source = await Project.findOne({ _id: req.params.id, userId: req.user!.userId }).lean();
    if (!source) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Project not found" } });
    }

    const newName = `${source.name} (Copy)`;
    const baseSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${generateShortId()}`;

    const { _id, createdAt, updatedAt, publishedAt, ...rest } = source as any;

    const duplicate = await Project.create({
      ...rest,
      name: newName,
      slug,
      status: "draft",
      publishedAt: undefined,
    });

    res.status(201).json({ success: true, message: "Project duplicated", data: duplicate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// DELETE /api/v1/projects/:id — soft-delete (status → deleted) or hard delete
export const deleteProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!project) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Project not found" } });
    }
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};
