'use server'

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";
import { revalidatePath } from "next/cache";
// 1. IMPORT THE ENUM
import { ScopeStatus } from "@prisma/client";

export async function generateScope(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const rawInput = formData.get("rawInput") as string;

  // 2. Use ScopeStatus.PENDING instead of just "PENDING"
  const scope = await prisma.scope.create({
    data: {
      userClerkId: userId,
      rawInput: rawInput,
      status: ScopeStatus.PROCESSING,
    },
  });

  try {
    const prompt = `
      You are an expert insurance adjuster and Xactimate estimator. 
      Analyze the damage description and generate a comprehensive list of Xactimate line items.
      
      You handle ALL trades including: Roofing, Drywall, Painting, Flooring, Siding, Mitigation, Framing, Electrical, and Plumbing.
      
      Input Description: "${rawInput}"
      
      Rules:
      1. Use standard Xactimate codes (e.g., RFG 300, DRY 1/2, PNT P, FCC AV).
      2. Always include waste in your calculations where appropriate (e.g., 10-15% for flooring/roofing).
      3. If dimensions are given (e.g. "12x12 room"), calculate the square footage for the quantity.
      4. Output strictly valid JSON.
      
      Output Format (Array of Objects):
      [
        {
          "category": "Drywall", 
          "xactCode": "DRY 1/2", 
          "description": "Hang and tape 1/2\" drywall", 
          "quantity": 320, 
          "unit": "SF"
        }
      ]
      
      Do not include markdown formatting like \`\`\`json. Just the raw JSON array.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const lineItems = JSON.parse(cleanText);

    for (const item of lineItems) {
      await prisma.lineItem.create({
        data: {
          scopeId: scope.id,
          category: item.category,
          xactCode: item.xactCode,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
        },
      });
    }

    // 3. Use ScopeStatus.COMPLETED
    await prisma.scope.update({
      where: { id: scope.id },
      data: { status: ScopeStatus.COMPLETED },
    });

  } catch (error) {
    console.error("AI Error:", error);
    // 4. Use ScopeStatus.FAILED
    await prisma.scope.update({
      where: { id: scope.id },
      data: { status: ScopeStatus.FAILED },
    });
  }

  revalidatePath("/");
}

export async function deleteScope(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const scopeId = formData.get("scopeId") as string;

  await prisma.$transaction([
    prisma.lineItem.deleteMany({
      where: { scopeId: scopeId }
    }),
    prisma.scope.delete({
      where: { 
        id: scopeId,
        userClerkId: userId 
      }
    })
  ]);

  revalidatePath("/");
}