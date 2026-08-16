import { Router } from "express";
import { authenticateJwt } from "../middleware/auth.js";
import {
  collectEvent,
  getProjectAnalytics,
  getDashboardSummary,
} from "../controllers/analyticsController.js";

const router = Router();

// Public ingestion endpoint (no auth required, lightweight beacon)
router.post("/collect", collectEvent);

// Protected routes for dashboard charts & metrics
router.use(authenticateJwt);
router.get("/dashboard-summary", getDashboardSummary);
router.get("/project/:projectId", getProjectAnalytics);

export default router;
