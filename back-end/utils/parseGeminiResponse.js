/**
 * Parse Gemini text response into structured JSON.
 * Handles both JSON blocks and plain text fallback.
 */

import { DEFAULT_DISCLAIMER } from "./constants.js";

/**
 * Extract JSON object from response text (handles markdown code blocks)
 * @param {string} text - Raw response from Gemini
 * @returns {Object} Parsed response with condition, severity, advice, doctor_visit, disclaimer
 */
export function parseStructuredResponse(text) {
  if (!text || typeof text !== "string") {
    return fallbackResponse("Invalid or empty response.");
  }

  const trimmed = text.trim();

  // Try to extract JSON from markdown code block if present
  const jsonBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonBlockMatch ? jsonBlockMatch[1].trim() : trimmed;

  try {
    const parsed = JSON.parse(jsonStr);
    return normalizeResponse(parsed);
  } catch {
    // Fallback: try to find JSON object in text
    const objectMatch = trimmed.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        const parsed = JSON.parse(objectMatch[0]);
        return normalizeResponse(parsed);
      } catch {
        // ignore
      }
    }
    return fallbackResponse(trimmed.slice(0, 500));
  }
}

function normalizeResponse(parsed) {
  return {
    condition: String(parsed.condition ?? "").trim() || "Unable to assess",
    severity: String(parsed.severity ?? "").trim().toLowerCase() || "mild",
    advice: String(parsed.advice ?? "").trim() || "Seek professional advice.",
    doctor_visit: String(parsed.doctor_visit ?? "").trim() || "When symptoms persist or worsen.",
    disclaimer: String(parsed.disclaimer ?? "").trim() || DEFAULT_DISCLAIMER,
  };
}

function fallbackResponse(message) {
  return {
    condition: "Unable to assess from given information",
    severity: "mild",
    advice: message || "Please provide more details or consult a healthcare provider.",
    doctor_visit: "If symptoms persist or worsen, see a doctor.",
    disclaimer: DEFAULT_DISCLAIMER,
  };
}
