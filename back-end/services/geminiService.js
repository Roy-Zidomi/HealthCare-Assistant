import { GoogleGenAI, Type } from "@google/genai";
import { MAX_RESPONSE_WORDS } from "../utils/constants.js";
import { parseStructuredResponse } from "../utils/parseGeminiResponse.js";

const SYSTEM_INSTRUCTION = `You are a healthcare information assistant. You provide general, non-diagnostic guidance only.
Rules:
- Never diagnose. Only suggest possible conditions and general advice.
- Keep the entire response under ${MAX_RESPONSE_WORDS} words.
- Always include a clear medical disclaimer.
- Respond ONLY with a valid JSON object (no markdown, no code fence, no extra text) with exactly these keys: condition, severity, advice, doctor_visit, disclaimer.
- severity must be one of: mild, moderate, high.
- Use the same language as the user's input.
- Do not return "Unable to assess" unless the symptom description is empty or unrelated to health.
- Use short, clear sentences.`;

const TEXT_PROMPT_TEMPLATE = (symptoms) =>
  `Based on these symptoms (text only), provide a structured response:\n\nSymptoms: ${symptoms}\n\nRespond with a single JSON object with keys: condition (possible condition, non-diagnostic), severity (mild/moderate/high), advice (home care advice), doctor_visit (when to see a doctor), disclaimer (medical disclaimer).`;

const MULTIMODAL_PROMPT_TEMPLATE = (symptoms) =>
  `The user has provided symptoms (text) and an image. Consider both when answering.\n\nSymptoms: ${
    symptoms || "Not provided"
  }\n\nRespond with a single minified JSON object using keys: condition,severity,advice,doctor_visit,disclaimer.\nConstraints: condition <= 8 words, advice <= 35 words, doctor_visit <= 25 words, disclaimer <= 18 words.\nNever add markdown or extra keys.`;

let client = null;
const FALLBACK_CONDITION = "Unable to assess from given information";
const DEFAULT_ADVICE = "Seek professional advice.";
const DEFAULT_DOCTOR_VISIT = "If symptoms persist or worsen, see a doctor.";
const MAX_ATTEMPTS = 3;
const GENERATION_PRESETS = {
  text: { maxOutputTokens: 768, temperature: 0.3, thinkingBudget: 0 },
  textRetry: { maxOutputTokens: 1024, temperature: 0.0, thinkingBudget: 0 },
  multimodal: { maxOutputTokens: 1536, temperature: 0.2, thinkingBudget: 0 },
  multimodalRetry: { maxOutputTokens: 3072, temperature: 0.0, thinkingBudget: 0 },
};
const STRUCTURED_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    condition: { type: Type.STRING },
    severity: {
      type: Type.STRING,
      enum: ["mild", "moderate", "high"],
    },
    advice: { type: Type.STRING },
    doctor_visit: { type: Type.STRING },
    disclaimer: { type: Type.STRING },
  },
  required: ["condition", "severity", "advice", "doctor_visit", "disclaimer"],
};

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment.");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/**
 * Chat (text-only) analysis from symptoms
 */
export async function analyzeSymptoms(symptoms) {
  const ai = getClient();
  const prompt = TEXT_PROMPT_TEMPLATE(symptoms);
  const result = await generateAndParseStructured(ai, prompt, {
    multimodal: false,
  });
  return result;
}

/**
 * Multimodal analysis: symptoms (text) + image
 */
export async function analyzeImageWithSymptoms(symptoms, image) {
  const ai = getClient();
  const base64Image = image.buffer.toString("base64");
  const prompt = MULTIMODAL_PROMPT_TEMPLATE(symptoms);
  const result = await generateAndParseStructured(
    ai,
    [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: image.mimetype,
              data: base64Image,
            },
          },
        ],
      },
    ],
    { multimodal: true },
  );
  return result;
}

async function generateAndParseStructured(ai, contents, options = {}) {
  const multimodal = Boolean(options.multimodal);
  const retryContents = buildRetryContents(contents);
  let lastParsed = parseStructuredResponse("");
  let lastRawText = "";
  let lastFinishReason = "unknown";

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const generationPreset = getGenerationPreset(multimodal, attempt > 0);
    const attemptContents = attempt === 0 ? contents : retryContents;

    const response = await generateWithHandling(ai, attemptContents, {
      ...generationPreset,
    });
    const text = extractResponseText(response);
    const parsed = parseStructuredResponse(text);
    const finishReason = response?.candidates?.[0]?.finishReason || "unknown";

    lastParsed = parsed;
    lastRawText = text;
    lastFinishReason = finishReason;

    if (!shouldRetryForMalformedOutput(parsed, text, finishReason)) {
      return parsed;
    }

    if (attempt < MAX_ATTEMPTS - 1) {
      console.warn(
        "[Gemini structured retry] malformed output attempt:",
        JSON.stringify({
          attempt: attempt + 1,
          finishReason,
          textPreview: text.slice(0, 220),
        }),
      );
    }
  }

  console.warn(
    "[Gemini structured retry] exhausted attempts:",
    JSON.stringify({
      finishReason: lastFinishReason,
      textPreview: lastRawText.slice(0, 220),
    }),
  );

  return lastParsed;
}

async function generateWithHandling(ai, contents, configOverrides = {}) {
  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: STRUCTURED_RESPONSE_SCHEMA,
        maxOutputTokens: 1024,
        temperature: 0.2,
        thinkingConfig: {
          includeThoughts: false,
          thinkingBudget: 0,
        },
        ...configOverrides,
      },
    });
  } catch (err) {
    console.log("FULL ERROR:", err); // DEBUG ERROR ASLI

    const msg = err?.message ?? String(err);
    const errorStr = String(err);

    if (
      msg.includes("429") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("quota") ||
      errorStr.includes("429")
    ) {
      let retryMessage = "Please try again in a few minutes.";

      if (errorStr.includes("retry") || errorStr.includes("RetryInfo")) {
        const retryMatch = errorStr.match(
          /retry.*?(\d+)\s*(?:s|second|minute)/i,
        );
        if (retryMatch) {
          retryMessage = `Please try again in ${retryMatch[1]} seconds.`;
        }
      }

      throw new Error(
        `AI service quota exceeded. ${retryMessage} If this persists, consider upgrading your Gemini API plan.`,
      );
    }

    if (msg.includes("API key") || msg.includes("401") || msg.includes("403")) {
      throw new Error(
        "AI service configuration error. Please check your API key.",
      );
    }

    throw err;
  }

  return response;
}

function extractResponseText(response) {
  if (typeof response?.text === "string" && response.text.trim()) {
    return response.text.trim();
  }

  const parts = response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const joined = parts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("\n")
      .trim();
    if (joined) return joined;
  }

  return "";
}

function shouldRetryForMalformedOutput(parsed, rawText, finishReason = "unknown") {
  const raw = String(rawText || "");
  const reason = String(finishReason || "unknown").toUpperCase();
  const isFallbackCondition = parsed?.condition === FALLBACK_CONDITION;
  const normalizedCondition = String(parsed?.condition || "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
  const looksCorruptCondition =
    normalizedCondition.length > 0 && normalizedCondition.length < 3;
  const looksIncompleteCondition =
    /\b(atau|or|dan|and|with|dengan)\s*$/i.test(normalizedCondition);
  const looksLikeDefaultFallbackBody =
    parsed?.advice === DEFAULT_ADVICE &&
    parsed?.doctor_visit === DEFAULT_DOCTOR_VISIT;
  const hasStructuredMarkers =
    raw.includes("{") ||
    /condition|severity|doctor_visit|disclaimer|advice/i.test(raw);
  const hasMeaningfulRaw = raw.length >= 20;

  if (reason === "MAX_TOKENS") return true;

  return (
    isFallbackCondition ||
    looksCorruptCondition ||
    looksIncompleteCondition ||
    (looksLikeDefaultFallbackBody && (hasStructuredMarkers || hasMeaningfulRaw))
  );
}

function getGenerationPreset(multimodal, isRetry) {
  if (multimodal) {
    return isRetry ? GENERATION_PRESETS.multimodalRetry : GENERATION_PRESETS.multimodal;
  }
  return isRetry ? GENERATION_PRESETS.textRetry : GENERATION_PRESETS.text;
}

function buildRetryContents(contents) {
  const retryHint =
    "Retry and return valid minified JSON only with keys: condition,severity,advice,doctor_visit,disclaimer.";

  if (typeof contents === "string") {
    return `${contents}\n\n${retryHint}`;
  }

  if (Array.isArray(contents)) {
    return contents.map((item, index) => {
      if (
        index === 0 &&
        item &&
        Array.isArray(item.parts) &&
        item.parts.length > 0 &&
        typeof item.parts[0]?.text === "string"
      ) {
        return {
          ...item,
          parts: [{ text: `${item.parts[0].text}\n\n${retryHint}` }, ...item.parts.slice(1)],
        };
      }
      return item;
    });
  }

  return contents;
}
