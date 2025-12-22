import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GEMINI_API_KEY in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// UPDATED: Changed 'gemini-pro' to 'gemini-1.5-flash'
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
