import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { hash } from 'bcrypt';

export async function GET() {
  try {
    console.log('Starting database setup...');
    
    // Create TeamMessage table if it doesn't exist
    try {
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
      console.log('TeamMessage table created or already exists');
    } catch (error) {
      console.error('Error creating TeamMessage table:', error);
      throw error;
    }

    // Create TeamProfile table if it doesn't exist
    try {
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
      console.log('TeamProfile table created or already exists');
    } catch (error) {
      console.error('Error creating TeamProfile table:', error);
      throw error;
    }

    // Drop and recreate ideas table to ensure correct schema
    try {
      await sql`DROP TABLE IF EXISTS ideas`;
      console.log('Dropped ideas table if it existed');
      
      // Create ideas table with consistent lowercase column names
      await sql`
        CREATE TABLE ideas (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          flowchart TEXT NOT NULL,
          user_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('Ideas table created successfully');
    } catch (error) {
      console.error('Error recreating ideas table:', error);
      throw error;
    }

    // Create users table for authentication
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT,
          image TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('Users table created or already exists');
      
      // Create a demo user with hashed password (password: "password123")
      const hashedPassword = await hash("password123", 10);
      
      await sql`
        INSERT INTO users (id, name, email, password, image)
        SELECT 
          'user-001', 
          'Demo User', 
          'demo@example.com', 
          ${hashedPassword},
          'https://ui-avatars.com/api/?name=Demo+User'
        WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@example.com')
      `;
      console.log('Demo user created if not exists');
    } catch (error) {
      console.error('Error setting up users table or demo user:', error);
      throw error;
    }

    // Add some sample ideas
    try {
      await sql`
        INSERT INTO ideas (title, description, flowchart)
        SELECT 
          'AI Hackathon Helper', 
          'A platform to help teams generate ideas, form teams, and collaborate for hackathons.', 
          '{"nodes":[{"id":"1","position":{"x":100,"y":100},"data":{"label":"AI Helper"}}],"edges":[]}'
        WHERE NOT EXISTS (SELECT 1 FROM ideas LIMIT 1)
      `;
      console.log('Sample idea added if not exists');
    } catch (error) {
      console.error('Error adding sample ideas:', error);
      throw error;
    }

    console.log('Database setup completed successfully');
    return NextResponse.json({ success: true, message: 'Database tables initialized' });
  } catch (error) {
    console.error('Error setting up database:', error);
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: 'Failed to set up database tables', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}