import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateJwt } from "../middleware/auth.js";
import { generateAI } from "../controllers/aiController.js";

const router = Router();

// AI generation: 10 calls per hour per user
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req: any) => req.user?.userId || req.ip,
  message: {
    success: false,
    error: {
      code: "AI_RATE_LIMIT",
      message: "You have reached the AI generation limit (10/hour). Please try again later.",
    },
  },
});

router.post("/generate", authenticateJwt, aiLimiter, generateAI);

export default router;
