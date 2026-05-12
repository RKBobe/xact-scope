'use server'

import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";

import { headers } from "next/headers"; // To get IP/User Agent

// No 'auth' import needed here!

export async function generateDemoScope(formData: FormData) {
  
  // 1. Get the Input
  const rawInput = formData.get("rawInput") as string;
  if (!rawInput) throw new Error("Input required");

  // 2. LOG THE HIT (Instead of creating a User Scope)
  // We grab the User Agent so you can see if people are on mobile
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'unknown';

  await prisma.demoHit.create({
    data: {
      inputLength: rawInput.length,
      userAgent: userAgent,
      // ipHash: ... (Optional, requires more setup)
    }
  });

  // 3. RUN GEMINI (Same Prompt logic)
  try {
    const prompt = `
      You are an expert insurance adjuster and Xactimate estimator. 
      Analyze the damage description and generate a comprehensive list of Xactimate line items.
      
      Input Description: "${rawInput}"
      
      Rules:
      1. Use standard Xactimate codes (e.g., RFG 300, DRY 1/2).
      2. Always include waste (10-15%).
      3. Output strictly valid JSON Array.
      
      Output Format:
      [
        { "category": "Drywall", "xactCode": "DRY 1/2", "description": "...", "quantity": 0, "unit": "SF" }
      ]
      Do not use markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Improved JSON Extraction: Find the first [ and last ]
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON found in AI response:", text);
      throw new Error("AI failed to return valid line items");
    }

    const lineItems = JSON.parse(jsonMatch[0]);

    // Ensure quantities are numbers for the frontend
    const cleanedItems = lineItems.map((item: any) => ({
      ...item,
      quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) || 0 : item.quantity || 0,
    }));

    // 4. RETURN DATA DIRECTLY
    // (We do NOT save line items to the DB, because this is just a demo view)
    return { success: true, data: cleanedItems };

  } catch (error) {
    console.error("Demo AI Error:", error);
    return { success: false, error: "Failed to generate demo" };
  }
}