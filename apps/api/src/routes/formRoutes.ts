import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateJwt } from "../middleware/auth.js";
import {
  submitForm,
  getResponses,
  updateResponse,
  deleteResponse,
  exportCsv,
} from "../controllers/formController.js";

const router = Router();

// Dedicated rate limiter for public form submissions (max 20 submissions per 10 mins per IP)
const formSubmitLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many submissions from this IP, please try again shortly.",
    },
  },
});

// Public submission route
router.post("/submit/:slugOrId", formSubmitLimiter, submitForm);

// Protected routes for dashboard management
router.use(authenticateJwt);
router.get("/responses", getResponses);
router.get("/responses/export", exportCsv);
router.patch("/responses/:id", updateResponse);
router.delete("/responses/:id", deleteResponse);

export default router;
