import { z } from "zod";

// ==========================================
// Category & Enum Definitions
// ==========================================

export const SiteCategoryEnum = z.enum([
  "portfolio",
  "resume",
  "digital_card",
  "restaurant_menu",
  "business",
  "product_landing",
  "startup_landing",
  "personal",
  "event",
  "link_in_bio",
  "blank",
]);

export type SiteCategory = z.infer<typeof SiteCategoryEnum>;

export const SectionTypeEnum = z.enum([
  "hero",
  "navbar",
  "about",
  "features",
  "portfolio_grid",
  "menu_list",
  "timeline",
  "gallery",
  "pricing",
  "faq",
  "testimonials",
  "team",
  "services",
  "digital_card",
  "contact",
  "links",
  "maps",
  "whatsapp",
  "blog",
  "footer",
  "custom_html",
]);

export type SectionType = z.infer<typeof SectionTypeEnum>;

// ==========================================
// Field Definition Schema for Auto-Generated Editor
// ==========================================

export const FieldControlTypeEnum = z.enum([
  "text",
  "textarea",
  "color",
  "image",
  "icon",
  "button",
  "toggle",
  "slider",
  "select",
  "repeater",
  "socials",
  "gallery",
]);

export type FieldControlType = z.infer<typeof FieldControlTypeEnum>;

export const FieldDefinitionSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    key: z.string(),
    label: z.string(),
    type: FieldControlTypeEnum,
    description: z.string().optional(),
    placeholder: z.string().optional(),
    defaultValue: z.any().optional(),
    options: z.array(z.object({ label: z.string(), value: z.any() })).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    step: z.number().optional(),
    itemSchema: z.array(FieldDefinitionSchema).optional(),
  })
);

export type FieldDefinition = z.infer<typeof FieldDefinitionSchema>;

// ==========================================
// Site Config & Theme Schemas
// ==========================================

export const SiteThemeSchema = z.object({
  primaryColor: z.string().default("#3B82F6"),
  secondaryColor: z.string().optional().default("#8B5CF6"),
  accentColor: z.string().optional().default("#F59E0B"),
  backgroundColor: z.string().default("#090D16"),
  textColor: z.string().default("#F8FAFC"),
  fontFamily: z.string().optional().default("Inter"),
  headingFont: z.string().default("Inter"),
  bodyFont: z.string().default("Inter"),
  borderRadius: z.string().default("12px"),
  buttonVariant: z.string().default("rounded"),
  cardVariant: z.string().default("glass"),
  shadow: z.string().default("md"),
  mode: z.enum(["light", "dark", "glassmorphism"]).default("dark"),
  spacingScale: z.string().default("comfortable"),
  animations: z.boolean().default(true),
});

export type SiteTheme = z.infer<typeof SiteThemeSchema>;

export const SectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  variant: z.string().default("default"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  content: z.record(z.any()).optional().default({}),
  styling: z
    .object({
      paddingTop: z.string().optional(),
      paddingBottom: z.string().optional(),
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
    })
    .optional(),
  layout: z.string().optional(),
  fieldDefinitions: z.array(FieldDefinitionSchema).optional(),
  visible: z.boolean().default(true),
});

export type Section = z.infer<typeof SectionSchema>;

export const TemplateMetadataSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  tags: z.array(z.string()).default([]),
  author: z.string().default("Nexora AI"),
  version: z.string().default("1.0.0"),
  status: z.enum(["published", "draft", "archived"]).default("published"),
  popularity: z.number().default(90),
  isNew: z.boolean().default(false),
  thumbnailUrl: z.string().optional(),
  previewUrl: z.string().optional(),
});

export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;

export const SeoDefaultsSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export type SeoDefaults = z.infer<typeof SeoDefaultsSchema>;

export const SiteConfigSchema = z.object({
  meta: z.object({
    id: z.string().optional(),
    slug: z.string().optional(),
    title: z.string().default("My Digital Presence"),
    description: z.string().default("Created with AI Digital Presence Platform"),
    category: z.string().default("portfolio"),
    author: z.string().optional(),
    version: z.string().optional(),
    tags: z.array(z.string()).optional(),
    popularity: z.number().optional(),
    isNew: z.boolean().optional(),
    status: z.string().optional(),
  }),
  theme: SiteThemeSchema,
  sections: z.array(SectionSchema).default([]),
  seo: SeoDefaultsSchema.optional(),
  customCode: z
    .object({
      html: z.string().optional(),
      css: z.string().optional(),
      js: z.string().optional(),
    })
    .optional(),
  customCss: z.string().optional(),
});

export type SiteConfigJSON = z.infer<typeof SiteConfigSchema>;

// ==========================================
// Template customCss sanitizer & scoper
// ==========================================

const CSS_BLOCK_AT_RULES = new Set([
  "@media",
  "@supports",
  "@container",
  "@layer",
  "@document",
  "@scope",
  "@keyframes",
  "@-webkit-keyframes",
  "@-moz-keyframes",
  "@-o-keyframes",
]);

// Indicators of injected JavaScript / unsafe external loads / HTML
const DANGEROUS_CSS_PATTERNS = [
  /@import\b/i,
  /@charset\b/i,
  /expression\s*\(/i,
/javascript\s*:/i,
  /vbscript\s*:/i,
  // IE-specific "behavior" property (e.g. "behavior: url(x.htc)"). Must NOT be
  // preceded by a word char / hyphen, so CSS like "scroll-behavior: smooth"
  // and "scroll-behavior: auto" (legitimate modern CSS) is never rejected.
  /(?:^|[^-\w])behavior\s*:/i,
  /</,
];

function scopeCss(css: string, container: string): string {
  let result = "";
  let i = 0;
  const n = css.length;
  while (i < n) {
    const open = css.indexOf("{", i);
    const close = css.indexOf("}", i);
    if (open === -1) {
      result += css.slice(i);
      break;
    }
    // Stray closing brace
    if (close !== -1 && close < open) {
      result += css.slice(i, close + 1);
      i = close + 1;
      continue;
    }
    const prelude = css.slice(i, open);
    let depth = 1;
    let j = open + 1;
    while (j < n && depth > 0) {
      const ch = css[j];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      j++;
    }
    const body = css.slice(open + 1, j - 1);
    const trimmed = (prelude || "").trim();
    const atName = (trimmed.split(/\s+/)[0] || "").toLowerCase();

    if (trimmed.startsWith("@") && CSS_BLOCK_AT_RULES.has(atName)) {
      if (atName.includes("keyframes")) {
        // Keyframe selectors (from/to/percentages) must not be prefixed
        result += trimmed + "{" + body + "}";
      } else {
        result += trimmed + "{\n" + scopeCss(body, container) + "\n}";
      }
    } else if (trimmed.startsWith("@")) {
      // Leaf at-rule (e.g. @font-face) — keep as-is
      result += trimmed + "{" + body + "}";
} else if (trimmed.length > 0) {
      const scopedSelectors = trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((sel) => {
// Rewrite a leading "body.tpl-<id>" / "html.tpl-<id>" element+class
          // prefix (used by uploaded templates) into the scoped container class.
          const leadingTpl = sel.match(/^(?:body|html)\.([A-Za-z0-9_-]+)([\s>+~:.*\[]*.*)$/);
          if (leadingTpl) {
            return container + leadingTpl[2];
          }
          // Rewrite a leading "body"/"html" element (followed by a combinator,
          // child, adjacent, general-sibling, or pseudo) into the scoped
          // container class. This keeps global template CSS such as
          // "body nav", "body #hero", "body section h2", "body::before",
          // "body footer" scoped to the container instead of producing an
          // unreachable ".container body nav" (there is no nested <body>).
          const bodyPrefix = sel.match(/^(?:body|html)([\s>+~:])(.*)$/);
          if (bodyPrefix) {
            return container + bodyPrefix[1] + bodyPrefix[2];
          }
          if (sel === ":root" || sel === "html" || sel === "body") return container;
          if (sel.startsWith(container)) return sel;
          if (sel.includes(container)) return sel;
          return container + " " + sel;
        })
        .join(", ");
      result += scopedSelectors + "{\n" + body + "\n}";
    }
    i = j;
  }
  return result;
}

/**
 * Sanitizes and scopes a template's customCss string.
 * - Rejects dangerous JS / external-load / HTML patterns.
 * - Scopes every selector to the template container.
 * - Returns "" when the input is unsafe or empty.
 */
export function sanitizeTemplateCss(css: string | undefined | null, containerSelector: string): string {
  if (!css || !css.trim()) return "";
  if (DANGEROUS_CSS_PATTERNS.some((re) => re.test(css))) return "";
  const safeContainer = containerSelector.replace(/[^:.a-zA-Z0-9_-]/g, "").trim();
  const container = safeContainer || ".nexora-template";
  return scopeCss(css, container).trim();
}

/** Builds a stable template container class from config meta. */
export function resolveTemplateContainerClass(
  config: { meta?: { slug?: string; id?: string } } | null | undefined
): string {
  const id = config?.meta?.slug || config?.meta?.id || "site";
  return `nexora-tpl-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

// ==========================================
// API Standard Envelope Types
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; issue: string }>;
  };
}

