import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Check if the server received the text
    const { text } = await request.json();
    console.log("🔹 Input received:", text);

    // 2. Check if the API Key is loaded
    const apiKey ="AIzaSyDyKhmQX9lfOqtAVlijbytdY2pPwATYbRY";

    if (!apiKey) {
      console.error("❌ ERROR: Gemini API Key is missing from .env.local");
      throw new Error("Missing API Key");
    }
    console.log("🔹 API Key status: Loaded");

    // 3. Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // 4. Send to Google
    console.log("🔹 Sending to Gemini...");
    const SYSTEM_PROMPT = `
    You are an expert Xactimate Estimator. Your ONLY job is to convert field notes into valid Xactimate Line Items.
    
    STRICT RULES:
    1. ROOFING:
       - "3 tab" -> SEL: "240"
       - "laminated" / "arch" -> SEL: "300"
       - Default if unspecified -> SEL: "300"
    2. SIDING:
       - "Vinyl" -> CAT: "SDG", SEL: "SIDE"
       - "Hardie" / "Fiber Cement" -> CAT: "SDG", SEL: "FCC"
       - "Wrap" / "Tyvek" -> CAT: "SDG", SEL: "WRAP"
    
    KNOWLEDGE BASE:
    - 3-Tab Shingles -> CAT: RFG, SEL: 240, ACT: R, UNIT: SQ
    - Laminated Shingles -> CAT: RFG, SEL: 300, ACT: R, UNIT: SQ
    - Turtle Vent -> CAT: RFG, SEL: VENTT, ACT: R, UNIT: EA
    - Ridge Vent -> CAT: RFG, SEL: VENTR, ACT: R, UNIT: LF
    - Drip Edge -> CAT: RFG, SEL: DRIP, ACT: R, UNIT: LF
    - Vinyl Siding -> CAT: SDG, SEL: SIDE, ACT: R, UNIT: SQ
    - Fiber Cement Siding -> CAT: SDG, SEL: FCC, ACT: R, UNIT: SQ
    - House Wrap -> CAT: SDG, SEL: WRAP, ACT: R, UNIT: SQ
    
    OUTPUT JSON ONLY. FORMAT:
    {"items": [{"CAT": "...", "SEL": "...", "ACT": "R", "QTY": 0, "UNIT": "...", "DESC": "..."}]}
    `;
    
    const result = await model.generateContent(SYSTEM_PROMPT + "\nUser Input: " + text);
    const response = await result.response;
    const rawText = response.text();
    console.log("🔹 Raw AI Response:", rawText);

    // 5. Clean & Parse
    const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanText);

    return NextResponse.json(data);

  } catch (error: unknown) {
    // FIX: Check if error is real before using it
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.error("🔥 CRITICAL SERVER ERROR:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}