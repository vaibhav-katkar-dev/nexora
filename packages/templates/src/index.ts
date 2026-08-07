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
