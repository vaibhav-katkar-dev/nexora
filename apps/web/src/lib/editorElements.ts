import type { Section } from "@ai-platform/shared";

const DIRECT_ELEMENT_KEYS = new Set(["badge", "title", "subtitle"]);

export function normalizeElementKey(elementKey: string): string {
  return elementKey.replace(/^content\./, "");
}

export function resolveElementValue(
  section: Section | null | undefined,
  elementKey: string | null | undefined
): string | number | null {
  if (!section || !elementKey) return null;

  const normalizedKey = normalizeElementKey(elementKey);

  if (DIRECT_ELEMENT_KEYS.has(normalizedKey)) {
    const value = (section as Record<string, unknown>)[normalizedKey];
    return typeof value === "string" || typeof value === "number" ? value : null;
  }

  // Check top-level section properties (e.g. section.logoImage, section.image, section.avatar)
  if ((section as any)[normalizedKey] !== undefined && (section as any)[normalizedKey] !== null) {
    const directVal = (section as any)[normalizedKey];
    if (typeof directVal === "string" || typeof directVal === "number") return directVal;
  }

  const parts = normalizedKey.split(".").filter(Boolean);
  if (parts.length === 0) return null;

  let cursor: unknown = (section.content || {}) as Record<string, unknown>;

  for (const part of parts) {
    if (cursor === null || cursor === undefined) {
      if ((section as any)[part] !== undefined) {
        cursor = (section as any)[part];
        continue;
      }
      return null;
    }
    cursor = (cursor as Record<string, unknown>)[part];
  }

  if (cursor && typeof cursor === "object") {
    const obj = cursor as Record<string, any>;
    if (typeof obj.url === "string") return obj.url;
    if (typeof obj.src === "string") return obj.src;
    if (typeof obj.image === "string") return obj.image;
    if (typeof obj.avatar === "string") return obj.avatar;
    if (typeof obj.label === "string") return obj.label;
    if (typeof obj.title === "string") return obj.title;
  }

  if (typeof cursor === "string" || typeof cursor === "number") return cursor;

  // For custom_template sections, fall back to template's defaultData if field isn't explicitly set yet
  if (section.type === "custom_template") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getCustomTemplate } = require("@/components/custom-template/customTemplateRegistry");
      const templateId =
        section.content?.templateId ||
        (section as any).templateId ||
        section.variant ||
        "noir-premium";
      const tplDef = getCustomTemplate(templateId) || getCustomTemplate("noir-premium");
      if (tplDef?.defaultData) {
        let defCursor: any = { data: tplDef.defaultData, ...tplDef.defaultData };
        for (const part of parts) {
          if (defCursor === null || defCursor === undefined) break;
          defCursor = defCursor[part];
        }
        if (typeof defCursor === "string" || typeof defCursor === "number") return defCursor;
        if (defCursor && typeof defCursor === "object") {
          if (typeof defCursor.url === "string") return defCursor.url;
          if (typeof defCursor.src === "string") return defCursor.src;
          if (typeof defCursor.image === "string") return defCursor.image;
          if (typeof defCursor.avatar === "string") return defCursor.avatar;
          if (typeof defCursor.label === "string") return defCursor.label;
          if (typeof defCursor.title === "string") return defCursor.title;
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

export function isEditableElementValue(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}

/** Check if an element key represents a CTA or button or link */
export function isCtaOrLinkElement(elementKey: string | null | undefined): boolean {
  if (!elementKey) return false;
  const key = normalizeElementKey(elementKey).toLowerCase();
  return (
    key.includes("cta") ||
    key.includes("button") ||
    key.includes("link") ||
    key.endsWith(".url") ||
    key.endsWith(".href") ||
    key.includes("socials") ||
    key === "links"
  );
}

/** Check if an element key represents an image or photo */
export function isImageElement(elementKey: string | null | undefined, value?: unknown): boolean {
  if (!elementKey) return false;
  const key = normalizeElementKey(elementKey).toLowerCase();
  if (/image|avatar|photo|logo|thumb|picture|cover|banner|icon/i.test(key)) {
    return true;
  }
  if (typeof value === "string" && (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/"))) {
    return /\.(jpeg|jpg|gif|png|webp|svg|avif)($|\?)/i.test(value);
  }
  return false;
}

/**
 * Returns the corresponding link/action field path for a given element key.
 * For example:
 *   "ctaText" -> "ctaLink"
 *   "secondaryCtaText" -> "secondaryCtaLink"
 *   "links.0.label" -> "links.0.url"
 *   "items.0.buttonText" -> "items.0.url"
 *   "data.links.0.label" -> "data.links.0.url"
 */
export function getElementLinkFieldPath(elementKey: string): string {
  const norm = normalizeElementKey(elementKey);

  if (norm === "ctaText") return "ctaLink";
  if (norm === "secondaryCtaText") return "secondaryCtaLink";
  if (norm.endsWith(".ctaText")) return norm.replace(/\.ctaText$/, ".ctaLink");
  if (norm.endsWith(".secondaryCtaText")) return norm.replace(/\.secondaryCtaText$/, ".secondaryCtaLink");

  if (norm.endsWith(".buttonText")) return norm.replace(/\.buttonText$/, ".url");
  if (norm.endsWith(".button")) return norm.replace(/\.button$/, ".url");
  if (norm.endsWith(".label")) return norm.replace(/\.label$/, ".url");
  if (norm.endsWith(".name")) return norm.replace(/\.name$/, ".url");
  if (norm.endsWith(".title")) return norm.replace(/\.title$/, ".url");

  if (norm.endsWith(".url") || norm.endsWith(".link") || norm.endsWith(".ctaLink")) {
    return norm;
  }

  // If pointing at an array item (e.g. "links.0" or "items.1"), the link is `.url`
  if (/\.\d+$/.test(norm)) {
    return `${norm}.url`;
  }

  return norm;
}

/**
 * Resolves the link/action URL associated with an element.
 */
export function resolveElementLink(
  section: Section | null | undefined,
  elementKey: string | null | undefined
): string | null {
  if (!section || !elementKey) return null;
  const linkPath = getElementLinkFieldPath(elementKey);
  const val = resolveElementValue(section, linkPath);
  if (typeof val === "string" && val.trim()) return val;

  // Check fallback paths
  const norm = normalizeElementKey(elementKey);
  if (norm === "ctaText" && section.content?.ctaLink) return String(section.content.ctaLink);
  if (norm === "secondaryCtaText" && section.content?.secondaryCtaLink) return String(section.content.secondaryCtaLink);

  // If key is an array item or child of an array item, inspect the item object
  const parts = norm.split(".");
  const numIdx = parts.findIndex((p) => /^\d+$/.test(p));
  if (numIdx !== -1) {
    const itemPath = parts.slice(0, numIdx + 1).join(".");
    const itemObj = resolveRawObject(section, itemPath);
    if (itemObj && typeof itemObj === "object") {
      if (itemObj.url) return String(itemObj.url);
      if (itemObj.link) return String(itemObj.link);
      if (itemObj.ctaLink) return String(itemObj.ctaLink);
      if (itemObj.href) return String(itemObj.href);
    }
  }

  return null;
}

/** Helper to resolve raw object or container */
function resolveRawObject(section: Section, path: string): any {
  const parts = normalizeElementKey(path).split(".").filter(Boolean);
  let cursor: any = section.content || {};
  for (const part of parts) {
    if (cursor === null || cursor === undefined) return null;
    cursor = cursor[part];
  }
  if (cursor !== undefined) return cursor;

  // Fallback for custom_template
  if (section.type === "custom_template") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { getCustomTemplate } = require("@/components/custom-template/customTemplateRegistry");
      const templateId =
        section.content?.templateId ||
        (section as any).templateId ||
        section.variant ||
        "noir-premium";
      const tplDef = getCustomTemplate(templateId) || getCustomTemplate("noir-premium");
      if (tplDef?.defaultData) {
        let defCursor: any = { data: tplDef.defaultData, ...tplDef.defaultData };
        for (const part of parts) {
          if (defCursor === null || defCursor === undefined) break;
          defCursor = defCursor[part];
        }
        return defCursor;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Generates an ordered list of candidate field paths to search in Inspector panels
 * for matching [data-field-path]. Supports exact match, parent containers, and aliases.
 */
export function getCandidateFieldPaths(elementKey: string): string[] {
  const normalized = normalizeElementKey(elementKey);
  const raw = elementKey;

  const candidates: string[] = [];

  // Exact paths
  candidates.push(normalized);
  if (normalized !== raw) candidates.push(raw);

  // Custom template data prefix variants
  if (normalized.startsWith("data.")) {
    const stripped = normalized.replace(/^data\./, "");
    candidates.push(stripped);
    candidates.push(`content.data.${stripped}`);
    candidates.push(`content.${stripped}`);
  } else {
    candidates.push(`content.data.${normalized}`);
    candidates.push(`data.${normalized}`);
    candidates.push(`content.${normalized}`);
  }

  // Leaf property aliases
  if (normalized.endsWith(".label")) {
    candidates.push(normalized.replace(/\.label$/, ""));
  }
  if (normalized.endsWith(".title")) {
    candidates.push(normalized.replace(/\.title$/, ""));
  }
  if (normalized.endsWith(".name")) {
    candidates.push(normalized.replace(/\.name$/, ""));
  }
  if (normalized.endsWith(".buttonText")) {
    candidates.push(normalized.replace(/\.buttonText$/, ""));
    candidates.push(normalized.replace(/\.buttonText$/, ".url"));
  }
  if (normalized.endsWith(".url")) {
    candidates.push(normalized.replace(/\.url$/, ""));
    candidates.push(normalized.replace(/\.url$/, ".label"));
  }
  if (normalized === "ctaText" || normalized === "ctaLink") {
    candidates.push("ctaText", "ctaLink");
  }
  if (normalized === "secondaryCtaText" || normalized === "secondaryCtaLink") {
    candidates.push("secondaryCtaText", "secondaryCtaLink");
  }

  // Hierarchical parent paths (e.g. categories.0.items.1.name -> categories.0.items.1 -> categories.0 -> categories)
  const parts = normalized.split(".");
  while (parts.length > 1) {
    parts.pop();
    const parentPath = parts.join(".");
    candidates.push(parentPath);
    candidates.push(`content.${parentPath}`);
    candidates.push(`content.data.${parentPath}`);
    if (parentPath.startsWith("data.")) {
      candidates.push(parentPath.replace(/^data\./, ""));
    }
  }

  return Array.from(new Set(candidates.filter(Boolean)));
}
