import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { Project } from "../models/Project.js";
import { Deployment } from "../models/Deployment.js";
import { buildStaticSite } from "../services/siteCompiler.js";
import { buildPublishedSiteUrl } from "../utils/siteUrl.js";

// POST /api/v1/projects/:id/publish
export const publishProject = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!project) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Project not found" } });
    }

    // Count existing deployments for version increment
    const versionCount = await Deployment.countDocuments({ projectId: project._id });
    const version = versionCount + 1;

    // Build static HTML/CSS bundle
    const { staticUrl, html } = await buildStaticSite(project);

    // Record deployment
    const deployment = await Deployment.create({
      projectId: project._id,
      userId: req.user!.userId,
      version,
      slug: project.slug,
      snapshotConfig: project.config,
      staticUrl,
      deploymentStatus: "success",
      deployedAt: new Date(),
    });

    // Mark project as published and store compiled HTML for serving
    project.status = "published";
    project.publishedAt = new Date();
    project.publishedHtml = html;
    await project.save();

    res.json({
      success: true,
      message: "Project published successfully",
      data: {
        staticUrl,
        version,
        deploymentId: deployment._id,
        publishedAt: project.publishedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "PUBLISH_FAILED", message: error.message } });
  }
};

// GET /api/v1/projects/:id/deployments
export const listDeployments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deployments = await Deployment.find({ projectId: req.params.id, userId: req.user!.userId })
      .sort({ deployedAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: deployments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};
