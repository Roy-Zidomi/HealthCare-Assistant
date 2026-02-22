import { GoogleGenAI } from "@google/genai";
import { MAX_RESPONSE_WORDS } from "../utils/constants.js";
import { parseStructuredResponse } from "../utils/parseGeminiResponse.js";

const SYSTEM_INSTRUCTION = `You are a healthcare information assistant. You provide general, non-diagnostic guidance only.
Rules:
- Never diagnose. Only suggest possible conditions and general advice.
- Keep the entire response under ${MAX_RESPONSE_WORDS} words.
- Always include a clear medical disclaimer.
- Respond ONLY with a valid JSON object (no markdown, no code fence, no extra text) with exactly these keys: condition, severity, advice, doctor_visit, disclaimer.
- severity must be one of: mild, moderate, high.
- Use short, clear sentences.`;

const TEXT_PROMPT_TEMPLATE = (symptoms) =>
  `Based on these symptoms (text only), provide a structured response:\n\nSymptoms: ${symptoms}\n\nRespond with a single JSON object with keys: condition (possible condition, non-diagnostic), severity (mild/moderate/high), advice (home care advice), doctor_visit (when to see a doctor), disclaimer (medical disclaimer).`;

const MULTIMODAL_PROMPT_TEMPLATE = (symptoms) =>
  `The user has provided symptoms (text) and an image. Consider both when answering.\n\nSymptoms: ${
    symptoms || "Not provided"
  }\n\nAnalyze and respond with a single JSON object with keys: condition (possible condition, non-diagnostic), severity (mild/moderate/high), advice (home care advice), doctor_visit (when to see a doctor), disclaimer (medical disclaimer). Keep total response under ${MAX_RESPONSE_WORDS} words.`;

let client = null;

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

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 512,
        temperature: 0.4,
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

  const text = response?.text ?? "";
  return parseStructuredResponse(text);
}

/**
 * Multimodal analysis: symptoms (text) + image
 */
export async function analyzeImageWithSymptoms(symptoms, image) {
  const ai = getClient();
  const base64Image = image.buffer.toString("base64");
  const prompt = MULTIMODAL_PROMPT_TEMPLATE(symptoms);

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
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
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 512,
        temperature: 0.4,
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

  const text = response?.text ?? "";
  return parseStructuredResponse(text);
}
