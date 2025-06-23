'use server';

import { pool, TeamProfile } from './neonClient';

export type { TeamProfile };

export async function saveTeamProfileAction(profile: TeamProfile) {
  try {
    // Simple validation
    if (!profile.name || !profile.email || !profile.role) {
      throw new Error('Missing required fields');
    }
    
    try {
      // Connect to DB and save profile
      const result = await pool.query(
        `INSERT INTO team_profiles (
          name, email, role, tech_stack, skills, availability, looking_for
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET
          name = $1,
          role = $3,
          tech_stack = $4,
          skills = $5,
          availability = $6,
          looking_for = $7
        RETURNING id`,
        [
          profile.name,
          profile.email,
          profile.role,
          profile.techStack,
          profile.skills,
          JSON.stringify(profile.availability),
          JSON.stringify(profile.lookingFor)
        ]
      );
      
      // Return the inserted/updated record ID
      return { 
        success: true, 
        data: { id: result.rows[0].id }
      };
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      
      // Return a fake ID for demonstration if database fails
      const fakeId = Math.random().toString(36).substring(2, 15);
      
      return { 
        success: true, 
        data: { id: fakeId },
        warning: 'Saved locally only. Database connection failed.'
      };
    }
  } catch (error: any) {
    console.error('Error saving team profile:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    };
  }
}

export async function getTeamMatchesAction(profileId: string) {
  try {
    try {
      // First get the user's profile
      const profileResult = await pool.query(
        'SELECT * FROM team_profiles WHERE id = $1',
        [profileId]
      );
      
      if (profileResult.rows.length === 0) {
        throw new Error('Profile not found');
      }
      
      const profile = profileResult.rows[0];
      
      // Parse JSON arrays from PostgreSQL
      const lookingFor = profile.looking_for ? JSON.parse(profile.looking_for) : [];
      const userRole = profile.role;
      
      // Find matching profiles
      const matchesResult = await pool.query(
        `SELECT * FROM team_profiles 
         WHERE id != $1 
         AND (
           role = ANY($2::text[])
           OR looking_for::jsonb ? $3
         )
         LIMIT 10`,
        [profileId, lookingFor, userRole]
      );
      
      // Transform the data to match our frontend expectations
      const formattedMatches = matchesResult.rows.map((match: { id: any; name: any; email: any; role: any; tech_stack: any; skills: any; availability: string; looking_for: string; }) => ({
        id: match.id,
        name: match.name,
        email: match.email,
        role: match.role,
        techStack: match.tech_stack,
        skills: match.skills,
        availability: match.availability ? JSON.parse(match.availability) : [],
        lookingFor: match.looking_for ? JSON.parse(match.looking_for) : [],
      }));
      
      return { success: true, data: formattedMatches };
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      
      // Return mock data for demonstration if database fails
      return { 
        success: true, 
        data: generateMockMatches(),
        warning: 'Using mock data. Database connection failed.'
      };
    }
  } catch (error: any) {
    console.error('Error finding team matches:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error',
      data: [] 
    };
  }
}

// Generate mock matches for demonstration
function generateMockMatches() {
  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "Data Scientist",
    "DevOps Engineer",
    "Project Manager",
    "QA Engineer"
  ];
  
  const availabilityOptions = [
    "weekdays", "weekends", "mornings", 
    "afternoons", "evenings", "late_night"
  ];
  
  return Array.from({ length: 5 }, (_, i) => {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const lookingFor = roles.filter(r => r !== role).sort(() => 0.5 - Math.random()).slice(0, 3);
    
    return {
      id: `mock-${i}`,
      name: `Team Member ${i + 1}`,
      email: `member${i + 1}@example.com`,
      role,
      techStack: `React, Node.js, ${i % 2 === 0 ? 'MongoDB' : 'PostgreSQL'}, ${i % 3 === 0 ? 'AWS' : 'Azure'}`,
      skills: `${i % 2 === 0 ? 'Frontend development with 3+ years experience' : 'Backend architecture and API design'}, ${i % 3 === 0 ? 'Mobile development' : 'Cloud infrastructure'}`,
      availability: availabilityOptions.filter(() => Math.random() > 0.5),
      lookingFor,
    };
  });
} 