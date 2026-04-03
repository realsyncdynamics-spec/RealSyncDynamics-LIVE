import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API with the API key from environment variables
// The key is injected via Vite's define in vite.config.ts
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not defined. AI features will be disabled.");
}

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const getGeminiModel = (modelName: string = "gemini-3-flash-preview") => {
  if (!ai) {
    throw new Error("Gemini API is not initialized. Please check your GEMINI_API_KEY.");
  }
  return ai.models.get({ model: modelName });
};
