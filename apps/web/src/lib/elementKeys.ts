/**
 * Helpers for element-level click-to-inspect in the visual editor.
 *
 * An "element key" is a stable string that points at a field inside a section's
 * data, e.g.:
 *   - "content.heroTitle"                  → hero section title
 *   - "content.items.0.title"              → first item's title
 *   - "content.projects.2.image"           → third project's image
 *   - "content.socials.email"              → email social field
 *
 * These keys are used to:
 *   1. Tag rendered elements with `data-element-key`.
 *   2. Tag inspector form inputs with `data-field-path`.
 *   3. Match the two so clicking an element highlights the exact control.
 */

/** Humanize a raw key fragment: "metaTitle" → "Meta Title", "ctaLink" → "Cta Link". */
export function humanizeKeyFragment(fragment: string): string {
  if (!fragment) return fragment;
  return fragment
    .replace(/([A-Z])/g, " $1")
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ");
}

/** Convert a dotted element key into a friendly label, e.g. "content.items.0.title" → "Items #1 → Title". */
export function humanizeElementKey(key: string): string {
  if (!key) return "Element";

  const parts = key.split(".");
  // Drop the leading "content" segment
  const meaningful = parts[0] === "content" ? parts.slice(1) : parts;
  if (meaningful.length === 0) return "Section Content";

  let label = "";
  let arrayContext: string | null = null;

  for (let i = 0; i < meaningful.length; i++) {
    const part = meaningful[i];

    // Numeric index → "Items #1"
    if (/^\d+$/.test(part)) {
      const num = parseInt(part, 10) + 1;
      label += ` #${num}`;
      continue;
    }

    // Start of a new group (first or after a group name)
    const isNewGroup = label === "" || /#\d+$/.test(label.trim());
    const human = humanizeKeyFragment(part);

    if (isNewGroup) {
      if (label !== "") label += " → ";
      label += `${human}`;
      arrayContext = human;
    } else if (arrayContext) {
      label += ` → ${human}`;
      arrayContext = null;
    } else {
      if (label !== "") label += " → ";
      label += human;
    }
  }

  return label;
}

