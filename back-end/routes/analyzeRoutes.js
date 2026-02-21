import { Router } from "express";
import { uploadImage } from "../middleware/upload.js";
import { analyzeImage } from "../controllers/analyzeImageController.js";

const router = Router();

router.post("/", uploadImage.single("image"), analyzeImage);

export default router;
