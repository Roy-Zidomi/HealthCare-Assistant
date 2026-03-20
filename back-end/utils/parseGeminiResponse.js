/**
 * Parse Gemini text response into structured JSON.
 * Handles both JSON blocks and plain text fallback.
 */

import { DEFAULT_DISCLAIMER, SEVERITY_LEVELS } from "./constants.js";

const FIELD_ALIASES = {
  condition: [
    "condition",
    "possible_condition",
    "possibleCondition",
    "assessment",
    "kondisi",
    "kemungkinan",
  ],
  severity: [
    "severity",
    "risk",
    "level",
    "tingkat_keparahan",
    "tingkatKeparahan",
  ],
  advice: ["advice", "recommendation", "saran", "home_care", "homeCare"],
  doctor_visit: [
    "doctor_visit",
    "doctorVisit",
    "when_to_see_doctor",
    "whenToSeeDoctor",
    "kapan_ke_dokter",
  ],
  disclaimer: [
    "disclaimer",
    "medical_disclaimer",
    "medicalDisclaimer",
    "catatan",
  ],
};

/**
 * Extract JSON object from response text (handles markdown code blocks)
 * @param {string} text - Raw response from Gemini
 * @returns {Object} Parsed response with condition, severity, advice, doctor_visit, disclaimer
 */
export function parseStructuredResponse(text) {
  if (!text || typeof text !== "string") {
    return fallbackResponse("Invalid or empty response.");
  }

  const trimmed = text.trim().replace(/^\uFEFF/, "");
  const candidates = buildJsonCandidates(trimmed);

  for (const candidate of candidates) {
    const parsed = parseJsonCandidate(candidate);
    if (parsed) {
      return normalizeResponse(parsed);
    }
  }

  const extracted = extractStructuredFields(trimmed);
  if (Object.keys(extracted).length > 0) {
    return normalizeResponse(extracted);
  }

  return fallbackResponse(trimmed.slice(0, 500));
}

function normalizeResponse(parsed) {
  const source =
    parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {};

  const condition = sanitizeTextValue(
    pickString(source, FIELD_ALIASES.condition),
    "condition",
  );
  const severity = normalizeSeverity(pickString(source, FIELD_ALIASES.severity));
  const advice = sanitizeTextValue(pickString(source, FIELD_ALIASES.advice));
  const doctorVisit = sanitizeTextValue(
    pickString(source, FIELD_ALIASES.doctor_visit),
  );
  const disclaimer = sanitizeTextValue(
    pickString(source, FIELD_ALIASES.disclaimer),
  );

  return {
    condition: condition || "Unable to assess from given information",
    severity,
    advice: advice || "Seek professional advice.",
    doctor_visit:
      doctorVisit || "If symptoms persist or worsen, see a doctor.",
    disclaimer: disclaimer || DEFAULT_DISCLAIMER,
  };
}

function fallbackResponse(message) {
  const safeAdvice = buildFallbackAdvice(message);
  return {
    condition: "Unable to assess from given information",
    severity: "mild",
    advice: safeAdvice,
    doctor_visit: "If symptoms persist or worsen, see a doctor.",
    disclaimer: DEFAULT_DISCLAIMER,
  };
}

function buildJsonCandidates(text) {
  const base = stripCodeFence(text);
  const candidates = [base];

  const objectChunk = extractObjectChunk(base);
  if (objectChunk) {
    candidates.push(objectChunk);
  }

  candidates.push(repairJsonLike(base));
  if (objectChunk) {
    candidates.push(repairJsonLike(objectChunk));
  }

  return [...new Set(candidates.map((s) => String(s || "").trim()).filter(Boolean))];
}

function parseJsonCandidate(candidate) {
  try {
    const parsed = JSON.parse(candidate);
    if (Array.isArray(parsed)) {
      const firstObject = parsed.find((item) => item && typeof item === "object");
      return firstObject || null;
    }
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function stripCodeFence(text) {
  const codeFence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return codeFence ? codeFence[1].trim() : text.trim();
}

function extractObjectChunk(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return "";
  }
  return text.slice(start, end + 1).trim();
}

function repairJsonLike(text) {
  return String(text)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)/g, '$1"$2"$3')
    .replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, value) => {
      const escaped = value.replace(/"/g, '\\"');
      return `: "${escaped}"`;
    });
}

function pickString(source, keys) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return "";
}

function normalizeSeverity(rawSeverity) {
  const normalized = String(rawSeverity || "")
    .trim()
    .toLowerCase();

  if (!normalized) return "mild";
  if (SEVERITY_LEVELS.includes(normalized)) return normalized;
  if (["low", "light", "minor", "ringan"].includes(normalized)) return "mild";
  if (["medium", "sedang", "menengah"].includes(normalized)) return "moderate";
  if (["severe", "critical", "urgent", "tinggi", "berat"].includes(normalized))
    return "high";

  return "mild";
}

function extractStructuredFields(text) {
  const source = String(text || "");
  const result = {};

  const condition = extractValueByKeys(source, FIELD_ALIASES.condition);
  const severity = extractValueByKeys(source, FIELD_ALIASES.severity);
  const advice = extractValueByKeys(source, FIELD_ALIASES.advice);
  const doctorVisit = extractValueByKeys(source, FIELD_ALIASES.doctor_visit);
  const disclaimer = extractValueByKeys(source, FIELD_ALIASES.disclaimer);

  if (condition) result.condition = condition;
  if (severity) result.severity = severity;
  if (advice) result.advice = advice;
  if (doctorVisit) result.doctor_visit = doctorVisit;
  if (disclaimer) result.disclaimer = disclaimer;

  return result;
}

function extractValueByKeys(text, keys) {
  for (const key of keys) {
    const escapedKey = escapeRegex(key);
    const patterns = [
      new RegExp(`["']?${escapedKey}["']?\\s*:\\s*"([^"]*)"`, "i"),
      new RegExp(`["']?${escapedKey}["']?\\s*:\\s*'([^']*)'`, "i"),
      new RegExp(`["']?${escapedKey}["']?\\s*:\\s*([^,\\n}\\]]+)`, "i"),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const cleaned = sanitizeTextValue(String(match[1]));
        if (cleaned) return cleaned;
      }
    }
  }
  return "";
}

function buildFallbackAdvice(message) {
  const text = String(message || "").trim();
  if (!text) {
    return "Please provide more details or consult a healthcare provider.";
  }

  const looksLikeBrokenJson =
    text.includes("{") ||
    /"condition"|doctor_visit|disclaimer|severity/i.test(text);

  if (looksLikeBrokenJson) {
    return "Please re-submit your symptoms. The AI response format was invalid.";
  }

  return text;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeTextValue(value, field = "generic") {
  if (value === null || value === undefined) return "";

  let text = String(value)
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  // Remove surrounding quotes/backticks that often appear in malformed JSON.
  text = text.replace(/^["'`]+/, "").replace(/["'`]+$/, "").trim();

  // Remove common trailing JSON artifacts.
  text = text.replace(/[}\],]+$/, "").trim();

  if (!text) return "";

  if (field === "condition") {
    text = text.replace(/^kemungkinan\s+/i, "").trim();
    text = text.replace(/\b(atau|or|dan|and|with|dengan)\s*$/i, "").trim();

    const lettersOnly = text.replace(/[^A-Za-z]/g, "");
    if (lettersOnly.length < 3) return "";
  }

  return text;
}
