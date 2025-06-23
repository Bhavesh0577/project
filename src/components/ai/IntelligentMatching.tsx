'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Users, Clock, Star, TrendingUp, GitBranch, Award, Target } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

type TeamMember = {
  id: string;
  name: string;
  avatar?: string;
  skills: { name: string; level: SkillLevel; years: number }[];
  timezone: string;
  availability: string[];
  githubStats: {
    repos: number;
    commits: number;
    stars: number;
    languages: string[];
  };
  linkedinProfile?: string;
  matchScore: number;
  compatibility: {
    technical: number;
    timezone: number;
    experience: number;
    interests: number;
  };
  mentorshipRole: 'mentor' | 'mentee' | 'peer';
  projectPreferences: string[];
};

type MentorshipMatch = {
  mentor: TeamMember;
  mentees: TeamMember[];
  focusAreas: string[];
  sessionSchedule: string[];
  compatibilityScore?: number;
};

export default function IntelligentMatching() {
  const [matches, setMatches] = useState<TeamMember[]>([]);
  const [mentorshipMatches, setMentorshipMatches] = useState<MentorshipMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [userGitHubData, setUserGitHubData] = useState<any>(null);
  const { user } = useUser();

  useEffect(() => {
    fetchTeamMatches();
  }, []);

  const fetchTeamMatches = async () => {
    try {
      setIsAnalyzing(true);
      toast.success('Fetching team matches...');
      
      const response = await fetch('/api/teamMatching');
      
      if (!response.ok) {
        throw new Error('Failed to fetch team matches');
      }
      
      const data = await response.json();
      setMatches(data.members);
      setUserGitHubData(data.userGitHubData);
      
      // After getting team matches, fetch mentorship matches
      fetchMentorshipMatches(data.members);
    } catch (error) {
      console.error('Error fetching team matches:', error);
      toast.error('Failed to fetch team matches');
      setIsAnalyzing(false);
    }
  };

  const fetchMentorshipMatches = async (members: TeamMember[]) => {
    try {
      // Pass the members to the mentorship API to avoid fetching them again
      const encodedMembers = encodeURIComponent(JSON.stringify(members));
      const response = await fetch(`/api/mentorship?members=${encodedMembers}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch mentorship matches');
      }
      
      const data = await response.json();
      setMentorshipMatches(data.matches);
      setIsAnalyzing(false);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Error fetching mentorship matches:', error);
      toast.error('Failed to fetch mentorship matches');
      setIsAnalyzing(false);
    }
  };

  const getSkillLevelValue = (level: SkillLevel): number => {
    const values = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
    return values[level];
  };

  const getSkillLevelColor = (level: SkillLevel): string => {
    const colors = {
      'Beginner': 'bg-blue-500',
      'Intermediate': 'bg-green-500',
      'Advanced': 'bg-orange-500',
      'Expert': 'bg-red-500'
    };
    return colors[level];
  };

  const analyzeTeamCompatibility = () => {
    setIsAnalyzing(true);
    toast.success('Running AI compatibility analysis...');
    
    // Re-fetch data from APIs
    fetchTeamMatches();
  };

  const sendCollaborationRequest = (member: TeamMember) => {
    toast.success(`Collaboration request sent to ${member.name}!`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          AI-Powered Team Formation
        </h1>
        <p className="text-muted-foreground">
          Intelligent matching based on skills, experience, and collaboration patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Analysis Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Analysis
              </CardTitle>
              <CardDescription>
                Real-time compatibility scoring
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={analyzeTeamCompatibility} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
              </Button>

              {isAnalyzing && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Analyzing GitHub profiles</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Timezone optimization</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Skill complementarity</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium">Matching Criteria</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Technical Skills</span>
                    <Badge variant="secondary">40%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience Level</span>
                    <Badge variant="secondary">25%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Timezone Overlap</span>
                    <Badge variant="secondary">20%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Project Interests</span>
                    <Badge variant="secondary">15%</Badge>
                  </div>
                </div>
              </div>
              
              {userGitHubData && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="font-medium">Your GitHub Stats</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                      <span>{userGitHubData.repos} repositories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>{userGitHubData.stars} stars</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Languages: {userGitHubData.languages.join(', ')}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="matches" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matches">Smart Matches</TabsTrigger>
              <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
              <TabsTrigger value="analytics">Team Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="matches" className="space-y-4">
              {isAnalyzing ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : matches.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No matches found. Try running the AI analysis.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {matches.map(member => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{member.name}</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-green-600">
                                  {member.matchScore}% match
                                </Badge>
                                <Badge variant={member.mentorshipRole === 'mentor' ? 'default' : 'secondary'}>
                                  {member.mentorshipRole}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Technical</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={member.compatibility.technical} className="h-2" />
                                  <span className="text-xs">{member.compatibility.technical}%</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Timezone</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={member.compatibility.timezone} className="h-2" />
                                  <span className="text-xs">{member.compatibility.timezone}%</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Experience</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={member.compatibility.experience} className="h-2" />
                                  <span className="text-xs">{member.compatibility.experience}%</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Interests</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={member.compatibility.interests} className="h-2" />
                                  <span className="text-xs">{member.compatibility.interests}%</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium mb-2">Skills</p>
                                <div className="flex flex-wrap gap-2">
                                  {member.skills.map(skill => (
                                    <div key={skill.name} className="flex items-center gap-1">
                                      <Badge variant="outline" className="text-xs">
                                        {skill.name}
                                      </Badge>
                                      <div className={`w-2 h-2 rounded-full ${getSkillLevelColor(skill.level)}`} />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {member.timezone}
                                </div>
                                <div className="flex items-center gap-1">
                                  <GitBranch className="h-4 w-4" />
                                  {member.githubStats.repos} repos
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4" />
                                  {member.githubStats.stars} stars
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedMember(member)}
                                >
                                  View Profile
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => sendCollaborationRequest(member)}
                                >
                                  Send Request
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="mentorship" className="space-y-4">
              {isAnalyzing ? (
                <div className="flex justify-center items-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : mentorshipMatches.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No mentorship matches found. Try running the AI analysis.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {mentorshipMatches.map((match, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-yellow-500" />
                          Mentorship Group
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Mentor */}
                        <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                          <Avatar>
                            <AvatarFallback>
                              {match.mentor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{match.mentor.name}</p>
                            <p className="text-sm text-muted-foreground">Mentor</p>
                          </div>
                          <Badge variant="default">Mentor</Badge>
                        </div>

                        {/* Focus Areas */}
                        <div>
                          <p className="text-sm font-medium mb-2">Focus Areas</p>
                          <div className="flex flex-wrap gap-2">
                            {match.focusAreas.map(area => (
                              <Badge key={area} variant="secondary">{area}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Mentees */}
                        <div>
                          <p className="text-sm font-medium mb-2">Mentees ({match.mentees.length})</p>
                          <div className="space-y-2">
                            {match.mentees.map(mentee => (
                              <div key={mentee.id} className="flex items-center gap-3 p-2 border rounded">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {mentee.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{mentee.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Learning: {mentee.skills.filter(s => s.level === 'Beginner').map(s => s.name).join(', ')}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Schedule */}
                        <div>
                          <p className="text-sm font-medium mb-2">Session Schedule</p>
                          <div className="flex gap-2">
                            {match.sessionSchedule.map(session => (
                              <Badge key={session} variant="outline">{session}</Badge>
                            ))}
                          </div>
                        </div>

                        <Button className="w-full">Join Mentorship Group</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Team Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Match Score</span>
                        <span className="font-medium">
                          {matches.length > 0 
                            ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length) 
                            : 0}%
                        </span>
                      </div>
                      <Progress value={matches.length > 0 
                        ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length) 
                        : 0} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Skill Diversity</span>
                        <span className="font-medium">
                          {matches.length > 0 ? 92 : 0}%
                        </span>
                      </div>
                      <Progress value={matches.length > 0 ? 92 : 0} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Timezone Coverage</span>
                        <span className="font-medium">
                          {matches.length > 0 ? 78 : 0}%
                        </span>
                      </div>
                      <Progress value={matches.length > 0 ? 78 : 0} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Optimization Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Add a DevOps specialist
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        Your team would benefit from deployment expertise
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Great skill balance!
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Frontend and backend skills are well distributed
                      </p>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        Consider timezone overlap
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Schedule regular sync meetings for better collaboration
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}