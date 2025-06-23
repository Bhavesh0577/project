import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  try {
    // Get messages for the specified team using direct SQL
    const { rows } = await sql`
      SELECT * FROM "TeamMessage" 
      WHERE "teamId" = ${teamId} 
      ORDER BY "createdAt" ASC
    `;
    
    return NextResponse.json({ messages: rows });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, sender, senderName, message } = body;

    if (!teamId || !sender || !message) {
      return NextResponse.json(
        { error: 'Team ID, sender, and message are required' },
        { status: 400 }
      );
    }

    try {
      // Generate a unique ID
      const id = `msg_${Date.now()}`;
      const createdAt = new Date().toISOString();
      
      // Create a new message using direct SQL
      const { rows } = await sql`
        INSERT INTO "TeamMessage" ("id", "teamId", "sender", "senderName", "message", "createdAt") 
        VALUES (${id}, ${teamId}, ${sender}, ${senderName || null}, ${message}, ${createdAt}) 
        RETURNING *
      `;
      
      return NextResponse.json({ success: true, message: rows[0] });
    } catch (sqlError) {
      console.error('SQL error creating message:', sqlError);
      return NextResponse.json(
        { error: 'Failed to create message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 