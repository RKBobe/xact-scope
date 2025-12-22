import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// UPDATED: Using a model explicitly listed in your account
export const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });