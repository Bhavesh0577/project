'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { saveTeamProfileAction } from "@/lib/teamActions";
import { TeamProfile } from "@/lib/neonClient";

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
  { id: "weekdays", label: "Weekdays" },
  { id: "weekends", label: "Weekends" },
  { id: "mornings", label: "Mornings" },
  { id: "afternoons", label: "Afternoons" },
  { id: "evenings", label: "Evenings" },
  { id: "late_night", label: "Late Night" }
];

interface ProfileFormProps {
  onSubmit: (profile: TeamProfile & { id: string }) => void;
  initialData?: {
    name?: string;
    email?: string;
    role?: string;
    techStack?: string;
    skills?: string;
    availability?: string[];
    lookingFor?: string[];
  };
}

export default function ProfileForm({ onSubmit, initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<TeamProfile>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || '',
    techStack: initialData?.techStack || '',
    skills: initialData?.skills || '',
    availability: initialData?.availability || [],
    lookingFor: initialData?.lookingFor || []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleAvailabilityChange = (id: string) => {
    setFormData(prev => {
      const current = [...prev.availability];
      if (current.includes(id)) {
        return { ...prev, availability: current.filter(item => item !== id) };
      } else {
        return { ...prev, availability: [...current, id] };
      }
    });
  };

  const handleLookingForChange = (role: string) => {
    setFormData(prev => {
      const current = [...prev.lookingFor];
      if (current.includes(role)) {
        return { ...prev, lookingFor: current.filter(item => item !== role) };
      } else {
        return { ...prev, lookingFor: [...current, role] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await saveTeamProfileAction(formData);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to save profile');
      }
      
      toast.success('Profile saved successfully!');
      onSubmit({ ...formData, id: result.data.id });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'Update Your Profile' : 'Create Your Profile'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Your Role</Label>
            <Select value={formData.role} onValueChange={handleRoleChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="techStack">Tech Stack</Label>
            <Textarea
              id="techStack"
              name="techStack"
              value={formData.techStack}
              onChange={handleChange}
              placeholder="React, Node.js, TypeScript..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills & Experience</Label>
            <Textarea
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="Describe your skills and experience..."
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Availability</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availabilityOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`availability-${option.id}`}
                    checked={formData.availability.includes(option.id)}
                    onCheckedChange={() => handleAvailabilityChange(option.id)}
                  />
                  <label
                    htmlFor={`availability-${option.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Looking for teammates with roles</Label>
            <div className="grid grid-cols-2 gap-4">
              {roles.map(role => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`looking-for-${role.replace(/\s+/g, '-').toLowerCase()}`}
                    checked={formData.lookingFor.includes(role)}
                    onCheckedChange={() => handleLookingForChange(role)}
                  />
                  <label
                    htmlFor={`looking-for-${role.replace(/\s+/g, '-').toLowerCase()}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {role}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Profile' : 'Create Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 