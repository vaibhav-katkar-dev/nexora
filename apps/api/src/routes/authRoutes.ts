import { Router } from "express";
import { register, login, refreshToken, logout, me } from "../controllers/authController.js";
import { authenticateJwt } from "../middleware/auth.js";
import rateLimit from "express-rate-limit";

const router = Router();

// Strict Auth Rate Limiter (5 requests per 15 minutes per IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_AUTH_ATTEMPTS",
      message: "Too many login/registration attempts, please try again in 15 minutes.",
    },
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/me", authenticateJwt, me);

export default router;
