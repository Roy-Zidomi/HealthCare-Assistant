import { Router } from "express";
import chatRoutes from "./chatRoutes.js";
import analyzeRoutes from "./analyzeRoutes.js";

const router = Router();

router.use("/chat", chatRoutes);
router.use("/analyze-image", analyzeRoutes);

export default router;
