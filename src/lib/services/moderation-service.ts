// Content moderation service using Google Gemini API
// Filters out extreme content (nudity, violence, gore) but allows profanity

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

export interface ModerationResult {
  allowed: boolean;
  reasons: string[];
  flaggedContent: {
    text?: boolean;
    image?: boolean;
  };
}

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Model to use - gemini-2.0-flash has good free tier limits
const GEMINI_MODEL = "gemini-2.5-pro";

// Safety settings - we're building our own moderation logic, so we set these to be permissive
// The actual filtering happens in our prompts
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const TEXT_MODERATION_PROMPT = `You are a strict content moderation assistant. Analyze the following text and determine if it contains harmful content.

BLOCK the content if it contains ANY of the following:
- ANY sexual references involving children or minors (including slang like "fuck kids", "screw children", etc.)
- ANY content that could be interpreted as promoting harm to children
- Content promoting or glorifying pedophilia in any form
- Detailed instructions for violence, terrorism, or mass harm
- Content promoting or glorifying genocide, ethnic cleansing, or mass murder
- Explicit threats of violence against specific individuals or groups
- Content promoting self-harm or suicide with specific instructions
- Repeated offensive phrases that target vulnerable groups (children, disabled, etc.)

ALLOW content that contains:
- Swear words or profanity directed at adults (e.g., "fuck you", "asshole")
- General adult themes or discussions between adults
- Dark humor that does NOT target children
- Political opinions (even controversial ones)
- Heated discussions or arguments between adults
- Insults or offensive language NOT targeting children or promoting child harm

IMPORTANT: When in doubt about content involving children, BLOCK IT. Child safety is the top priority.

Respond with a JSON object in this exact format (no markdown, just raw JSON):
{"blocked": true/false, "reason": "explanation if blocked, empty string if allowed"}

Text to analyze:
`;

const IMAGE_MODERATION_PROMPT = `You are a content moderation assistant. Analyze this image and determine if it contains EXTREMELY harmful content.

BLOCK the image ONLY if it contains:
- Full nudity or explicit sexual content
- Gore, graphic violence, or mutilated bodies
- Child exploitation or CSAM
- Explicit depictions of torture or extreme violence
- Real-world terrorist acts or mass casualty events

DO NOT block images that contain:
- Artistic nudity (sculptures, classical art)
- Violence in movies, games, or art
- Mild or moderate violence
- People in swimwear or revealing clothing
- Dark or edgy artistic content
- Memes (even offensive ones)

Respond with a JSON object in this exact format (no markdown, just raw JSON):
{"blocked": true/false, "reason": "explanation if blocked, empty string if allowed"}`;

/**
 * Moderate text content using Gemini
 */
export async function moderateText(text: string): Promise<ModerationResult> {
  if (!text || text.trim() === "") {
    return { allowed: true, reasons: [], flaggedContent: {} };
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("[Moderation] No GEMINI_API_KEY set, skipping moderation");
    return { allowed: true, reasons: [], flaggedContent: {} };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      safetySettings,
    });

    const prompt = TEXT_MODERATION_PROMPT + text;
    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // Parse the JSON response
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const moderationResult = JSON.parse(cleanedResponse);

    if (moderationResult.blocked) {
      return {
        allowed: false,
        reasons: [moderationResult.reason || "Content flagged by moderation"],
        flaggedContent: { text: true },
      };
    }

    return { allowed: true, reasons: [], flaggedContent: {} };
  } catch (error) {
    console.error("[Moderation] Text moderation error:", error);
    // On error, allow the content but log the issue
    return { allowed: true, reasons: [], flaggedContent: {} };
  }
}

/**
 * Moderate image content using Gemini Vision
 */
export async function moderateImage(
  imageBase64: string,
  mimeType: string
): Promise<ModerationResult> {
  if (!imageBase64) {
    return { allowed: true, reasons: [], flaggedContent: {} };
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("[Moderation] No GEMINI_API_KEY set, skipping moderation");
    return { allowed: true, reasons: [], flaggedContent: {} };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      safetySettings,
    });

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    };

    const result = await model.generateContent([IMAGE_MODERATION_PROMPT, imagePart]);
    const response = result.response;
    const responseText = response.text();

    // Parse the JSON response
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, "").trim();
    const moderationResult = JSON.parse(cleanedResponse);

    if (moderationResult.blocked) {
      return {
        allowed: false,
        reasons: [moderationResult.reason || "Image flagged by moderation"],
        flaggedContent: { image: true },
      };
    }

    return { allowed: true, reasons: [], flaggedContent: {} };
  } catch (error) {
    console.error("[Moderation] Image moderation error:", error);
    // On error, allow the content but log the issue
    return { allowed: true, reasons: [], flaggedContent: {} };
  }
}

/**
 * Moderate both text and image content
 */
export async function moderateContent(
  text?: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<ModerationResult> {
  const results: ModerationResult[] = [];

  // Run text and image moderation in parallel if both are provided
  const promises: Promise<ModerationResult>[] = [];

  if (text && text.trim() !== "") {
    promises.push(moderateText(text));
  }

  if (imageBase64 && imageMimeType) {
    promises.push(moderateImage(imageBase64, imageMimeType));
  }

  if (promises.length === 0) {
    return { allowed: true, reasons: [], flaggedContent: {} };
  }

  const moderationResults = await Promise.all(promises);

  // Combine results
  const combined: ModerationResult = {
    allowed: true,
    reasons: [],
    flaggedContent: {},
  };

  for (const result of moderationResults) {
    if (!result.allowed) {
      combined.allowed = false;
      combined.reasons.push(...result.reasons);
      combined.flaggedContent = {
        ...combined.flaggedContent,
        ...result.flaggedContent,
      };
    }
  }

  return combined;
}
