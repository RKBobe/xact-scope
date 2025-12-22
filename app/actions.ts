'use server'

import { prisma } from '@/lib/prisma'
import { model } from '@/lib/gemini' 
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

export async function generateScope(formData: FormData) {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }

  const rawInput = formData.get('rawInput') as string
  
  if (!rawInput) {
    throw new Error('Input is required')
  }

  // 1. Find or create User
  let userProfile = await prisma.userProfile.findUnique({
    where: { clerkId: userId },
  })

  if (!userProfile) {
    userProfile = await prisma.userProfile.create({
      data: { clerkId: userId, email: "user@example.com" }, 
    })
  }

  // 2. Create Scope
  const scope = await prisma.scope.create({
    data: {
      userClerkId: userId,
      rawInput,
      status: 'PROCESSING',
    },
  })

  try {
    const prompt = `
      You are an expert insurance adjuster and Xactimate estimator.
      Analyze the following damage description and generate a list of Xactimate line items.
      
      Input Description: "${rawInput}"
      
      Output strictly in this JSON format (array of objects):
      [
        {
          "category": "Roofing", 
          "xactCode": "RFG 300", 
          "description": "Remove and replace 3 tab shingle", 
          "quantity": 15, 
          "unit": "SQ"
        }
      ]
      
      Do not include markdown formatting like \`\`\`json. Just the raw JSON array.
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Debugging logs
    console.log("👇👇👇 GEMINI RAW RESPONSE 👇👇👇")
    console.log(responseText)
    console.log("👆👆👆 END RESPONSE 👆👆👆")

    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim()
    const lineItems = JSON.parse(cleanJson)

    // 3. Save Line Items
    for (const item of lineItems) {
      await prisma.lineItem.create({
        data: {
          scopeId: scope.id,
          category: item.category,
          xactCode: item.xactCode,
          description: item.description,
          quantity: Number(item.quantity),
          unit: item.unit,
        },
      })
    }

    await prisma.scope.update({
      where: { id: scope.id },
      data: { status: 'COMPLETED' },
    })

    // Refresh the page
    revalidatePath('/')
    
    // REMOVED: return { success: true ... } 
    // We return nothing (void) to make the HTML Form happy.

  } catch (error) {
    console.error("AI Error:", error)
    await prisma.scope.update({
      where: { id: scope.id },
      data: { status: 'FAILED' },
    })
    // REMOVED: return { success: false ... }
  }
}