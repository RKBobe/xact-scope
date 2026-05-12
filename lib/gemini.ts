import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// UPDATED: Using a model explicitly listed in your account
// Using 'gemini-3.1-pro-preview' as per the 2026 mandate.
export const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });