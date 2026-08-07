import { Router } from "express";
import { authenticateJwt } from "../middleware/auth.js";
import { uploadMedia, listMedia, deleteMedia, uploadMiddleware } from "../controllers/mediaController.js";

const router = Router();

router.use(authenticateJwt);

router.get("/", listMedia);
router.post("/upload", uploadMiddleware, uploadMedia);
router.delete("/:id", deleteMedia);

export default router;
