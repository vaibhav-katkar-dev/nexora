import crypto from "crypto";
import { SiteCategory } from "@ai-platform/shared";

// ──────────────────────────────────────────────
// FILLER PHRASES to strip before sending to LLM
// ──────────────────────────────────────────────
const FILLER_PHRASES = [
  "please build me",
  "can you make",
  "create a website for",
  "i want a",
  "i need a",
  "build me",
  "make me",
  "generate",
  "create",
  "design",
  "develop",
  "website for",
  "a website",
  "my website",
  "please",
];

// ──────────────────────────────────────────────
// CATEGORY KEYWORD MAP — maps prompt tokens to SiteCategory
// ──────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<SiteCategory, string[]> = {
  portfolio: ["portfolio", "projects", "works", "developer", "designer", "showcase", "case study"],
  resume: ["resume", "cv", "curriculum vitae", "experience", "qualifications", "job", "career"],
  digital_card: ["card", "visiting card", "business card", "vcard", "contact card", "digital card"],
  restaurant_menu: ["restaurant", "menu", "food", "chef", "bistro", "cafe", "dining", "dish", "cuisine"],
  business: ["business", "company", "agency", "firm", "services", "consulting", "office"],
  product_landing: ["product", "app", "saas", "software", "tool", "launch", "pricing", "feature"],
  startup_landing: ["startup", "venture", "mvp", "idea", "early access", "launch", "traction"],
  personal: ["personal", "about me", "blog", "hobby", "lifestyle", "individual"],
  event: ["event", "conference", "meetup", "wedding", "party", "concert", "festival", "registration"],
  link_in_bio: ["links", "link in bio", "linktree", "creator", "social", "instagram", "tiktok", "youtube"],
  blank: ["blank", "empty", "custom", "scratch"],
};

// ──────────────────────────────────────────────
// PROMPT OPTIMIZER
// Cleans user raw input → compact, context-rich string
// ──────────────────────────────────────────────
export function optimizePrompt(rawPrompt: string): string {
  let cleaned = rawPrompt.trim().toLowerCase();

  // Strip filler phrases using word boundaries to prevent corrupting words (e.g. "creative")
  for (const phrase of FILLER_PHRASES) {
    const escaped = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
    cleaned = cleaned.replace(regex, "");
  }

  // Collapse extra whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // Fallback if prompt became empty after stripping filler
  return cleaned || rawPrompt.trim();
}

// ──────────────────────────────────────────────
// ACCURATE TOKEN ESTIMATOR
// Calculates estimated prompt tokens (~4 chars per token average)
// ──────────────────────────────────────────────
export function estimateTokenCount(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  // Combination of word count and character heuristic for high accuracy
  const tokenEstimate = Math.ceil(chars / 4.0);
  return Math.max(words, tokenEstimate);
}

// ──────────────────────────────────────────────
// TEMPLATE DETECTOR
// Detects which of the 11 site categories the prompt refers to
// ──────────────────────────────────────────────
export function detectCategory(optimizedPrompt: string): SiteCategory {
  const lp = optimizedPrompt.toLowerCase();
  let bestMatch: SiteCategory = "blank";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter((kw) => lp.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = category as SiteCategory;
    }
  }

  return bestMatch;
}

// ──────────────────────────────────────────────
// PROMPT HASH — SHA-256 for PromptCache key
// ──────────────────────────────────────────────
export function hashPrompt(category: string, optimizedPrompt: string): string {
  return crypto
    .createHash("sha256")
    .update(`${category}:${optimizedPrompt}`)
    .digest("hex");
}

