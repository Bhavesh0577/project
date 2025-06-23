import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// GitHub API integration
async function fetchGitHubData(username: string) {
  try {
    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${process.env.GITHUB_API_TOKEN || ''}`,
      }
    });
    
    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status}`);
    }
    
    const userData = await userResponse.json();
    
    // Fetch repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${process.env.GITHUB_API_TOKEN || ''}`,
      }
    });
    
    if (!reposResponse.ok) {
      throw new Error(`GitHub API error: ${reposResponse.status}`);
    }
    
    const reposData = await reposResponse.json();
    
    // Calculate stats
    const languages = new Set();
    let totalStars = 0;
    
    reposData.forEach((repo: any) => {
      if (repo.language) languages.add(repo.language);
      totalStars += repo.stargazers_count;
    });
    
    return {
      repos: reposData.length,
      commits: null, // GitHub API doesn't provide total commits in a simple way
      stars: totalStars,
      languages: Array.from(languages),
      profile: userData
    };
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return null;
  }
}

// Timezone compatibility calculation
function calculateTimezoneCompatibility(userTimezone: string, otherTimezone: string) {
  // Map of timezones to UTC offsets (simplified)
  const timezoneMap: Record<string, number> = {
    'PST': -8, 'PDT': -7,
    'MST': -7, 'MDT': -6,
    'CST': -6, 'CDT': -5,
    'EST': -5, 'EDT': -4,
    'GMT': 0, 'UTC': 0,
    'BST': 1,
    'CET': 1, 'CEST': 2,
    'IST': 5.5,
    'JST': 9,
    'AEST': 10, 'AEDT': 11
  };

  // Default to UTC if timezone not found
  const userOffset = timezoneMap[userTimezone] ?? 0;
  const otherOffset = timezoneMap[otherTimezone] ?? 0;
  
  // Calculate hours difference (absolute)
  const hoursDiff = Math.abs(userOffset - otherOffset);
  
  // Calculate compatibility score (100% for same timezone, decreasing as difference increases)
  return Math.max(0, 100 - (hoursDiff * 8)); // 8 points per hour difference
}

// Skill compatibility calculation
function calculateSkillCompatibility(userSkills: any[], memberSkills: any[]) {
  if (!userSkills.length || !memberSkills.length) return 50; // Default if no skills
  
  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  const memberSkillNames = memberSkills.map(s => s.name.toLowerCase());
  
  let matchCount = 0;
  for (const skill of userSkillNames) {
    if (memberSkillNames.includes(skill)) {
      matchCount++;
    }
  }
  
  const uniqueSkillCount = new Set([...userSkillNames, ...memberSkillNames]).size;
  return Math.round((matchCount / uniqueSkillCount) * 100);
}

// Experience compatibility calculation
function calculateExperienceCompatibility(userSkills: any[], memberSkills: any[]) {
  if (!userSkills.length || !memberSkills.length) return 50; // Default if no skills
  
  const skillLevels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
  
  // Calculate average skill level
  const userAvgLevel = userSkills.reduce((sum, s) => sum + (skillLevels[s.level] || 0), 0) / userSkills.length;
  const memberAvgLevel = memberSkills.reduce((sum, s) => sum + (skillLevels[s.level] || 0), 0) / memberSkills.length;
  
  // Calculate compatibility (closer levels = higher compatibility)
  const levelDiff = Math.abs(userAvgLevel - memberAvgLevel);
  return Math.round(100 - (levelDiff / 3) * 100); // 3 is max possible difference
}

// Interest compatibility calculation
function calculateInterestCompatibility(userInterests: string[], memberInterests: string[]) {
  if (!userInterests.length || !memberInterests.length) return 50; // Default if no interests
  
  let matchCount = 0;
  for (const interest of userInterests) {
    if (memberInterests.includes(interest)) {
      matchCount++;
    }
  }
  
  const uniqueInterestCount = new Set([...userInterests, ...memberInterests]).size;
  return Math.round((matchCount / uniqueInterestCount) * 100);
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // In a real implementation, fetch user profile from database
    // For demo, we'll use a mock user profile
    const userProfile = {
      id: userId,
      name: 'Current User',
      skills: [
        { name: 'React', level: 'Advanced', years: 3 },
        { name: 'TypeScript', level: 'Intermediate', years: 2 },
        { name: 'Node.js', level: 'Intermediate', years: 2 }
      ],
      timezone: 'PST',
      availability: ['weekdays', 'evenings'],
      githubUsername: 'octocat', // Example GitHub username
      interests: ['Web Development', 'Open Source', 'AI/ML']
    };
    
    // Fetch GitHub data for the user
    const userGitHubData = await fetchGitHubData(userProfile.githubUsername);
    
    // Mock team members with real GitHub data integration
    const teamMembers = [
      {
        id: '1',
        name: 'Sarah Chen',
        githubUsername: 'sarahchen',
        skills: [
          { name: 'React', level: 'Expert', years: 5 },
          { name: 'TypeScript', level: 'Advanced', years: 4 },
          { name: 'Node.js', level: 'Advanced', years: 3 }
        ],
        timezone: 'PST',
        availability: ['weekdays', 'evenings'],
        interests: ['Web Development', 'AI/ML', 'Open Source'],
        mentorshipRole: 'mentor'
      },
      {
        id: '2',
        name: 'Alex Rodriguez',
        githubUsername: 'alexr',
        skills: [
          { name: 'Python', level: 'Expert', years: 6 },
          { name: 'Machine Learning', level: 'Advanced', years: 4 },
          { name: 'TensorFlow', level: 'Advanced', years: 3 }
        ],
        timezone: 'EST',
        availability: ['weekdays', 'mornings'],
        interests: ['AI/ML', 'Data Science', 'Research'],
        mentorshipRole: 'mentor'
      },
      {
        id: '3',
        name: 'Emma Thompson',
        githubUsername: 'emmat',
        skills: [
          { name: 'UI/UX Design', level: 'Advanced', years: 3 },
          { name: 'Figma', level: 'Expert', years: 4 },
          { name: 'React', level: 'Intermediate', years: 2 }
        ],
        timezone: 'GMT',
        availability: ['weekdays', 'afternoons'],
        interests: ['Design Systems', 'Frontend', 'Mobile Apps'],
        mentorshipRole: 'peer'
      },
      {
        id: '4',
        name: 'David Kim',
        githubUsername: 'davidk',
        skills: [
          { name: 'JavaScript', level: 'Intermediate', years: 2 },
          { name: 'React', level: 'Beginner', years: 1 },
          { name: 'Node.js', level: 'Beginner', years: 1 }
        ],
        timezone: 'JST',
        availability: ['weekends', 'evenings'],
        interests: ['Web Development', 'Learning', 'Open Source'],
        mentorshipRole: 'mentee'
      }
    ];
    
    // Process each team member with GitHub data and compatibility scores
    const processedMembers = await Promise.all(
      teamMembers.map(async (member) => {
        // Fetch GitHub data
        const githubData = await fetchGitHubData(member.githubUsername) || {
          repos: Math.floor(Math.random() * 30) + 5,
          commits: null,
          stars: Math.floor(Math.random() * 200),
          languages: ['JavaScript', 'TypeScript', 'Python'].slice(0, Math.floor(Math.random() * 3) + 1)
        };
        
        // Calculate compatibility scores
        const technical = calculateSkillCompatibility(userProfile.skills, member.skills);
        const timezone = calculateTimezoneCompatibility(userProfile.timezone, member.timezone);
        const experience = calculateExperienceCompatibility(userProfile.skills, member.skills);
        const interests = calculateInterestCompatibility(userProfile.interests, member.interests);
        
        // Calculate overall match score (weighted average)
        const matchScore = Math.round(
          (technical * 0.4) + (timezone * 0.2) + (experience * 0.25) + (interests * 0.15)
        );
        
        return {
          id: member.id,
          name: member.name,
          skills: member.skills,
          timezone: member.timezone,
          availability: member.availability,
          githubStats: githubData,
          linkedinProfile: `https://linkedin.com/in/${member.name.toLowerCase().replace(' ', '-')}`,
          matchScore,
          compatibility: {
            technical,
            timezone,
            experience,
            interests
          },
          mentorshipRole: member.mentorshipRole,
          projectPreferences: member.interests
        };
      })
    );
    
    // Sort by match score
    const sortedMembers = processedMembers.sort((a, b) => b.matchScore - a.matchScore);
    
    return NextResponse.json({ 
      members: sortedMembers,
      userGitHubData
    });
  } catch (error) {
    console.error('Error in team matching API:', error);
    return NextResponse.json(
      { error: 'Failed to process team matching' },
      { status: 500 }
    );
  }
} 