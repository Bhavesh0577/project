'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { AlertCircle, Check, Search, UserPlus, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type TeamData = {
  id: string;
  name: string;
  members: number;
  maxMembers: number;
  skills: string[];
  description: string;
  matchScore: number;
  openRoles: string[];
  projectIdea?: string;
  lookingFor: string[];
  createdAt: string;
};

// Sample teams for demonstration
const DEMO_TEAMS: TeamData[] = [
  {
    id: 'team-1',
    name: 'Hackflow Team',
    members: 3,
    maxMembers: 5,
    skills: ['React', 'TypeScript', 'Next.js', 'UI/UX'],
    description: 'Building a platform to help hackers form teams and manage projects efficiently',
    matchScore: 92,
    openRoles: ['Backend Developer', 'DevOps Engineer'],
    projectIdea: 'Hackathon Team Formation Platform',
    lookingFor: ['Backend Developer', 'DevOps Engineer'],
    createdAt: '2023-05-10T16:30:00Z'
  },
  {
    id: 'team-2',
    name: 'Project Nebula',
    members: 2,
    maxMembers: 4,
    skills: ['React', 'Node.js', 'MongoDB', 'GraphQL'],
    description: 'Creating a collaborative tool for remote teams with real-time features',
    matchScore: 78,
    openRoles: ['Frontend Developer', 'UI Designer', 'QA Engineer'],
    lookingFor: ['Frontend Developer', 'Designer', 'QA Engineer'],
    createdAt: '2023-05-11T14:20:00Z'
  },
  {
    id: 'team-3',
    name: 'Code Wizards',
    members: 3,
    maxMembers: 5,
    skills: ['Python', 'Machine Learning', 'Data Visualization'],
    description: 'Building an AI tool that helps users generate code from natural language',
    matchScore: 65,
    openRoles: ['Frontend Developer', 'ML Engineer'],
    projectIdea: 'AI Code Generator',
    lookingFor: ['Frontend Developer', 'Machine Learning Engineer'],
    createdAt: '2023-05-09T09:15:00Z'
  },
  {
    id: 'team-4',
    name: 'DevDreamers',
    members: 1,
    maxMembers: 4,
    skills: ['JavaScript', 'React Native', 'Firebase'],
    description: 'Creating a cross-platform mobile app for tracking personal development goals',
    matchScore: 82,
    openRoles: ['Mobile Developer', 'Backend Developer', 'UI/UX Designer'],
    lookingFor: ['Mobile Developer', 'Backend Developer', 'Designer'],
    createdAt: '2023-05-12T11:45:00Z'
  },
];

type UserProfile = {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: string[];
  interests: string[];
};

interface TeamFormationProps {
  userProfile?: UserProfile;
}

export default function TeamFormation({ userProfile }: TeamFormationProps) {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('recommended');
  const [requestedTeams, setRequestedTeams] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Simulate fetching teams with matching algorithm
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call with the user's profile to get matches
        // For now, simulate a delay and use demo data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sort teams by match score
        const sortedTeams = [...DEMO_TEAMS].sort((a, b) => b.matchScore - a.matchScore);
        setTeams(sortedTeams);
        setFilteredTeams(sortedTeams);
        
      } catch (error) {
        console.error('Error fetching teams:', error);
        toast.error('Failed to load team recommendations');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [userProfile]);
  
  // Filter teams based on search term and active tab
  useEffect(() => {
    if (!searchTerm) {
      if (activeTab === 'recommended') {
        setFilteredTeams([...teams].sort((a, b) => b.matchScore - a.matchScore));
      } else if (activeTab === 'newest') {
        setFilteredTeams([...teams].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } else if (activeTab === 'openings') {
        setFilteredTeams([...teams].sort((a, b) => 
          (b.maxMembers - b.members) - (a.maxMembers - a.members)));
      }
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = teams.filter(team => 
      team.name.toLowerCase().includes(term) || 
      team.description.toLowerCase().includes(term) ||
      team.skills.some(skill => skill.toLowerCase().includes(term)) ||
      team.openRoles.some(role => role.toLowerCase().includes(term)) ||
      (team.projectIdea && team.projectIdea.toLowerCase().includes(term))
    );
    
    setFilteredTeams(filtered);
  }, [searchTerm, teams, activeTab]);
  
  const handleRequestJoin = (teamId: string) => {
    if (!user && isLoaded) {
      toast.error('Please sign in to join a team');
      return;
    }
    
    // In a real app, send a request to the backend
    setRequestedTeams(prev => ({ ...prev, [teamId]: true }));
    toast.success('Team join request sent successfully!');
  };
  
  const handleCreateTeam = () => {
    if (!user && isLoaded) {
      toast.error('Please sign in to create a team');
      return;
    }
    
    router.push('/team/create');
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };
  
  // Format relative time
  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        return `${Math.floor(diffDays / 7)} weeks ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return 'Recently';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {!userProfile && (
          <Alert variant="default" className="bg-muted/50 border-muted">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Complete your profile to get better team recommendations based on your skills and interests.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search teams, skills, or roles..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={handleCreateTeam}>
            <Users className="mr-2 h-4 w-4" />
            Create New Team
          </Button>
        </div>
        
        <Tabs defaultValue="recommended" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
            <TabsTrigger value="newest">Newest</TabsTrigger>
            <TabsTrigger value="openings">Most Openings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommended" className="space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <TeamCardSkeleton key={i} />
              ))
            ) : filteredTeams.length > 0 ? (
              filteredTeams.map(team => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  onRequestJoin={handleRequestJoin}
                  requested={!!requestedTeams[team.id]}
                />
              ))
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No teams found matching your criteria</p>
              </div>  
            )}
          </TabsContent>
          
          <TabsContent value="newest" className="space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <TeamCardSkeleton key={i} />
              ))
            ) : filteredTeams.length > 0 ? (
              filteredTeams.map(team => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  onRequestJoin={handleRequestJoin}
                  requested={!!requestedTeams[team.id]}
                />
              ))
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No teams found matching your criteria</p>
              </div>  
            )}
          </TabsContent>
          
          <TabsContent value="openings" className="space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <TeamCardSkeleton key={i} />
              ))
            ) : filteredTeams.length > 0 ? (
              filteredTeams.map(team => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  onRequestJoin={handleRequestJoin}
                  requested={!!requestedTeams[team.id]}
                />
              ))
            ) : (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">No teams found matching your criteria</p>
              </div>  
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}

interface TeamCardProps {
  team: TeamData;
  onRequestJoin: (teamId: string) => void;
  requested: boolean;
}

function TeamCard({ team, onRequestJoin, requested }: TeamCardProps) {
  const getMatchColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-gray-500';
  };
  
  const getRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return 'Recently';
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="flex h-1.5">
        <div 
          className={`${getMatchColor(team.matchScore)} h-full`}
          style={{ width: `${team.matchScore}%` }}
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              {team.name}
              <span className="text-xs flex items-center bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                Created {getRelativeTime(team.createdAt)}
              </span>
            </CardTitle>
            <CardDescription className="mt-1.5">
              {team.description}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="font-medium text-sm">
                    {team.matchScore}% 
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Match score based on your profile</p>
                </TooltipContent>
              </Tooltip>
              <span className="text-xs text-muted-foreground">match</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {team.members}/{team.maxMembers} members
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {team.skills.map((skill, index) => (
            <Badge key={index} variant="outline">{skill}</Badge>
          ))}
        </div>
        
        {team.projectIdea && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-muted-foreground mb-1">Project Idea</h4>
            <p className="text-sm">{team.projectIdea}</p>
          </div>
        )}
        
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-1">Looking for</h4>
          <div className="flex flex-wrap gap-1.5">
            {team.lookingFor.map((role, index) => (
              <Badge key={index} variant="secondary">{role}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          className="w-full" 
          onClick={() => onRequestJoin(team.id)}
          disabled={requested}
          variant={requested ? "outline" : "default"}
        >
          {requested ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Request Sent
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Request to Join
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

function TeamCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="animate-pulse flex items-start justify-between w-full">
          <div className="w-full">
            <div className="h-6 bg-muted rounded w-36 mb-2"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
          </div>
          <div className="w-16">
            <div className="h-5 bg-muted rounded w-12"></div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="animate-pulse flex flex-wrap gap-2 mb-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-muted rounded w-16"></div>
          ))}
        </div>
        
        <div className="animate-pulse mb-3">
          <div className="h-4 bg-muted rounded w-24 mb-2"></div>
          <div className="h-4 bg-muted rounded w-full"></div>
        </div>
        
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-24 mb-2"></div>
          <div className="flex gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-6 bg-muted rounded w-20"></div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="animate-pulse w-full">
          <div className="h-10 bg-muted rounded w-full"></div>
        </div>
      </CardFooter>
    </Card>
  );
} 