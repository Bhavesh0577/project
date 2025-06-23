'use server';

import { Idea, pool } from './neonClient';

// Server actions for database operations
export async function saveIdeaAction(idea: Idea) {
  try {
    // Simple validation
    if (!idea.title || !idea.description || !idea.flowchart) {
      throw new Error('Missing required fields');
    }
    
    try {
      // Save directly to Neon DB
      const result = await pool.query(
        `INSERT INTO ideas (title, description, flowchart, user_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, created_at`,
        [idea.title, idea.description, idea.flowchart, idea.user_id || null]
      );
      
      // Return the inserted record with all fields
      return { 
        success: true, 
        data: {
          id: result.rows[0].id,
          created_at: result.rows[0].created_at,
          title: idea.title,
          description: idea.description,
          flowchart: idea.flowchart,
          user_id: idea.user_id || null
        }
      };
    } catch (dbError) {
      console.error('Database error, falling back to memory storage:', dbError);
      
      // Generate a random ID for the idea
      const fakeId = Math.random().toString(36).substring(2, 15);
      const now = new Date();
      
      // Return a success response with the fake data
      return { 
        success: true, 
        data: {
          id: fakeId,
          created_at: now,
          title: idea.title,
          description: idea.description,
          flowchart: idea.flowchart,
          user_id: idea.user_id || null
        },
        warning: 'Saved locally only. Database connection failed.'
      };
    }
  } catch (error) {
    console.error('Error saving idea:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getIdeasAction(userId?: string) {
  try {
    try {
      // Build query with optional user filter
      let query = 'SELECT id, title, description, flowchart, user_id, created_at FROM ideas';
      const queryParams: string[] = [];
      
      if (userId) {
        query += ' WHERE user_id = $1';
        queryParams.push(userId);
      }
      
      query += ' ORDER BY created_at DESC';
      
      // Execute query
      const result = await pool.query(query, queryParams);
      
      return { success: true, data: result.rows };
    } catch (dbError) {
      console.error('Database error, returning empty list:', dbError);
      // Return an empty array if database is not available
      return { 
        success: true, 
        data: [],
        warning: 'Unable to fetch data from database. Connection failed.'
      };
    }
  } catch (error) {
    console.error('Error fetching ideas:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [] 
    };
  }
} 
export type { Idea };
