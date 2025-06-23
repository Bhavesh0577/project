'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TeamProfileForm from '@/components/team/TeamProfileForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toast } from 'sonner';
import { UserIcon, GithubIcon, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// In a real application, this would be selected by the user
const MOCK_TEAM_ID = 'team-1';

export default function TeamProfilePage() {
  const [teamId, setTeamId] = useState(MOCK_TEAM_ID);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/teamProfile?teamId=${teamId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch team profile');
        }
        
        const data = await response.json();
        setProfile(data.profile);
      } catch (error) {
        console.error('Error fetching team profile:', error);
        toast.error('Failed to load team profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [teamId]);

  const handleSaveProfile = async (data: any) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/teamProfile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save team profile');
      }

      const result = await response.json();
      setProfile(result.profile);
      toast.success('Team profile saved successfully');
    } catch (error) {
      console.error('Error saving team profile:', error);
      toast.error('Failed to save team profile');
    } finally {
      setIsSaving(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      setIsInitializing(true);
      const response = await fetch('/api/initialize');
      
      if (!response.ok) {
        throw new Error('Failed to initialize database');
      }
      
      toast.success('Database initialized successfully! Refreshing profile...');
      
      // Refresh profile after initialization
      const refreshResponse = await fetch(`/api/teamProfile?teamId=${teamId}`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      toast.error('Failed to initialize database');
    } finally {
      setIsInitializing(false);
    }
  };

  const navigateToEditTab = () => {
    const editTab = document.querySelector('[data-value="edit"]') as HTMLElement;
    if (editTab) {
      editTab.click();
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Team Profile</h1>
          <p className="text-muted-foreground">
            Manage your team's information and settings
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={initializeDatabase} 
            disabled={isInitializing}
          >
            {isInitializing ? 'Initializing...' : 'Setup Database'}
          </Button>
          <Button asChild variant="outline">
            <Link href="/team/chat">Go to Team Chat</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-6 w-full sm:w-auto">
          <TabsTrigger value="edit">Edit Profile</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {loading ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <TeamProfileForm
                  teamId={teamId}
                  initialData={profile || {}}
                  onSave={handleSaveProfile}
                  isLoading={isSaving}
                />
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-muted/50 p-6 rounded-lg">
                <h2 className="text-xl font-medium mb-4">What is Team Profile?</h2>
                <p className="mb-3">
                  Your team profile helps other hackathon participants and judges understand:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Who is in your team and what roles they have</li>
                  <li>Your team's technical skills and expertise</li>
                  <li>The tech stack you're using for your project</li>
                  <li>Ways to contact your team and view your project</li>
                </ul>
              </div>
              
              <div className="bg-muted/50 p-6 rounded-lg">
                <h2 className="text-xl font-medium mb-4">Team ID: {teamId}</h2>
                <p className="text-muted-foreground">
                  Share this Team ID with your teammates so they can join the chat and collaborate on your project.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : profile ? (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{profile.name || 'Team Name'}</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{profile.role || 'No role specified'}</span>
                      </div>
                      
                      {profile.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <a href={`mailto:${profile.email}`} className="text-primary hover:underline">
                            {profile.email}
                          </a>
                        </div>
                      )}
                      
                      {profile.githubRepo && (
                        <div className="flex items-center gap-2">
                          <GithubIcon className="h-5 w-5 text-muted-foreground" />
                          <a 
                            href={profile.githubRepo} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View GitHub Repository
                          </a>
                        </div>
                      )}
                      
                      {profile.discordLink && (
                        <div className="flex items-center gap-2">
                          <DiscordIcon className="h-5 w-5 text-muted-foreground" />
                          <a 
                            href={profile.discordLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Join Discord Server
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {profile.techStack && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Tech Stack</h3>
                        <div className="bg-muted p-3 rounded-md">
                          {profile.techStack}
                        </div>
                      </div>
                    )}
                    
                    {profile.skills && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Skills & Expertise</h3>
                        <div className="bg-muted p-3 rounded-md whitespace-pre-line">
                          {profile.skills}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center p-8 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground mb-4">No profile data available</p>
              <Button 
                variant="secondary" 
                onClick={navigateToEditTab}
              >
                Create Your Profile
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="info">
          <div className="space-y-6 max-w-3xl">
            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-xl font-medium mb-4">How Team Profiles Work</h2>
              <p className="mb-3 text-muted-foreground">
                Team profiles are stored in the database and linked to your team ID. 
                When you share your team ID with others, they can:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Join your team chat using the same team ID</li>
                <li>View your team's profile information</li>
                <li>Collaborate more effectively with clear role definitions</li>
                <li>Quickly access your project's GitHub repository or Discord server</li>
              </ul>
            </div>
            
            <div className="bg-muted/50 p-6 rounded-lg">
              <h2 className="text-xl font-medium mb-4">Quick Tips</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Be specific about your tech stack to attract the right teammates</li>
                <li>List your key skills to showcase your team's strengths</li>
                <li>Keep your GitHub repo link updated with the latest code</li>
                <li>Use your profile during project presentations to quickly share contact info</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="12" r="1" />
      <circle cx="15" cy="12" r="1" />
      <path d="M7.5 7.2c.7-.7 1.5-1.2 2.4-1.5 1.1-.5 2.3-.7 3.6-.7 1.3 0 2.5.2 3.6.7.9.3 1.7.8 2.4 1.5M3 9l.9-3.2c0-.7.6-1.2 1.3-1.2.2 0 .4 0 .6.2.4.2.7.5.8.9.2.6.4 1.2.4 1.8C7 9.8 5.3 11.5 3 11.8M21 9l-.9-3.2c0-.7-.6-1.2-1.3-1.2-.2 0-.4 0-.6.2-.4.2-.7.5-.8.9-.2.6-.4 1.2-.4 1.8 0 2.3 1.7 4 4 4.3" />
      <path d="M9 16.3c.9.6 1.9 1 3 1 1.1 0 2.1-.3 3-1" />
      <path d="M16.5 17.8c-1.3.8-2.8 1.2-4.5 1.2-1.7 0-3.2-.4-4.5-1.2-2-1.2-3.1-3-3.5-5.3-.1-1.3 0-2.6.3-3.8.3-1.5 1-2.8 2-4.1.2-.3.4-.6.7-.8.9-.8 1.7-1.4 2.8-1.8l.6-.4h4.8l.6.4c1.1.4 1.9 1 2.8 1.8.3.2.5.5.7.8 1 1.2 1.7 2.6 2 4.1.3 1.2.4 2.5.3 3.8-.4 2.4-1.5 4.2-3.5 5.3z" />
    </svg>
  );
} 