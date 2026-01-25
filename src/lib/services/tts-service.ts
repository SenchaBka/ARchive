// ElevenLabs integration for Text-to-Speech

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { uploadFile } from "./upload-service";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"; // Rachel voice

/**
 * Generate TTS audio from text using ElevenLabs and upload to S3
 * @param text - The text to convert to speech
 * @param voiceId - Optional voice ID (defaults to Rachel)
 * @returns Promise with the uploaded audio URL
 */
export async function generateTts(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID
): Promise<string> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY environment variable is not set");
  }

  if (!text || text.trim() === "") {
    throw new Error("Text is required for TTS generation");
  }

  // Initialize ElevenLabs client
  const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });

  try {
    // Generate audio using ElevenLabs
    const audioStream = await client.textToSpeech.convert(voiceId, {
      text: text.trim(),
      modelId: "eleven_multilingual_v2",
      outputFormat: "mp3_44100_128",
    });

    // Convert ReadableStream to Buffer
    const reader = audioStream.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    
    const audioBuffer = Buffer.concat(chunks);

    // Upload to S3
    const result = await uploadFile(audioBuffer, "tts-audio");

    return result.url;
  } catch (error: any) {
    console.error("[TTS] Error generating speech:", error);
    throw new Error(`Failed to generate TTS: ${error.message}`);
  }
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices() {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY environment variable is not set");
  }

  const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
  });

  try {
    const voices = await client.voices.getAll();
    return voices.voices;
  } catch (error: any) {
    console.error("[TTS] Error fetching voices:", error);
    throw new Error(`Failed to fetch voices: ${error.message}`);
  }
}
