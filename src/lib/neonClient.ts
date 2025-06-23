import { Pool } from 'pg';

// Neon DB connection
const connectionString = process.env.DATABASE_URL || '';

// Create PostgreSQL pool with additional configuration
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Helps with some SSL certificate issues
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait for a connection to become available
});

// Add error handler to the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Log connection status for debugging
console.log('Database connection string configured:', connectionString ? 'Yes (Found)' : 'No (Missing)');

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection test failed:', err);
  } else {
    console.log('Database connection test successful:', res.rows[0]);
  }
});

// Export types
export type Idea = {
  id?: string;
  created_at?: Date | string;
  title: string;
  description: string;
  flowchart: string;
  user_id?: string;
};

export type TeamProfile = {
  id?: string;
  created_at?: Date | string;
  name: string;
  email: string;
  role: string;
  techStack: string;
  skills: string;
  availability: string[];
  lookingFor: string[];
  githubRepo?: string;
  discordLink?: string;
};