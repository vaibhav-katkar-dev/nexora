import { SiteConfigJSON, SiteCategory } from "@ai-platform/shared";
import { estimateTokenCount } from "./promptOptimizer.js";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIGenerateResult {
  config: SiteConfigJSON;
  tokensUsed: TokenUsage;
  modelUsed: string;
}

// ──────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — Instructs LLM to return ONLY a strict JSON schema.
// Platform handles all HTML/CSS/JS generation — drastically cuts token cost.
// ──────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are a precise, low-token JSON content generator for a web presence platform.

Your ONLY job is to fill a structured JSON configuration object based on the user's request.
You MUST return a single valid JSON object — no markdown, no explanations, no code blocks.

The JSON schema you must return:
{
  "meta": {
    "title": "<SEO-optimized page title>",
    "description": "<compelling 150-char meta description>",
    "category": "<category_enum>"
  },
  "theme": {
    "primaryColor": "<hex color>",
    "secondaryColor": "<hex color>",
    "backgroundColor": "<hex color>",
    "textColor": "<hex color>",
    "fontFamily": "Inter | Roboto | Outfit | Playfair Display | Fira Code",
    "mode": "dark | light | glassmorphism"
  },
  "sections": [
    {
      "id": "<unique_id>",
      "type": "hero | about | features | portfolio_grid | menu_list | contact | links | footer",
      "variant": "centered | split | cards | minimal | grid",
      "title": "<section heading>",
      "subtitle": "<brief supporting text>",
      "content": { <section-specific key-value data> }
    }
  ]
}

Rules:
- Return ONLY the JSON object, nothing else.
- Use real, compelling, industry-appropriate placeholder content.
- Include 3-5 sections appropriate for the category.
- Choose colors that evoke the brand personality of the business.
- Never generate HTML, CSS, or JavaScript — only content and configuration.
`.trim();

// ──────────────────────────────────────────────────────────────────────────
// CATEGORY SECTION HINTS — tells the LLM what sections are typical per type
// ──────────────────────────────────────────────────────────────────────────
const SECTION_HINTS: Record<SiteCategory, string> = {
  portfolio: "Include: hero (name + title), about (skills list), portfolio_grid (projects), contact",
  resume: "Include: hero (name + role), about (summary), features (skills/experience timeline), contact",
  digital_card: "Include: hero (name, photo, role), about (bio), links (social + contact), contact",
  restaurant_menu: "Include: hero (restaurant name + tagline), menu_list (categories + items with price), contact (address + hours)",
  business: "Include: hero (tagline), features (services/offerings), about (mission), contact",
  product_landing: "Include: hero (product name + value prop), features (3-4 feature cards), about (how it works), contact",
  startup_landing: "Include: hero (bold problem statement), features (solution points), about (founding team vision), contact",
  personal: "Include: hero (name + intro), about (story/interests), portfolio_grid (hobbies or work), contact",
  event: "Include: hero (event name + date), about (event details/agenda), features (speakers/highlights), contact (venue + registration)",
  link_in_bio: "Include: hero (creator name + bio), links (list of 4-8 curated links with emoji labels)",
  blank: "Include: hero only with placeholder text",
};

// ──────────────────────────────────────────────────────────────────────────
// DYNAMIC MULTI-MODEL GENERATION SERVICE
// Resolves AI model dynamically from process.env (AI_MODEL / GEMINI_MODEL / OPENAI_MODEL)
// ──────────────────────────────────────────────────────────────────────────
export async function generateSiteConfig(
  optimizedPrompt: string,
  category: SiteCategory,
  requestedModel?: string
): Promise<AIGenerateResult> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  // Retrieve model dynamically from environment variables
  const envModel =
    process.env.AI_MODEL ||
    process.env.GEMINI_MODEL ||
    process.env.OPENAI_MODEL;

  const targetModel =
    requestedModel || envModel || (geminiKey ? "gemini-2.5-flash" : "gpt-4o-mini");

  const isGeminiModel = targetModel.toLowerCase().includes("gemini");
  const errors: string[] = [];

  // Primary attempt with Gemini if model is gemini
  if (isGeminiModel) {
    if (geminiKey) {
      try {
        return await generateWithGemini(optimizedPrompt, category, geminiKey, targetModel);
      } catch (err: any) {
        console.warn(`Gemini generation attempt failed: ${err.message}`);
        errors.push(`Gemini Error: ${err.message}`);
        
        // Fallback to OpenAI only if the user didn't explicitly request Gemini
        if (openaiKey && !requestedModel) {
          try {
            const fallbackModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
            return await generateWithOpenAI(optimizedPrompt, category, openaiKey, fallbackModel);
          } catch(err2: any) {
            errors.push(`OpenAI Fallback Error: ${err2.message}`);
          }
        }
      }
    } else {
      errors.push("Gemini API key is not configured.");
    }
  } 
  // Primary attempt with OpenAI if model is OpenAI
  else {
    if (openaiKey) {
      try {
        return await generateWithOpenAI(optimizedPrompt, category, openaiKey, targetModel);
      } catch (err: any) {
        console.warn(`OpenAI generation attempt failed: ${err.message}`);
        errors.push(`OpenAI Error: ${err.message}`);
        
        // Fallback to Gemini only if the user didn't explicitly request OpenAI
        if (geminiKey && !requestedModel) {
          try {
            const fallbackGemini = process.env.GEMINI_MODEL || "gemini-2.5-flash";
            return await generateWithGemini(optimizedPrompt, category, geminiKey, fallbackGemini);
          } catch (err2: any) {
            errors.push(`Gemini Fallback Error: ${err2.message}`);
          }
        }
      }
    } else {
      errors.push("OpenAI API key is not configured.");
    }
  }

  throw new Error(
    `AI Generation failed. Details: ${errors.join(" | ")}`
  );
}

// ─── Dynamic Google Gemini API Call ─────────────────────────────────────────
async function generateWithGemini(
  optimizedPrompt: string,
  category: SiteCategory,
  geminiKey: string,
  modelName?: string
): Promise<AIGenerateResult> {
  const modelToUse = modelName || process.env.GEMINI_MODEL || process.env.AI_MODEL || "gemini-2.5-flash";

  const userMessage = `
Category: ${category}
Section hints: ${SECTION_HINTS[category]}
User request: ${optimizedPrompt}
Generate the JSON configuration now.
`.trim();

  const fullPrompt = `${SYSTEM_PROMPT}\n\n${userMessage}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1400,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    const fallbackGeminiModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.0-flash";
    if (response.status === 404 && modelToUse !== fallbackGeminiModel) {
      return await generateWithGemini(optimizedPrompt, category, geminiKey, fallbackGeminiModel);
    }
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as any;
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) throw new Error("Gemini returned empty response");

  const cleanJson = rawText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleanJson) as SiteConfigJSON;

  if (parsed.meta) parsed.meta.category = category;

  const promptTokens =
    data.usageMetadata?.promptTokenCount ?? estimateTokenCount(fullPrompt);
  const completionTokens =
    data.usageMetadata?.candidatesTokenCount ?? estimateTokenCount(cleanJson);
  const totalTokens =
    data.usageMetadata?.totalTokenCount ?? promptTokens + completionTokens;

  return {
    config: parsed,
    tokensUsed: {
      promptTokens,
      completionTokens,
      totalTokens,
    },
    modelUsed: modelToUse,
  };
}

// ─── Dynamic OpenAI API Call ───────────────────────────────────────────────
async function generateWithOpenAI(
  optimizedPrompt: string,
  category: SiteCategory,
  openaiKey: string,
  modelName?: string
): Promise<AIGenerateResult> {
  const modelToUse = modelName || process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini";

  const userMessage = `
Category: ${category}
Section hints: ${SECTION_HINTS[category]}
User request: ${optimizedPrompt}
Generate the JSON configuration now.
`.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: modelToUse,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1400,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as any;
  const rawJson = data.choices?.[0]?.message?.content;

  if (!rawJson) throw new Error("OpenAI returned empty response");

  const parsed = JSON.parse(rawJson) as SiteConfigJSON;
  if (parsed.meta) parsed.meta.category = category;

  const promptTokens =
    data.usage?.prompt_tokens ?? estimateTokenCount(SYSTEM_PROMPT + userMessage);
  const completionTokens =
    data.usage?.completion_tokens ?? estimateTokenCount(rawJson);
  const totalTokens =
    data.usage?.total_tokens ?? promptTokens + completionTokens;

  return {
    config: parsed,
    tokensUsed: {
      promptTokens,
      completionTokens,
      totalTokens,
    },
    modelUsed: modelToUse,
  };
}
