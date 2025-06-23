import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const teamId = searchParams.get('teamId');

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  try {
    // Get team profile by teamId
    const { rows } = await sql`
      SELECT * FROM "TeamProfile" 
      WHERE "teamId" = ${teamId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ profile: null });
    }
    
    return NextResponse.json({ profile: rows[0] });
  } catch (error) {
    console.error('Error fetching team profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      teamId, 
      name, 
      email, 
      role, 
      techStack, 
      skills, 
      githubRepo, 
      discordLink 
    } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    try {
      // Check if profile already exists
      const { rows: existingProfiles } = await sql`
        SELECT * FROM "TeamProfile" WHERE "teamId" = ${teamId}
      `;

      if (existingProfiles.length > 0) {
        // Update existing profile
        const { rows } = await sql`
          UPDATE "TeamProfile"
          SET 
            "name" = ${name || null},
            "email" = ${email || null},
            "role" = ${role || null},
            "techStack" = ${techStack || null},
            "skills" = ${skills || null},
            "githubRepo" = ${githubRepo || null},
            "discordLink" = ${discordLink || null}
          WHERE "teamId" = ${teamId}
          RETURNING *
        `;
        
        return NextResponse.json({ success: true, profile: rows[0] });
      } else {
        // Create new profile
        const id = `profile_${Date.now()}`;
        
        const { rows } = await sql`
          INSERT INTO "TeamProfile" (
            "id", "teamId", "name", "email", "role", "techStack", 
            "skills", "githubRepo", "discordLink", "createdAt"
          )
          VALUES (
            ${id}, ${teamId}, ${name || null}, ${email || null}, ${role || null}, 
            ${techStack || null}, ${skills || null}, ${githubRepo || null}, 
            ${discordLink || null}, ${new Date().toISOString()}
          )
          RETURNING *
        `;
        
        return NextResponse.json({ success: true, profile: rows[0] });
      }
    } catch (sqlError) {
      console.error('SQL error saving profile:', sqlError);
      return NextResponse.json(
        { error: 'Failed to save team profile' },
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