'use client';

import { useState, useEffect } from 'react';
import TeamFormation from '@/components/team/TeamFormation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ProfileForm from '@/components/team/ProfileForm';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

type UserProfile = {
  id: string;
  name: string;
  role: string;
  skills: string[];
  availability: string[];
  interests: string[];
};

export default function TeamFormationPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('teams');
  const [profileComplete, setProfileComplete] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();
  
  // Check if profile exists on mount
  useEffect(() => {
    const checkProfile = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // In a real app, fetch profile from backend
          // For now simulate success or failure randomly
          if (Math.random() > 0.3) { // 70% chance of having a profile
            setUserProfile({
              id: user.id,
              name: user.fullName || user.firstName || 'Anonymous User',
              role: 'Developer',
              skills: ['React', 'TypeScript', 'Node.js'],
              availability: ['weekdays', 'evenings'],
              interests: ['Web Development', 'AI/ML', 'Mobile Development']
            });
            setProfileComplete(true);
          } else {
            setActiveTab('profile');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setActiveTab('profile');
        }
      }
    };
    
    checkProfile();
  }, [isLoaded, isSignedIn, user]);
  
  const handleProfileSubmit = (profile: any) => {
    // In a real app, save to backend
    setUserProfile({
      id: user?.id || 'anonymous',
      name: profile.name,
      role: profile.role,
      skills: profile.techStack.split(',').map((s: string) => s.trim()),
      availability: profile.availability,
      interests: profile.lookingFor
    });
    setProfileComplete(true);
    setActiveTab('teams');
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/team">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Team Formation</h1>
        </div>
        <p className="text-muted-foreground">
          Find the perfect team based on your skills and interests
        </p>
      </div>
      
      {!isSignedIn && isLoaded ? (
        <Alert>
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please sign in to access the team formation features.
            <div className="mt-4">
              <Button asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="teams">Find Teams</TabsTrigger>
            <TabsTrigger value="profile">Update Your Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="teams">
            <TeamFormation userProfile={userProfile} />
          </TabsContent>
          
          <TabsContent value="profile">
            {profileComplete ? (
              <div className="grid gap-6 max-w-4xl mx-auto">
                <Alert className="bg-primary/10 border-primary/50">
                  <AlertTitle>Your profile is complete</AlertTitle>
                  <AlertDescription className="text-sm">
                    You can update your profile information below if needed.
                  </AlertDescription>
                </Alert>
                
                <ProfileForm 
                  onSubmit={handleProfileSubmit} 
                  initialData={{
                    name: userProfile?.name || '',
                    email: user?.emailAddresses[0]?.emailAddress || '',
                    role: userProfile?.role || '',
                    techStack: userProfile?.skills.join(', ') || '',
                    skills: '',
                    lookingFor: userProfile?.interests || [],
                    availability: userProfile?.availability || []
                  }}
                />
              </div>
            ) : (
              <div className="grid gap-6 max-w-4xl mx-auto">
                <Alert>
                  <AlertTitle>Complete your profile</AlertTitle>
                  <AlertDescription className="text-sm">
                    Fill out your profile to get personalized team recommendations.
                  </AlertDescription>
                </Alert>
                
                <ProfileForm 
                  onSubmit={handleProfileSubmit}
                  initialData={{
                    name: user?.fullName || user?.firstName || '',
                    email: user?.emailAddresses[0]?.emailAddress || '',
                    role: '',
                    techStack: '',
                    skills: '',
                    lookingFor: [],
                    availability: []
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 