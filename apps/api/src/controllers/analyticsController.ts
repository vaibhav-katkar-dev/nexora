import { Request, Response } from "express";
import crypto from "crypto";
import { Types } from "mongoose";
import { Project } from "../models/Project.js";
import { SiteAnalyticsDaily } from "../models/SiteAnalytics.js";
import { Domain } from "../models/Domain.js";

// In-memory cache for slug/id -> { projectId, userId, slug, name } to avoid querying Mongo on every single pageview beacon
const projectCache = new Map<string, { projectId: any; userId: any; slug: string; name: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 mins

async function resolveProject(siteIdOrSlug: string) {
  const cleanIdOrSlug = (siteIdOrSlug || "").trim();
  if (!cleanIdOrSlug) return null;

  const cached = projectCache.get(cleanIdOrSlug);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached;
  }

  let project: any = null;

  if (cleanIdOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
    project = await Project.findById(cleanIdOrSlug).select("_id userId slug name").lean();
  } else {
    project = await Project.findOne({ slug: cleanIdOrSlug.toLowerCase() }).select("_id userId slug name").lean();
  }

  // Fallback: Check if siteIdOrSlug is a custom domain
  if (!project) {
    const domainDoc = await Domain.findOne({
      domain: cleanIdOrSlug.toLowerCase(),
      status: "active",
    }).lean();

    if (domainDoc?.siteId) {
      project = await Project.findById(domainDoc.siteId).select("_id userId slug name").lean();
    }
  }

  if (!project) return null;

  const result = {
    projectId: project._id,
    userId: project.userId,
    slug: project.slug,
    name: project.name,
    timestamp: Date.now(),
  };

  projectCache.set(cleanIdOrSlug, result);
  projectCache.set(project.slug, result);
  projectCache.set(project._id.toString(), result);
  return result;
}

function cleanReferrerDomain(referrer?: string): string {
  if (!referrer || typeof referrer !== "string") return "direct";
  try {
    const url = new URL(referrer);
    let host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!host || host === "localhost" || host === "127.0.0.1") return "direct";
    if (host.includes("google.")) return "Google";
    if (host.includes("instagram.")) return "Instagram";
    if (host.includes("facebook.")) return "Facebook";
    if (host.includes("twitter.") || host.includes("x.com")) return "Twitter / X";
    if (host.includes("linkedin.")) return "LinkedIn";
    if (host.includes("youtube.")) return "YouTube";
    if (host.includes("whatsapp.") || host.includes("wa.me")) return "WhatsApp";
    if (host.includes("tiktok.")) return "TikTok";
    if (host.includes("reddit.")) return "Reddit";
    return host;
  } catch {
    return "direct";
  }
}

function getIpHash(ip: string | undefined): string {
  if (!ip) return "";
  const dateSalt = new Date().toISOString().slice(0, 10);
  return crypto.createHash("sha256").update(`${ip}-${dateSalt}-Oninsite-analytics`).digest("hex").slice(0, 16);
}

function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

function sanitizeKey(key?: string): string {
  if (!key) return "";
  return String(key).slice(0, 60).replace(/[\.\$]/g, "_").trim();
}

/**
 * Public Analytics Event Ingestion
 * POST /api/v1/analytics/collect
 */
export async function collectEvent(req: Request, res: Response) {
  try {
    let payload = req.body;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {}
    }

    const {
      siteIdOrSlug,
      eventType,
      referrer,
      deviceType,
      durationSeconds,
      target,
      utmSource,
      utmMedium,
      utmCampaign,
    } = payload || {};

    if (!siteIdOrSlug || !eventType) {
      return res.status(204).end();
    }

    const project = await resolveProject(siteIdOrSlug);
    if (!project) {
      return res.status(204).end();
    }

    const today = getTodayDateString();
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress;
    const ipHash = getIpHash(ip);

    const safeDevice = deviceType === "mobile" || deviceType === "tablet" ? deviceType : "desktop";
    const refSource = cleanReferrerDomain(referrer);
    const safeTarget = sanitizeKey(target);
    const safeUtmSource = sanitizeKey(utmSource);
    const safeUtmMedium = sanitizeKey(utmMedium);
    const safeUtmCampaign = sanitizeKey(utmCampaign);

    // Build optimized atomic MongoDB update
    const updateOps: any = {
      $setOnInsert: {
        projectSlug: project.slug,
        userId: project.userId,
      },
    };

    if (eventType === "pageview") {
      updateOps.$inc = {
        views: 1,
        [`devices.${safeDevice}`]: 1,
      };

      if (refSource) {
        updateOps.$inc[`referrers.${refSource.replace(/[\.\$]/g, "_")}`] = 1;
      }

      // Track UTM parameters
      if (safeUtmSource) {
        updateOps.$inc[`utmSources.${safeUtmSource}`] = 1;
      }
      if (safeUtmMedium) {
        updateOps.$inc[`utmMediums.${safeUtmMedium}`] = 1;
      }
      if (safeUtmCampaign) {
        updateOps.$inc[`utmCampaigns.${safeUtmCampaign}`] = 1;
      }

      // Check unique visitor buffer
      if (ipHash) {
        const existingDoc = await SiteAnalyticsDaily.findOne({
          projectId: project.projectId,
          date: today,
        }).select("visitorHashes").lean();

        const isNewVisitor = !existingDoc || !existingDoc.visitorHashes?.includes(ipHash);
        if (isNewVisitor) {
          updateOps.$inc.uniqueVisitors = 1;
          updateOps.$push = {
            visitorHashes: {
              $each: [ipHash],
              $slice: -1500, // keep only latest 1500 daily visitor hashes to avoid doc growth
            },
          };
        }
      }
    } else if (eventType === "click") {
      updateOps.$inc = { clicks: 1 };
      if (safeTarget) {
        updateOps.$inc[`popularActions.${safeTarget}`] = 1;
      }
    } else if (eventType === "form_submit") {
      updateOps.$inc = { formSubmissions: 1 };
    } else if (eventType === "duration") {
      const sec = Math.min(1800, Math.max(1, parseInt(durationSeconds) || 0));
      if (sec > 0) {
        updateOps.$inc = {
          totalDurationSeconds: sec,
          durationSampleCount: 1,
        };
      }
    }

    await SiteAnalyticsDaily.findOneAndUpdate(
      { projectId: project.projectId, date: today },
      updateOps,
      { upsert: true, new: true }
    );

    return res.status(204).end();
  } catch (error) {
    // Non-blocking catch so analytics never impact user experience
    return res.status(204).end();
  }
}

/**
 * Get aggregated analytics overview for a project
 * GET /api/v1/analytics/project/:projectId
 */
export async function getProjectAnalytics(req: Request, res: Response) {
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

    const { projectId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const project = await Project.findOne({
      _id: projectId,
      $or: [{ userId: userMatch }, { userId: rawUserId }, { userId: String(rawUserId) }],
    })
      .select("name slug")
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found or unauthorized." },
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    const startDateStr = startDate.toISOString().slice(0, 10);

    const dailyDocs = await SiteAnalyticsDaily.find({
      projectId: project._id,
      date: { $gte: startDateStr },
    })
      .sort({ date: 1 })
      .lean();

    // Fill missing dates in range for continuous timeline chart
    const dateMap = new Map<string, any>();
    dailyDocs.forEach((doc) => dateMap.set(doc.date, doc));

    let totalViews = 0;
    let uniqueVisitors = 0;
    let totalClicks = 0;
    let totalSubmissions = 0;
    let totalDurationSeconds = 0;
    let durationSamples = 0;
    const deviceTotals = { mobile: 0, desktop: 0, tablet: 0 };
    const referrerTotals: Record<string, number> = {};
    const actionTotals: Record<string, number> = {};
    const utmSourceTotals: Record<string, number> = {};
    const utmCampaignTotals: Record<string, number> = {};
    const utmMediumTotals: Record<string, number> = {};

    const dailyTrend: Array<{
      date: string;
      views: number;
      uniqueVisitors: number;
      clicks: number;
      submissions: number;
    }> = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().slice(0, 10);
      const doc = dateMap.get(dStr);

      const dViews = doc?.views || 0;
      const dUniques = doc?.uniqueVisitors || 0;
      const dClicks = doc?.clicks || 0;
      const dSubs = doc?.formSubmissions || 0;

      totalViews += dViews;
      uniqueVisitors += dUniques;
      totalClicks += dClicks;
      totalSubmissions += dSubs;

      if (doc?.totalDurationSeconds) totalDurationSeconds += doc.totalDurationSeconds;
      if (doc?.durationSampleCount) durationSamples += doc.durationSampleCount;

      if (doc?.devices) {
        deviceTotals.mobile += doc.devices.mobile || 0;
        deviceTotals.desktop += doc.devices.desktop || 0;
        deviceTotals.tablet += doc.devices.tablet || 0;
      }

      if (doc?.referrers) {
        for (const [k, v] of Object.entries(doc.referrers)) {
          const cleanK = k.replace(/_/g, ".");
          referrerTotals[cleanK] = (referrerTotals[cleanK] || 0) + (Number(v) || 0);
        }
      }

      if (doc?.popularActions) {
        for (const [k, v] of Object.entries(doc.popularActions)) {
          const cleanK = k.replace(/_/g, " ");
          actionTotals[cleanK] = (actionTotals[cleanK] || 0) + (Number(v) || 0);
        }
      }

      if (doc?.utmSources) {
        for (const [k, v] of Object.entries(doc.utmSources)) {
          utmSourceTotals[k] = (utmSourceTotals[k] || 0) + (Number(v) || 0);
        }
      }

      if (doc?.utmCampaigns) {
        for (const [k, v] of Object.entries(doc.utmCampaigns)) {
          utmCampaignTotals[k] = (utmCampaignTotals[k] || 0) + (Number(v) || 0);
        }
      }

      if (doc?.utmMediums) {
        for (const [k, v] of Object.entries(doc.utmMediums)) {
          utmMediumTotals[k] = (utmMediumTotals[k] || 0) + (Number(v) || 0);
        }
      }

      dailyTrend.push({
        date: dStr,
        views: dViews,
        uniqueVisitors: dUniques,
        clicks: dClicks,
        submissions: dSubs,
      });
    }

    const avgDurationSeconds = durationSamples > 0 ? Math.round(totalDurationSeconds / durationSamples) : 0;
    const bounceRatePercent =
      totalViews > 0
        ? Math.min(85, Math.max(15, Math.round(((totalViews - totalClicks - totalSubmissions) / totalViews) * 100)))
        : 0;

    const topReferrers = Object.entries(referrerTotals)
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topActions = Object.entries(actionTotals)
      .map(([target, count]) => ({ target, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topUtmSources = Object.entries(utmSourceTotals)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topUtmCampaigns = Object.entries(utmCampaignTotals)
      .map(([campaign, count]) => ({ campaign, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topUtmMediums = Object.entries(utmMediumTotals)
      .map(([medium, count]) => ({ medium, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return res.json({
      success: true,
      data: {
        projectId: project._id,
        projectName: project.name,
        projectSlug: project.slug,
        period: days <= 7 ? "7d" : "30d",
        totalViews,
        uniqueVisitors,
        totalClicks,
        totalSubmissions,
        avgDurationSeconds,
        bounceRatePercent,
        deviceBreakdown: deviceTotals,
        topReferrers,
        topActions,
        topUtmSources,
        topUtmCampaigns,
        topUtmMediums,
        dailyTrend,
      },
    });
  } catch (error: any) {
    console.error("[Get Project Analytics Error]", error);
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_FAILED", message: "Failed to fetch analytics." },
    });
  }
}

/**
 * Get aggregated summary metrics across all user projects
 * GET /api/v1/analytics/dashboard-summary
 */
export async function getDashboardSummary(req: Request, res: Response) {
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

    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    const startDateStr = startDate.toISOString().slice(0, 10);

    const dailyDocs = await SiteAnalyticsDaily.find({
      $or: [{ userId: userMatch }, { userId: rawUserId }, { userId: String(rawUserId) }],
      date: { $gte: startDateStr },
    })
      .sort({ date: 1 })
      .lean();

    // Group daily docs by date to aggregate cross-project numbers
    const dateMap = new Map<string, Array<any>>();
    dailyDocs.forEach((doc) => {
      const list = dateMap.get(doc.date) || [];
      list.push(doc);
      dateMap.set(doc.date, list);
    });

    let totalViews = 0;
    let uniqueVisitors = 0;
    let totalClicks = 0;
    let totalSubmissions = 0;
    let totalDurationSeconds = 0;
    let durationSamples = 0;
    const deviceTotals = { mobile: 0, desktop: 0, tablet: 0 };
    const referrerTotals: Record<string, number> = {};
    const actionTotals: Record<string, number> = {};
    const utmSourceTotals: Record<string, number> = {};
    const utmCampaignTotals: Record<string, number> = {};
    const utmMediumTotals: Record<string, number> = {};

    const dailyTrend: Array<{
      date: string;
      views: number;
      uniqueVisitors: number;
      clicks: number;
      submissions: number;
    }> = [];

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dStr = d.toISOString().slice(0, 10);
      const docsOnDate = dateMap.get(dStr) || [];

      let dViews = 0;
      let dUniques = 0;
      let dClicks = 0;
      let dSubs = 0;

      for (const doc of docsOnDate) {
        dViews += doc.views || 0;
        dUniques += doc.uniqueVisitors || 0;
        dClicks += doc.clicks || 0;
        dSubs += doc.formSubmissions || 0;

        if (doc.totalDurationSeconds) totalDurationSeconds += doc.totalDurationSeconds;
        if (doc.durationSampleCount) durationSamples += doc.durationSampleCount;

        if (doc.devices) {
          deviceTotals.mobile += doc.devices.mobile || 0;
          deviceTotals.desktop += doc.devices.desktop || 0;
          deviceTotals.tablet += doc.devices.tablet || 0;
        }

        if (doc.referrers) {
          for (const [k, v] of Object.entries(doc.referrers)) {
            const cleanK = k.replace(/_/g, ".");
            referrerTotals[cleanK] = (referrerTotals[cleanK] || 0) + (Number(v) || 0);
          }
        }

        if (doc.popularActions) {
          for (const [k, v] of Object.entries(doc.popularActions)) {
            const cleanK = k.replace(/_/g, " ");
            actionTotals[cleanK] = (actionTotals[cleanK] || 0) + (Number(v) || 0);
          }
        }

        if (doc.utmSources) {
          for (const [k, v] of Object.entries(doc.utmSources)) {
            utmSourceTotals[k] = (utmSourceTotals[k] || 0) + (Number(v) || 0);
          }
        }

        if (doc.utmCampaigns) {
          for (const [k, v] of Object.entries(doc.utmCampaigns)) {
            utmCampaignTotals[k] = (utmCampaignTotals[k] || 0) + (Number(v) || 0);
          }
        }

        if (doc.utmMediums) {
          for (const [k, v] of Object.entries(doc.utmMediums)) {
            utmMediumTotals[k] = (utmMediumTotals[k] || 0) + (Number(v) || 0);
          }
        }
      }

      totalViews += dViews;
      uniqueVisitors += dUniques;
      totalClicks += dClicks;
      totalSubmissions += dSubs;

      dailyTrend.push({
        date: dStr,
        views: dViews,
        uniqueVisitors: dUniques,
        clicks: dClicks,
        submissions: dSubs,
      });
    }

    const avgDurationSeconds = durationSamples > 0 ? Math.round(totalDurationSeconds / durationSamples) : 0;
    const bounceRatePercent =
      totalViews > 0
        ? Math.min(85, Math.max(15, Math.round(((totalViews - totalClicks - totalSubmissions) / totalViews) * 100)))
        : 0;

    const topReferrers = Object.entries(referrerTotals)
      .map(([source, count]) => ({
        source,
        count,
        percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topActions = Object.entries(actionTotals)
      .map(([target, count]) => ({ target, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topUtmSources = Object.entries(utmSourceTotals)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topUtmCampaigns = Object.entries(utmCampaignTotals)
      .map(([campaign, count]) => ({ campaign, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const topUtmMediums = Object.entries(utmMediumTotals)
      .map(([medium, count]) => ({ medium, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return res.json({
      success: true,
      data: {
        projectId: "all",
        projectName: "All Sites Combined",
        projectSlug: "all",
        period: days <= 7 ? "7d" : "30d",
        totalViews,
        uniqueVisitors,
        totalClicks,
        totalSubmissions,
        avgDurationSeconds,
        bounceRatePercent,
        deviceBreakdown: deviceTotals,
        topReferrers,
        topActions,
        topUtmSources,
        topUtmCampaigns,
        topUtmMediums,
        dailyTrend,
      },
    });
  } catch (error: any) {
    console.error("[Analytics Summary Error]", error);
    return res.status(500).json({
      success: false,
      error: { code: "FETCH_FAILED", message: "Failed to fetch analytics summary." },
    });
  }
}
