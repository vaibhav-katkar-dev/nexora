import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateJwt } from "../middleware/auth.js";
import {
  addDomain,
  listDomains,
  getDomain,
  verifyDomain,
  setPrimaryDomain,
  deleteDomain,
} from "../controllers/domainController.js";

const router = Router();

// Rate limiter: max 15 domain creations per 15 minutes
const domainAddLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many domain creation attempts. Please try again in a few minutes.",
    },
  },
});

// Rate limiter: max 30 domain verification checks per 15 minutes
const domainVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many verification requests. Please wait a moment before trying again.",
    },
  },
});

// Require JWT Authentication for domain management
router.use(authenticateJwt);

router.post("/", domainAddLimiter, addDomain);
router.get("/", listDomains);
router.get("/:id", getDomain);
router.post("/:id/verify", domainVerifyLimiter, verifyDomain);
router.post("/:id/primary", setPrimaryDomain);
router.delete("/:id", deleteDomain);

export default router;
