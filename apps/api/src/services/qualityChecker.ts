import { IProjectDocument } from "../models/Project.js";

export interface QualityCheckResult {
  status: "legitimate" | "thin" | "blocked";
  reason?: string;
}

const SUSPICIOUS_PATTERNS = [
  /login-verify-account/i,
  /paypal-security-update/i,
  /bank-account-verification/i,
  /crypto-wallet-seed-phrase/i,
  /<script\b[^>]*>(.*?)(eval|document\.cookie|window\.location\.replace).*?<\/script>/i,
  /document\.write\(unescape\(/i,
];

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum dolor sit amet/i,
  /insert your text here/i,
  /sample subtitle text/i,
  /placeholder description/i,
];

/**
 * Extracts raw textual content from a SiteConfigJSON object.
 */
function extractTextFromConfig(config: any): string {
  if (!config) return "";
  const parts: string[] = [];

  if (config.meta?.title) parts.push(config.meta.title);
  if (config.meta?.description) parts.push(config.meta.description);

  if (Array.isArray(config.sections)) {
    for (const section of config.sections) {
      if (section.title) parts.push(section.title);
      if (section.subtitle) parts.push(section.subtitle);
      if (section.content) {
        const strContent = JSON.stringify(section.content);
        parts.push(strContent);
      }
    }
  }

  return parts.join(" ");
}

/**
 * Analyzes a project's content and returns its quality status.
 */
export function evaluateProjectQuality(project: Partial<IProjectDocument>): QualityCheckResult {
  const textContent = extractTextFromConfig(project.config);
  const rawHtml = project.publishedHtml || project.customCode?.html || "";
  const combined = `${textContent} ${rawHtml}`;

  // 1. Abusive / Malicious check
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(combined)) {
      return {
        status: "blocked",
        reason: "Detected suspicious security pattern or potentially malicious embed",
      };
    }
  }

  // 2. Thin / Incomplete content check (< 25 words or heavy lorem ipsum)
  const words = textContent.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean);
  if (words.length < 15) {
    return {
      status: "thin",
      reason: "Site has minimal text content (under 15 words)",
    };
  }

  let placeholderMatchCount = 0;
  for (const placeholder of PLACEHOLDER_PATTERNS) {
    if (placeholder.test(combined)) {
      placeholderMatchCount++;
    }
  }

  if (placeholderMatchCount >= 2 && words.length < 50) {
    return {
      status: "thin",
      reason: "Site contains unedited template placeholder text",
    };
  }

  // 3. Legitimate site
  return {
    status: "legitimate",
  };
}
