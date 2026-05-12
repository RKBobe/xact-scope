import { model } from "@/lib/gemini";
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Check if the server received the text
    const { text } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "No input text provided" }, { status: 400 });
    }
    console.log("🔹 Input received:", text);

    // 2. Send to Gemini
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

    // 3. Clean & Parse: Improved JSON extraction (finds first { and last })
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    
    if (start === -1 || end === -1 || end < start) {
      throw new Error("No valid JSON object found in AI response");
    }
    
    const jsonString = rawText.substring(start, end + 1);
    const data = JSON.parse(jsonString);

    return NextResponse.json(data);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("🔥 CRITICAL SERVER ERROR:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}