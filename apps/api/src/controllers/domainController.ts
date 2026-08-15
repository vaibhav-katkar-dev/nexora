import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { Domain } from "../models/Domain.js";
import { Project } from "../models/Project.js";
import {
  normalizeDomain,
  isValidDomain,
  isReservedDomain,
} from "../utils/domainUtils.js";
import {
  addDomainToVercel,
  verifyDomainOnVercel,
  removeDomainFromVercel,
  DEFAULT_DNS_RECORDS,
} from "../services/vercelDomainService.js";
import { z } from "zod";

const AddDomainSchema = z.object({
  domain: z.string().min(3).max(253),
  siteId: z.string().min(1),
});

// POST /api/v1/domains — Add custom domain to site
export const addDomain = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { domain: rawDomain, siteId } = AddDomainSchema.parse(req.body);
    const userId = req.user!.userId;

    // Verify site ownership
    const project = await Project.findOne({ _id: siteId, userId }).select("_id name slug");
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: "SITE_NOT_FOUND", message: "Site not found or access denied" },
      });
    }

    const normalized = normalizeDomain(rawDomain);

    if (!isValidDomain(normalized)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_DOMAIN",
          message: "Please enter a valid domain name (e.g. www.cafemumbai.com)",
        },
      });
    }

    if (isReservedDomain(normalized)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "RESERVED_DOMAIN",
          message: "This domain is reserved by the platform and cannot be connected.",
        },
      });
    }

    // Check if domain is already registered to ANY site
    const existing = await Domain.findOne({ normalizedDomain: normalized });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: "DOMAIN_TAKEN",
          message: `The domain "${normalized}" is already connected to another site.`,
        },
      });
    }

    // Call Vercel API to attach domain
    const vercelResult = await addDomainToVercel(normalized);

    // If first domain connected for this site, set as primary by default
    const existingCount = await Domain.countDocuments({ siteId: project._id });
    const isPrimary = existingCount === 0;

    const newDomain = await Domain.create({
      domain: rawDomain.trim(),
      normalizedDomain: normalized,
      siteId: project._id,
      userId,
      status: vercelResult.verified ? "active" : "pending",
      verificationStatus: vercelResult.verificationStatus,
      isPrimary,
      vercelDomainId: vercelResult.domainId || "",
      dnsRecords: vercelResult.dnsRecords.length > 0 ? vercelResult.dnsRecords : DEFAULT_DNS_RECORDS,
      verifiedAt: vercelResult.verified ? new Date() : undefined,
    });

    res.status(201).json({
      success: true,
      message: "Domain added successfully. Please configure your DNS settings.",
      data: newDomain,
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

// GET /api/v1/domains — List user domains (optionally filter by ?siteId=...)
export const listDomains = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const siteId = req.query.siteId as string | undefined;

    const filter: any = { userId };
    if (siteId) filter.siteId = siteId;

    const domains = await Domain.find(filter).sort({ createdAt: -1 }).lean();

    res.json({ success: true, data: domains });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// GET /api/v1/domains/:id — Get domain detail
export const getDomain = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const domain = await Domain.findOne({ _id: req.params.id, userId: req.user!.userId }).lean();
    if (!domain) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Domain not found" } });
    }
    res.json({ success: true, data: domain });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// POST /api/v1/domains/:id/verify — Trigger Vercel verification
export const verifyDomain = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const domainDoc = await Domain.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!domainDoc) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Domain not found" } });
    }

    const result = await verifyDomainOnVercel(domainDoc.normalizedDomain);

    if (result.verified) {
      domainDoc.status = "active";
      domainDoc.verificationStatus = "verified";
      domainDoc.verifiedAt = new Date();
    } else {
      domainDoc.status = "pending";
      domainDoc.verificationStatus = result.verificationStatus || "pending_dns";
    }

    await domainDoc.save();

    res.json({
      success: true,
      message: result.verified ? "Domain verified and active!" : result.error || "DNS records not detected yet.",
      data: domainDoc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// POST /api/v1/domains/:id/primary — Set primary domain for site
export const setPrimaryDomain = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const domainDoc = await Domain.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!domainDoc) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Domain not found" } });
    }

    // Unset primary for all domains on this site
    await Domain.updateMany({ siteId: domainDoc.siteId }, { $set: { isPrimary: false } });

    domainDoc.isPrimary = true;
    await domainDoc.save();

    res.json({
      success: true,
      message: `${domainDoc.normalizedDomain} is now the primary domain.`,
      data: domainDoc,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};

// DELETE /api/v1/domains/:id — Remove custom domain
export const deleteDomain = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const domainDoc = await Domain.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!domainDoc) {
      return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Domain not found" } });
    }

    await removeDomainFromVercel(domainDoc.normalizedDomain);
    await Domain.deleteOne({ _id: domainDoc._id });

    // If deleted domain was primary, promote another domain if exists
    if (domainDoc.isPrimary) {
      const another = await Domain.findOne({ siteId: domainDoc.siteId }).sort({ createdAt: 1 });
      if (another) {
        another.isPrimary = true;
        await another.save();
      }
    }

    res.json({ success: true, message: "Domain removed successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: "SERVER_ERROR", message: error.message } });
  }
};
