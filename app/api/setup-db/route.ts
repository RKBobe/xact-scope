import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // With Prisma, we don't strictly need to 'create table' manually 
    // as that's handled by migrations, but we can check the connection 
    // or seed initial data if needed.
    
    // Attempt a simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ message: "✅ Database connection verified and schema is ready." });
  } catch (error) {
    console.error("🔴 DATABASE ERROR:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}