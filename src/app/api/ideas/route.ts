import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/neonClient';
import { auth } from '@clerk/nextjs/server';

// GET /api/ideas - Get all ideas (or filter by user_id)
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required' 
      }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get('user_id');
    
    // Security: Only allow users to fetch their own ideas
    const filterUserId = requestedUserId === userId ? userId : userId;
    
    // Build SQL query
    const queryText = 'SELECT * FROM ideas WHERE user_id = $1 ORDER BY created_at DESC';
    const queryParams = [filterUserId];
    
    // Execute the query
    const result = await pool.query(queryText, queryParams);
    
    return NextResponse.json({ 
      success: true,
      data: result.rows 
    });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch ideas'
    }, { status: 500 });
  }
}

// POST /api/ideas - Create a new idea
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Get the request body
    const { title, description, flowchart } = await request.json();
    
    // Validate required fields
    if (!title || !description || !flowchart) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title, description, and flowchart are required'
      }, { status: 400 });
    }
    
    // Insert the idea with the authenticated user's ID
    const result = await pool.query(
      `INSERT INTO ideas (title, description, flowchart, user_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, flowchart, userId]
    );
    
    // Return the newly created idea
    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create idea'
    }, { status: 500 });
  }
} 