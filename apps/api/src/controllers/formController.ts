import { Request, Response } from "express";
import crypto from "crypto";
import { Types } from "mongoose";
import { Project } from "../models/Project.js";
import { FormResponse } from "../models/FormResponse.js";
import { SiteAnalyticsDaily } from "../models/SiteAnalytics.js";
import { Domain } from "../models/Domain.js";

// Hash IP address with daily salt for privacy-friendly spam/abuse detection
function getIpHash(ip: string | undefined): string {
  if (!ip) return "";
  const dateSalt = new Date().toISOString().slice(0, 10);
  return crypto.createHash("sha256").update(`${ip}-${dateSalt}-Oninsite-salt`).digest("hex").slice(0, 16);
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Public Form Submission handler
 * POST /api/v1/forms/submit/:slugOrId
 */
export async function submitForm(req: Request, res: Response) {
  try {
    const { slugOrId } = req.params;
    const { name, email, phone, message, customData, formId, referrer, honeypot, utm } = req.body;

    // Honeypot spam check - bots fill hidden inputs
    if (honeypot) {
      return res.status(200).json({
        success: true,
        message: "Message received successfully",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Name is required." },
      });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "A valid email is required." },
      });
    }

    const cleanSlugOrId = (slugOrId || "").trim();

    // Find the project by slug, ID, or custom domain
    let project: any = null;
    if (cleanSlugOrId.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(cleanSlugOrId).lean();
    } else {
      project = await Project.findOne({ slug: cleanSlugOrId.toLowerCase() }).lean();
    }

    if (!project) {
      const domainDoc = await Domain.findOne({
        domain: cleanSlugOrId.toLowerCase(),
        status: "active",
      }).lean();

      if (domainDoc?.siteId) {
        project = await Project.findById(domainDoc.siteId).lean();
      }
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: "PROJECT_NOT_FOUND", message: "Site not found." },
      });
    }

    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const ipHash = getIpHash(ip);

    // Save form response to DB
    const formResponse = await FormResponse.create({
      projectId: project._id,
      projectSlug: project.slug,
      projectName: project.name,
      userId: project.userId,
      formId: formId || "default",
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",
      message: message ? message.trim() : "",
      customData: customData || {},
      utm: utm || {},
      ipHash,
      userAgent: userAgent.slice(0, 200),
      referrer: (referrer || req.headers.referer || "").slice(0, 300),
    });

    // Record submission into daily analytics
    const today = getTodayString();
    try {
      await SiteAnalyticsDaily.findOneAndUpdate(
        { projectId: project._id, date: today },
        {
          $setOnInsert: {
            projectSlug: project.slug,
            userId: project.userId,
          },
          $inc: { formSubmissions: 1 },
        },
        { upsert: true, new: true }
      );
    } catch (analyticsErr) {
      console.warn("[Analytics daily update non-fatal error]", analyticsErr);
    }

    // Check project config for custom form/WhatsApp settings
    const contactSection = project.config?.sections?.find(
      (s: any) => s.type === "contact" || s.id === formId || s.content?.formConfig
    );
    const whatsappSection = project.config?.sections?.find((s: any) => s.type === "whatsapp");
    const formConfig = contactSection?.content?.formConfig || {};

    let whatsappUrl: string | null = null;
    const targetWaNumber =
      formConfig.whatsappNumber ||
      contactSection?.content?.whatsapp ||
      contactSection?.content?.publicWhatsapp ||
      whatsappSection?.content?.phone ||
      contactSection?.content?.phone ||
      "";

    if (
      targetWaNumber &&
      (formConfig.destination === "whatsapp" || formConfig.destination === "both" || !formConfig.destination)
    ) {
      const cleanNumber = targetWaNumber.replace(/[^0-9]/g, "");
      if (cleanNumber) {
        let text = `*New Inquiry from ${project.name}*\n\n`;
        text += `👤 *Name:* ${name.trim()}\n`;
        text += `📧 *Email:* ${email.trim()}\n`;
        if (phone && phone.trim()) text += `📞 *Phone:* ${phone.trim()}\n`;
        if (message && message.trim()) text += `💬 *Message:*\n${message.trim()}\n`;
        if (customData && Object.keys(customData).length > 0) {
          text += `\n*Details:*\n`;
          for (const [k, v] of Object.entries(customData)) {
            text += `• ${k}: ${v}\n`;
          }
        }
        whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
      }
    }

    const successMessage = formConfig.successMessage || "Thank you! Your message has been sent successfully.";
    const redirectUrl = formConfig.redirectUrl || null;

    return res.status(201).json({
      success: true,
      message: successMessage,
      data: {
        id: formResponse._id,
        whatsappUrl,
        redirectUrl,
        successMessage,
      },
    });
  } catch (error: any) {
    console.error("[Submit Form Error]", error);
    return res.status(500).json({
      success: false,
      error: { code: "FORM_SUBMISSION_FAILED", message: "Failed to submit form. Please try again." },
    });
  }
}

/**
 * Get all form responses for the authenticated user
 * GET /api/v1/forms/responses
 */
export async function getResponses(req: Request, res: Response) {
  try {
    const rawUserId = (req as any).user?.userId || (req as any).user?._id || (req as any).user?.id;
    if (!rawUserId) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    }

    let userMatch: any = rawUserId;
    try {
      userMatch = new Types.ObjectId(rawUserId);
    } catch {}

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const projectId = req.query.projectId as string;
    const isRead = req.query.isRead !== undefined ? req.query.isRead === "true" : undefined;
    const isStarred = req.query.isStarred !== undefined ? req.query.isStarred === "true" : undefined;
    const search = (req.query.search as string)?.trim();

    const filter: any = {
      $or: [{ userId: userMatch }, { userId: rawUserId }, { userId: String(rawUserId) }],
    };

    if (projectId && projectId !== "all") {
      filter.projectId = projectId;
    }
    if (isRead !== undefined) filter.isRead = isRead;
    if (isStarred !== undefined) filter.isStarred = isStarred;

    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$and = [
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
            { message: searchRegex },
            { projectName: searchRegex },
          ],
        },
      ];
    }

    const userBaseFilter = {
      $or: [{ userId: userMatch }, { userId: rawUserId }, { userId: String(rawUserId) }],
    };

    const [responses, total, unreadCount, totalAll] = await Promise.all([
      FormResponse.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      FormResponse.countDocuments(filter),
      FormResponse.countDocuments({ ...userBaseFilter, isRead: false }),
      FormResponse.countDocuments(userBaseFilter),
    ]);

    return res.json({
      success: true,
      data: responses,
      meta: {
        page,
        limit,
        total,
        unreadCount,
        totalAll,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("[Get Responses Error]", error);
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_FAILED", message: "Failed to fetch responses." },
    });
  }
}

/**
 * Update a single response (mark read/unread, star/unstar)
 * PATCH /api/v1/forms/responses/:id
 */
export async function updateResponse(req: Request, res: Response) {
  try {
    const rawUserId = (req as any).user?.userId || (req as any).user?._id || (req as any).user?.id;
    if (!rawUserId) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    }

    let userMatch: any = rawUserId;
    try {
      userMatch = new Types.ObjectId(rawUserId);
    } catch {}

    const { id } = req.params;
    const { isRead, isStarred } = req.body;

    const update: any = {};
    if (typeof isRead === "boolean") update.isRead = isRead;
    if (typeof isStarred === "boolean") update.isStarred = isStarred;

    const response = await FormResponse.findOneAndUpdate(
      {
        _id: id,
        $or: [{ userId: userMatch }, { userId: rawUserId }, { userId: String(rawUserId) }],
      },
      { $set: update },
      { new: true }
    ).lean();

    if (!response) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Form response not found." },
      });
    }

    return res.json({
      success: true,
      data: response,
      message: "Response updated successfully",
    });
  } catch (error: any) {
    console.error("[Update Response Error]", error);
    return res.status(500).json({
      success: false,
      error: { code: "UPDATE_FAILED", message: "Failed to update response." },
    });
  }
}

/**
 * Delete a single response
 * DELETE /api/v1/forms/responses/:id
 */
export async function deleteResponse(req: Request, res: Response) {
  try {
    const rawUserId = (req as any).user?.userId || (req as any).user?._id || (req as any).user?.id;
    if (!rawUserId) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    }

    let userMatch: any = rawUserId;
    try {
      userMatch = new Types.ObjectId(rawUserId);
    } catch {}

    const { id } = req.params;

    const deleted = await FormResponse.findOneAndDelete({
      _id: id,
      $or: [{ userId: userMatch }, { userId: rawUserId }, { userId: String(rawUserId) }],
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Form response not found." },
      });
    }

    return res.json({
      success: true,
      message: "Form response deleted successfully",
    });
  } catch (error: any) {
    console.error("[Delete Response Error]", error);
    return res.status(500).json({
      success: false,
      error: { code: "DELETE_FAILED", message: "Failed to delete response." },
    });
  }
}

/**
 * Export responses as CSV
 * GET /api/v1/forms/responses/export
 */
export async function exportCsv(req: Request, res: Response) {
  try {
    const rawUserId = (req as any).user?.userId || (req as any).user?._id || (req as any).user?.id;
    if (!rawUserId) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    }

    let userMatch: any = rawUserId;
    try {
      userMatch = new Types.ObjectId(rawUserId);
    } catch {}

    const projectId = req.query.projectId as string;

    const filter: any = {
      $or: [{ userId: userMatch }, { userId: rawUserId }, { userId: String(rawUserId) }],
    };
    if (projectId && projectId !== "all") filter.projectId = projectId;

    const items = await FormResponse.find(filter).sort({ createdAt: -1 }).limit(1000).lean();

    const headers = ["Date", "Project Name", "Sender Name", "Email", "Phone", "Message", "Referrer"];
    const rows = items.map((item) => [
      new Date(item.createdAt).toISOString().replace("T", " ").slice(0, 19),
      `"${(item.projectName || "").replace(/"/g, '""')}"`,
      `"${(item.name || "").replace(/"/g, '""')}"`,
      `"${(item.email || "").replace(/"/g, '""')}"`,
      `"${(item.phone || "").replace(/"/g, '""')}"`,
      `"${(item.message || "").replace(/"/g, '""')}"`,
      `"${(item.referrer || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="leads-export-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csvContent);
  } catch (error: any) {
    console.error("[Export CSV Error]", error);
    return res.status(500).json({
      success: false,
      error: { code: "EXPORT_FAILED", message: "Failed to export CSV." },
    });
  }
}
