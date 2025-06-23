import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Define mentorship match types
type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

type TeamMember = {
  id: string;
  name: string;
  skills: { name: string; level: SkillLevel; years: number }[];
  timezone: string;
  availability: string[];
  mentorshipRole: 'mentor' | 'mentee' | 'peer';
  projectPreferences: string[];
};

type MentorshipMatch = {
  mentor: TeamMember;
  mentees: TeamMember[];
  focusAreas: string[];
  sessionSchedule: string[];
  compatibilityScore: number;
};

// Determine optimal mentorship matches
function generateMentorshipMatches(members: TeamMember[]): MentorshipMatch[] {
  const mentors = members.filter(m => m.mentorshipRole === 'mentor');
  const mentees = members.filter(m => m.mentorshipRole === 'mentee');
  
  // For each mentor, find suitable mentees based on skills and experience
  const matches: MentorshipMatch[] = mentors.map(mentor => {
    // Find mentees who have skills that match mentor's expertise
    const suitableMentees = mentees.filter(mentee => 
      mentor.skills.some(mentorSkill => 
        mentee.skills.some(menteeSkill => 
          menteeSkill.name.toLowerCase() === mentorSkill.name.toLowerCase() && 
          getSkillLevelValue(menteeSkill.level) < getSkillLevelValue(mentorSkill.level)
        )
      )
    );
    
    // Calculate focus areas (skills where mentor is Advanced or Expert)
    const focusAreas = mentor.skills
      .filter(skill => skill.level === 'Expert' || skill.level === 'Advanced')
      .map(s => s.name);
    
    // Generate optimal session schedule based on availability
    const sessionSchedule = generateSessionSchedule(mentor, suitableMentees);
    
    // Calculate compatibility score
    const compatibilityScore = calculateMentorshipCompatibility(mentor, suitableMentees);
    
    return {
      mentor,
      mentees: suitableMentees,
      focusAreas,
      sessionSchedule,
      compatibilityScore
    };
  });
  
  // Sort by compatibility score
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

// Helper function to get numeric value for skill level
function getSkillLevelValue(level: SkillLevel): number {
  const values = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
  return values[level];
}

// Generate optimal session schedule based on availability
function generateSessionSchedule(mentor: TeamMember, mentees: TeamMember[]): string[] {
  // Map of days and times
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const times = ['morning', 'afternoon', 'evening'];
  
  // Count availability frequency
  const availabilityCount: Record<string, number> = {};
  
  // Check mentor availability
  const mentorAvail = new Set(mentor.availability);
  const hasMentorWeekdays = mentorAvail.has('weekdays');
  const hasMentorWeekends = mentorAvail.has('weekends');
  const hasMentorMornings = mentorAvail.has('mornings');
  const hasMentorAfternoons = mentorAvail.has('afternoons');
  const hasMentorEvenings = mentorAvail.has('evenings');
  
  // Generate all possible slots
  for (const day of days) {
    const isWeekday = day !== 'Saturday' && day !== 'Sunday';
    
    if ((isWeekday && hasMentorWeekdays) || (!isWeekday && hasMentorWeekends)) {
      for (const time of times) {
        if ((time === 'morning' && hasMentorMornings) ||
            (time === 'afternoon' && hasMentorAfternoons) ||
            (time === 'evening' && hasMentorEvenings)) {
          
          const slot = `${day}s ${time === 'morning' ? '9AM' : time === 'afternoon' ? '2PM' : '7PM'}`;
          availabilityCount[slot] = 1;
          
          // Count mentee availability for this slot
          for (const mentee of mentees) {
            const menteeAvail = new Set(mentee.availability);
            const hasMenteeWeekdays = menteeAvail.has('weekdays');
            const hasMenteeWeekends = menteeAvail.has('weekends');
            const hasMenteeMornings = menteeAvail.has('mornings');
            const hasMenteeAfternoons = menteeAvail.has('afternoons');
            const hasMenteeEvenings = menteeAvail.has('evenings');
            
            if ((isWeekday && hasMenteeWeekdays) || (!isWeekday && hasMenteeWeekends)) {
              if ((time === 'morning' && hasMenteeMornings) ||
                  (time === 'afternoon' && hasMenteeAfternoons) ||
                  (time === 'evening' && hasMenteeEvenings)) {
                availabilityCount[slot]++;
              }
            }
          }
        }
      }
    }
  }
  
  // Sort by availability count and pick top 2
  const sortedSlots = Object.entries(availabilityCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([slot]) => slot);
  
  return sortedSlots.slice(0, 2);
}

// Calculate mentorship compatibility score
function calculateMentorshipCompatibility(mentor: TeamMember, mentees: TeamMember[]): number {
  if (mentees.length === 0) return 0;
  
  // Calculate skill coverage (percentage of mentor's expert skills that match mentee needs)
  const mentorExpertSkills = mentor.skills
    .filter(s => s.level === 'Expert' || s.level === 'Advanced')
    .map(s => s.name.toLowerCase());
  
  if (mentorExpertSkills.length === 0) return 50;
  
  let skillMatchCount = 0;
  for (const mentee of mentees) {
    const menteeBeginnerSkills = mentee.skills
      .filter(s => s.level === 'Beginner' || s.level === 'Intermediate')
      .map(s => s.name.toLowerCase());
    
    for (const skill of menteeBeginnerSkills) {
      if (mentorExpertSkills.includes(skill)) {
        skillMatchCount++;
      }
    }
  }
  
  // Calculate skill coverage score
  const totalPossibleMatches = mentees.length * mentorExpertSkills.length;
  const skillCoverageScore = totalPossibleMatches > 0 
    ? (skillMatchCount / totalPossibleMatches) * 100
    : 50;
  
  return Math.round(skillCoverageScore);
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // In a real implementation, fetch members from API or database
    // For demo, we'll use the same mock data as in the teamMatching API
    const searchParams = request.nextUrl.searchParams;
    const membersParam = searchParams.get('members');
    
    let members: TeamMember[] = [];
    
    if (membersParam) {
      try {
        members = JSON.parse(decodeURIComponent(membersParam));
      } catch (e) {
        console.error('Error parsing members parameter:', e);
      }
    }
    
    // If no members provided, use mock data
    if (!members.length) {
      members = [
        {
          id: '1',
          name: 'Sarah Chen',
          skills: [
            { name: 'React', level: 'Expert', years: 5 },
            { name: 'TypeScript', level: 'Advanced', years: 4 },
            { name: 'Node.js', level: 'Advanced', years: 3 }
          ],
          timezone: 'PST',
          availability: ['weekdays', 'evenings'],
          mentorshipRole: 'mentor',
          projectPreferences: ['Web Development', 'AI/ML', 'Open Source']
        },
        {
          id: '2',
          name: 'Alex Rodriguez',
          skills: [
            { name: 'Python', level: 'Expert', years: 6 },
            { name: 'Machine Learning', level: 'Advanced', years: 4 },
            { name: 'TensorFlow', level: 'Advanced', years: 3 }
          ],
          timezone: 'EST',
          availability: ['weekdays', 'mornings'],
          mentorshipRole: 'mentor',
          projectPreferences: ['AI/ML', 'Data Science', 'Research']
        },
        {
          id: '3',
          name: 'Emma Thompson',
          skills: [
            { name: 'UI/UX Design', level: 'Advanced', years: 3 },
            { name: 'Figma', level: 'Expert', years: 4 },
            { name: 'React', level: 'Intermediate', years: 2 }
          ],
          timezone: 'GMT',
          availability: ['weekdays', 'afternoons'],
          mentorshipRole: 'peer',
          projectPreferences: ['Design Systems', 'Frontend', 'Mobile Apps']
        },
        {
          id: '4',
          name: 'David Kim',
          skills: [
            { name: 'JavaScript', level: 'Intermediate', years: 2 },
            { name: 'React', level: 'Beginner', years: 1 },
            { name: 'Node.js', level: 'Beginner', years: 1 }
          ],
          timezone: 'JST',
          availability: ['weekends', 'evenings'],
          mentorshipRole: 'mentee',
          projectPreferences: ['Web Development', 'Learning', 'Open Source']
        },
        {
          id: '5',
          name: 'Priya Sharma',
          skills: [
            { name: 'Python', level: 'Intermediate', years: 2 },
            { name: 'Machine Learning', level: 'Beginner', years: 1 },
            { name: 'Data Analysis', level: 'Intermediate', years: 3 }
          ],
          timezone: 'IST',
          availability: ['weekdays', 'mornings'],
          mentorshipRole: 'mentee',
          projectPreferences: ['AI/ML', 'Data Science', 'Research']
        }
      ];
    }
    
    // Generate mentorship matches
    const mentorshipMatches = generateMentorshipMatches(members);
    
    return NextResponse.json({ 
      matches: mentorshipMatches
    });
  } catch (error) {
    console.error('Error in mentorship matching API:', error);
    return NextResponse.json(
      { error: 'Failed to process mentorship matching' },
      { status: 500 }
    );
  }
} 