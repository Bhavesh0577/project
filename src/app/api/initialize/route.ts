import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    // Create Ideas table
    await sql`
      CREATE TABLE IF NOT EXISTS "Idea" (
        "id" TEXT PRIMARY KEY,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "flowchart" TEXT NOT NULL,
        "user_id" TEXT
      )
    `;

    // Create TeamMessage table
    await sql`
      CREATE TABLE IF NOT EXISTS "TeamMessage" (
        "id" TEXT PRIMARY KEY,
        "teamId" TEXT NOT NULL,
        "sender" TEXT NOT NULL,
        "senderName" TEXT,
        "message" TEXT NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create TeamProfile table
    await sql`
      CREATE TABLE IF NOT EXISTS "TeamProfile" (
        "id" TEXT PRIMARY KEY,
        "teamId" TEXT UNIQUE NOT NULL,
        "name" TEXT,
        "email" TEXT,
        "role" TEXT,
        "techStack" TEXT,
        "skills" TEXT,
        "availability" JSONB DEFAULT '[]',
        "lookingFor" JSONB DEFAULT '[]',
        "githubRepo" TEXT,
        "discordLink" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert some sample data for testing
    await sql`
      INSERT INTO "TeamMessage" ("id", "teamId", "sender", "senderName", "message", "createdAt")
      VALUES 
        ('msg1', 'team-1', 'user-1', 'Alice', 'Hello team! How is everyone doing?', NOW() - INTERVAL '1 hour'),
        ('msg2', 'team-1', 'user-2', 'Bob', 'Doing great! Working on the frontend.', NOW() - INTERVAL '45 minutes'),
        ('msg3', 'team-1', 'user-3', 'Charlie', 'I just pushed some backend changes. Can someone review?', NOW() - INTERVAL '30 minutes')
      ON CONFLICT ("id") DO NOTHING
    `;

    return NextResponse.json({
      success: true,
      message: 'All database tables initialized'
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
} 