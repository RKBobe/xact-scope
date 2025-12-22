import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Check if the variable even exists
    const hasUrl = !!process.env.POSTGRES_URL;
    console.log(`[DEBUG] POSTGRES_URL is ${hasUrl ? "LOADED" : "MISSING"}`);

    // 2. Attempt the query
    await sql`
      CREATE TABLE IF NOT EXISTS user_usage (
        user_id TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return NextResponse.json({ message: "✅ Database table created successfully" });
  } catch (error) {
    // 3. Force the real error into the terminal
    console.error("🔴 CONNECTION ERROR:", error);
    
    // Safely cast error to access the message property
    const errorMessage = (error as Error).message;
    console.error("🔴 ERROR MESSAGE:", errorMessage);
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}