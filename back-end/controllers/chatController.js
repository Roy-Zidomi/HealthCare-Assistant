import { analyzeSymptoms } from "../services/geminiService.js";

/**
 * POST /api/chat
 * Body: { symptoms: string }
 */
export async function chat(req, res, next) {
  try {
    const { symptoms } = req.body;

    if (!symptoms || typeof symptoms !== "string") {
      return res.status(400).json({
        success: false,
        error: "symptoms (string) is required in request body.",
      });
    }

    const trimmed = symptoms.trim();
    if (!trimmed) {
      return res.status(400).json({
        success: false,
        error: "symptoms cannot be empty.",
      });
    }

    const result = await analyzeSymptoms(trimmed);
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}
