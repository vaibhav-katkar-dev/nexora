import { Router } from "express";
import { authenticateJwt } from "../middleware/auth.js";
import { publishProject, listDeployments } from "../controllers/publishController.js";

const router = Router();

router.use(authenticateJwt);

router.post("/:id/publish", publishProject);
router.get("/:id/deployments", listDeployments);

export default router;
