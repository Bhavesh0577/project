'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type FormData = {
  name: string;
  description: string;
  maxMembers: number;
  projectType: string;
  techStack: string;
  lookingFor: string;
  githubRepo: string;
  discordLink: string;
};

export default function CreateTeamPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    maxMembers: 5,
    projectType: '',
    techStack: '',
    lookingFor: '',
    githubRepo: '',
    discordLink: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  
  const handleChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignedIn) {
      toast.error('You must be signed in to create a team');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, we would send this data to the backend API
      // For now, we'll simulate success and redirect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Team created successfully!');
      router.push(`/team/chat?teamId=new-team-${Date.now()}`);
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isLoaded) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  if (!isSignedIn) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert className="max-w-lg mx-auto">
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription className="mt-2">
            Please sign in to create a team.
            <div className="mt-4">
              <Button asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/team">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create Team</h1>
        </div>
        <p className="text-muted-foreground">
          Start a new team and invite members to join you
        </p>
      </div>
      
      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
            <CardDescription>
              Provide information about your team to help others understand your project
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter a memorable team name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="What are you building? What problem does it solve?"
                required
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select
                  value={formData.projectType}
                  onValueChange={(value) => handleChange('projectType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web App</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="game">Game</SelectItem>
                    <SelectItem value="ai">AI / Machine Learning</SelectItem>
                    <SelectItem value="hardware">Hardware / IoT</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxMembers">Team Size</Label>
                <Select
                  value={formData.maxMembers.toString()}
                  onValueChange={(value) => handleChange('maxMembers', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select maximum team size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 members</SelectItem>
                    <SelectItem value="3">3 members</SelectItem>
                    <SelectItem value="4">4 members</SelectItem>
                    <SelectItem value="5">5 members</SelectItem>
                    <SelectItem value="6">6 members</SelectItem>
                    <SelectItem value="10">10 members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="techStack">Tech Stack</Label>
              <Input
                id="techStack"
                value={formData.techStack}
                onChange={(e) => handleChange('techStack', e.target.value)}
                placeholder="e.g., React, Node.js, MongoDB"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lookingFor">Looking For</Label>
              <Textarea
                id="lookingFor"
                value={formData.lookingFor}
                onChange={(e) => handleChange('lookingFor', e.target.value)}
                placeholder="What roles or skills are you looking for in team members?"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="githubRepo">GitHub Repository (Optional)</Label>
                <Input
                  id="githubRepo"
                  value={formData.githubRepo}
                  onChange={(e) => handleChange('githubRepo', e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="discordLink">Discord Link (Optional)</Label>
                <Input
                  id="discordLink"
                  value={formData.discordLink}
                  onChange={(e) => handleChange('discordLink', e.target.value)}
                  placeholder="https://discord.gg/invite-code"
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Team...' : 'Create Team'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 