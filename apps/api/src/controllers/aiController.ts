import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.js";
import { optimizePrompt, detectCategory, hashPrompt } from "../services/promptOptimizer.js";
import { generateSiteConfig } from "../services/aiService.js";
import { PromptCache } from "../models/PromptCache.js";
import { z } from "zod";

const GenerateSchema = z.object({
  prompt: z.string().min(5, "Prompt must be at least 5 characters").max(500, "Prompt too long"),
  categoryHint: z.string().optional(),
  model: z.string().optional(),
});

export const generateAI = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { prompt, categoryHint, model } = GenerateSchema.parse(req.body);

    // Step 1: Optimize prompt
    const optimized = optimizePrompt(prompt);

    // Step 2: Detect category
    const category = (categoryHint as any) || detectCategory(optimized);

    // Step 3: Check cache (SHA-256 hash)
    const hash = hashPrompt(category, optimized);
    const cached = await PromptCache.findOne({ promptHash: hash });

    if (cached) {
      return res.json({
        success: true,
        message: "Generated from cache",
        data: {
          config: cached.generatedConfig,
          category,
          cached: true,
          tokensUsed: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
          modelUsed: "cache",
        },
      });
    }

    // Step 4: Call LLM (Supports Gemini 2.5 Flash & OpenAI)
    const result = await generateSiteConfig(optimized, category, model);

    // Step 5: Store in cache (non-blocking)
    PromptCache.create({
      promptHash: hash,
      category,
      generatedConfig: result.config,
    }).catch((err) => console.error("Cache store error:", err));

    res.json({
      success: true,
      message: "Site configuration generated successfully",
      data: {
        config: result.config,
        category,
        cached: false,
        tokensUsed: result.tokensUsed,
        modelUsed: result.modelUsed,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: "INVALID_INPUT", message: "Validation failed", details: error.errors },
      });
    }
    res.status(500).json({
      success: false,
      error: { code: "AI_GENERATION_FAILED", message: error.message },
    });
  }
};
