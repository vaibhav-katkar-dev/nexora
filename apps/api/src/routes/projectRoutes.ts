import { Router } from "express";
import { authenticateJwt } from "../middleware/auth.js";
import {
  listProjects,
  getProject,
  getPublicProject,
  createProject,
  updateProject,
  duplicateProject,
  deleteProject,
} from "../controllers/projectController.js";

const router = Router();

// Public route — view published site by slug (no auth token required)
router.get("/public/:slug", (req, res) => getPublicProject(req as any, res));

// All other project routes require authentication
router.use(authenticateJwt);

router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.post("/:id/duplicate", duplicateProject);
router.delete("/:id", deleteProject);

export default router;
