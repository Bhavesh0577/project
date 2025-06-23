-- Create team_profiles table
CREATE TABLE IF NOT EXISTS team_profiles (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  tech_stack TEXT NOT NULL,
  skills TEXT NOT NULL,
  availability JSONB DEFAULT '[]'::JSONB,
  looking_for JSONB DEFAULT '[]'::JSONB
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_profiles_role ON team_profiles(role);
CREATE INDEX IF NOT EXISTS idx_team_profiles_looking_for ON team_profiles USING GIN (looking_for);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  flowchart TEXT NOT NULL,
  user_id TEXT
);

-- Instructions to run this schema:
-- 1. Connect to Neon DB using the connection string:
--    postgresql://neondb_owner:npg_pf1KbgNautc0@ep-little-darkness-a5cdapql-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
-- 2. Run this file with:
--    psql -f schema.sql [CONNECTION_STRING] 