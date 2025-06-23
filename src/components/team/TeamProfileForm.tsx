'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface TeamProfileFormProps {
  teamId: string;
  initialData?: {
    name?: string;
    email?: string;
    role?: string;
    techStack?: string;
    skills?: string;
    githubRepo?: string;
    discordLink?: string;
  };
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function TeamProfileForm({ 
  teamId, 
  initialData = {}, 
  onSave,
  isLoading 
}: TeamProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    email: initialData.email || '',
    role: initialData.role || '',
    techStack: initialData.techStack || '',
    skills: initialData.skills || '',
    githubRepo: initialData.githubRepo || '',
    discordLink: initialData.discordLink || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ ...formData, teamId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Profile</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter team name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter contact email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Your Role</Label>
            <Input
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="E.g., Frontend Developer, Project Manager"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="techStack">Tech Stack</Label>
            <Input
              id="techStack"
              name="techStack"
              value={formData.techStack}
              onChange={handleChange}
              placeholder="E.g., React, Node.js, PostgreSQL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills</Label>
            <Textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="List your team's key skills"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="githubRepo">GitHub Repository</Label>
            <Input
              id="githubRepo"
              name="githubRepo"
              value={formData.githubRepo}
              onChange={handleChange}
              placeholder="https://github.com/username/repo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discordLink">Discord Link</Label>
            <Input
              id="discordLink"
              name="discordLink"
              value={formData.discordLink}
              onChange={handleChange}
              placeholder="https://discord.gg/invite-code"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 