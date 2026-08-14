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

  const parts = normalizedKey.split(".").filter(Boolean);
  if (parts.length === 0) return null;

  let cursor: unknown = (section.content || {}) as Record<string, unknown>;

  for (const part of parts) {
    if (cursor === null || cursor === undefined) return null;
    cursor = (cursor as Record<string, unknown>)[part];
  }

  return typeof cursor === "string" || typeof cursor === "number" ? cursor : null;
}

export function isEditableElementValue(value: unknown): value is string | number {
  return typeof value === "string" || typeof value === "number";
}
