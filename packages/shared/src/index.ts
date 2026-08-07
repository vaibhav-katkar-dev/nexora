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
});

export type SiteConfigJSON = z.infer<typeof SiteConfigSchema>;

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

