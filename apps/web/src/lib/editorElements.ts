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
