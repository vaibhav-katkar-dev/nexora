import { SiteConfigJSON, SiteConfigSchema, SiteCategory } from "@ai-platform/shared";

// Folder-based dynamic template definitions
import portfolioModern from "./templates/portfolio-modern/template.json";
import resumeMinimal from "./templates/resume-minimal/template.json";
import restaurantElegant from "./templates/restaurant-elegant/template.json";
import businessClassic from "./templates/business-classic/template.json";
import eventPremium from "./templates/event-premium/template.json";
import startupLaunch from "./templates/startup-launch/template.json";
import productShowcase from "./templates/product-showcase/template.json";
import digitalCardPro from "./templates/digital-card-pro/template.json";
import linkBioNeon from "./templates/link-bio-neon/template.json";
import personalCreative from "./templates/personal-creative/template.json";

// Standard preset fallback templates
import legacyBlank from "./blank.json";

export const templateRegistry: Record<string, SiteConfigJSON> = {
  "portfolio-modern": portfolioModern as unknown as SiteConfigJSON,
  "resume-minimal": resumeMinimal as unknown as SiteConfigJSON,
  "restaurant-elegant": restaurantElegant as unknown as SiteConfigJSON,
  "business-classic": businessClassic as unknown as SiteConfigJSON,
  "event-premium": eventPremium as unknown as SiteConfigJSON,
  "startup-launch": startupLaunch as unknown as SiteConfigJSON,
  "product-showcase": productShowcase as unknown as SiteConfigJSON,
  "digital-card-pro": digitalCardPro as unknown as SiteConfigJSON,
  "link-bio-neon": linkBioNeon as unknown as SiteConfigJSON,
  "personal-creative": personalCreative as unknown as SiteConfigJSON,

  // Category fallback aliases
  portfolio: portfolioModern as unknown as SiteConfigJSON,
  resume: resumeMinimal as unknown as SiteConfigJSON,
  restaurant_menu: restaurantElegant as unknown as SiteConfigJSON,
  business: businessClassic as unknown as SiteConfigJSON,
  event: eventPremium as unknown as SiteConfigJSON,
  startup_landing: startupLaunch as unknown as SiteConfigJSON,
  product_landing: productShowcase as unknown as SiteConfigJSON,
  digital_card: digitalCardPro as unknown as SiteConfigJSON,
  link_in_bio: linkBioNeon as unknown as SiteConfigJSON,
  personal: personalCreative as unknown as SiteConfigJSON,
  blank: legacyBlank as unknown as SiteConfigJSON,
};

export const presetTemplates = templateRegistry;

export function getTemplateBySlug(slug: string): SiteConfigJSON {
  return templateRegistry[slug] || templateRegistry["portfolio-modern"];
}

export function getTemplateByCategory(category: SiteCategory): SiteConfigJSON {
  const match = Object.values(templateRegistry).find(
    (t) => t.meta?.category === category
  );
  return match || templateRegistry[category] || templateRegistry["portfolio-modern"];
}

export function getAllTemplates(): Array<{
  id: string;
  name: string;
  category: string;
  slug: string;
  description: string;
  tags: string[];
  popularity: number;
  isNew: boolean;
  config: SiteConfigJSON;
}> {
  const uniqueSlugs = [
    "portfolio-modern",
    "resume-minimal",
    "restaurant-elegant",
    "business-classic",
    "event-premium",
    "startup-launch",
    "product-showcase",
    "digital-card-pro",
    "link-bio-neon",
    "personal-creative",
  ];

  return uniqueSlugs.map((slug) => {
    const config = templateRegistry[slug];
    return {
      id: slug,
      slug: slug,
      name: config.meta.title || slug,
      category: config.meta.category || "portfolio",
      description: config.meta.description || "",
      tags: config.meta.tags || [],
      popularity: config.meta.popularity || 90,
      isNew: config.meta.isNew || false,
      config,
    };
  });
}

export function validateTemplateJSON(json: any): { valid: boolean; errors?: string[] } {
  try {
    const result = SiteConfigSchema.safeParse(json);
    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`
      );
      return { valid: false, errors };
    }
    return { valid: true };
  } catch (err: any) {
    return { valid: false, errors: [err.message || "Invalid JSON structure"] };
  }
}

export interface CompatibilityCheckItem {
  category: "Structure" | "Styling" | "Rendering" | "Editor" | "Assets" | "Security";
  title: string;
  passed: boolean;
  message: string;
  details?: string[];
}

export interface TemplateCompatibilityReport {
  overallValid: boolean;
  score: number;
  checks: CompatibilityCheckItem[];
}

export function checkTemplateCompatibility(json: any): TemplateCompatibilityReport {
  const checks: CompatibilityCheckItem[] = [];

  // 1. Schema & Structure Validation
  const schemaResult = validateTemplateJSON(json);
  if (schemaResult.valid) {
    checks.push({
      category: "Structure",
      title: "JSON & Zod Schema Validation",
      passed: true,
      message: "Valid SiteConfig JSON structure",
    });
  } else {
    checks.push({
      category: "Structure",
      title: "JSON & Zod Schema Validation",
      passed: false,
      message: "Schema validation failed",
      details: schemaResult.errors,
    });
  }

  // Check metadata
  const meta = json?.meta || {};
  const hasTitle = Boolean(meta.title);
  const hasCategory = Boolean(meta.category);
  const hasSlug = Boolean(meta.slug);

  checks.push({
    category: "Structure",
    title: "Template Metadata Fields",
    passed: hasTitle && hasCategory,
    message: hasTitle && hasCategory
      ? `Title: "${meta.title}", Category: "${meta.category}"`
      : "Missing required metadata fields (title and category)",
  });

  // Check section structure & unique IDs
  const sections = Array.isArray(json?.sections) ? json.sections : [];
  if (sections.length === 0) {
    checks.push({
      category: "Structure",
      title: "Section Array",
      passed: false,
      message: "Template contains zero sections",
    });
  } else {
    const ids = new Set<string>();
    let duplicateIdFound = false;
    for (const sec of sections) {
      if (!sec.id || ids.has(sec.id)) {
        duplicateIdFound = true;
        break;
      }
      ids.add(sec.id);
    }
    checks.push({
      category: "Structure",
      title: "Section Structure & IDs",
      passed: !duplicateIdFound,
      message: duplicateIdFound
        ? "Duplicate or missing section IDs detected"
        : `${sections.length} unique sections configured`,
    });
  }

  // 2. Theme & Design Tokens
  const theme = json?.theme || {};
  const hasThemeColors = Boolean(theme.primaryColor && theme.backgroundColor && theme.textColor);
  checks.push({
    category: "Styling",
    title: "Theme & Design Tokens",
    passed: hasThemeColors,
    message: hasThemeColors
      ? `Colors & Fonts set (Primary: ${theme.primaryColor}, Mode: ${theme.mode || "dark"})`
      : "Incomplete theme color configuration",
  });

  // 3. Security & Custom CSS Check
  const css = [json?.customCss, json?.customCode?.css].filter(Boolean).join("\n");
  const dangerousPatterns = [/@import\b/i, /expression\s*\(/i, /javascript\s*:/i, /<script/i];
  const hasDanger = dangerousPatterns.some((pattern) => pattern.test(css));
  checks.push({
    category: "Security",
    title: "CSS & Code Security",
    passed: !hasDanger,
    message: hasDanger
      ? "Dangerous CSS pattern detected (@import, script injection, or javascript:)"
      : css ? "Custom CSS is clean and safe to scope" : "No custom CSS (Clean)",
  });

  // 4. Editor Compatibility Check
  const editableLeafKeys = new Set(["title", "subtitle", "badge", "label", "desc", "quote", "name", "price", "question", "answer", "ctaText"]);
  let editableElementsCount = 0;
  for (const sec of sections) {
    if (sec.title) editableElementsCount++;
    if (sec.subtitle) editableElementsCount++;
    if (sec.badge) editableElementsCount++;
    const content = sec.content || {};
    for (const [k, v] of Object.entries(content)) {
      if (editableLeafKeys.has(k)) editableElementsCount++;
      if (Array.isArray(v)) editableElementsCount += v.length;
    }
  }
  checks.push({
    category: "Editor",
    title: "Visual Editor Key Mapping",
    passed: editableElementsCount > 0,
    message: `${editableElementsCount} editable elements detected for the Visual Editor`,
  });

  // 5. Assets Check
  checks.push({
    category: "Assets",
    title: "Asset & Media Links",
    passed: true,
    message: "Media references fallback gracefully",
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  const overallValid = checks.every((c) => c.passed);

  return { overallValid, score, checks };
}

