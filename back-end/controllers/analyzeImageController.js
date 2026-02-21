import { analyzeImageWithSymptoms } from "../services/geminiService.js";

/**
 * POST /api/analyze-image
 * multipart/form-data: symptoms (text), image (file)
 */
export async function analyzeImage(req, res, next) {
  try {
    const symptoms = typeof req.body.symptoms === "string" ? req.body.symptoms.trim() : "";
    const image = req.file;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "image file is required (multipart/form-data).",
      });
    }

    const result = await analyzeImageWithSymptoms(symptoms || "Not provided", {
      buffer: image.buffer,
      mimetype: image.mimetype,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
