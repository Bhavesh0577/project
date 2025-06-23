'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { MessageSquare, Users, UserPlus, Settings, FileCode, LineChart } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import WithAuth from '@/components/auth/WithAuth';

export default function TeamPage() {
  const { isLoaded, isSignedIn } = useUser();
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Team Hub</h1>
        <p className="text-xl text-muted-foreground">
          Collaborate, communicate, and build together
        </p>
      </div>
      
      {!isSignedIn && isLoaded ? (
        <Alert className="max-w-lg mx-auto">
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription className="mt-2">
            Please sign in to access the team features.
            <div className="mt-4">
              <Button asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<MessageSquare className="h-6 w-6" />}
            title="Team Chat"
            description="Real-time communication with your team members"
            href="/team/chat"
            color="bg-blue-100 dark:bg-blue-900"
          />
          
          <FeatureCard
            icon={<Users className="h-6 w-6" />}
            title="Team Formation"
            description="Find teammates with the skills you need"
            href="/team/formation"
            color="bg-green-100 dark:bg-green-900"
          />
          
          <FeatureCard
            icon={<Settings className="h-6 w-6" />}
            title="Team Profile"
            description="Manage your team's profile and settings"
            href="/team/profile"
            color="bg-purple-100 dark:bg-purple-900"
          />
          
          <FeatureCard
            icon={<UserPlus className="h-6 w-6" />}
            title="Create Team"
            description="Start a new team for your next project"
            href="/team/create"
            color="bg-amber-100 dark:bg-amber-900"
          />
          
          <FeatureCard
            icon={<FileCode className="h-6 w-6" />}
            title="Project Resources"
            description="Access tools and resources for your project"
            href="/resources"
            color="bg-red-100 dark:bg-red-900"
          />
          
          <FeatureCard
            icon={<LineChart className="h-6 w-6" />}
            title="Team Progress"
            description="Track your team's progress and milestones"
            href="/team/progress"
            color="bg-cyan-100 dark:bg-cyan-900"
          />
        </div>
      )}
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}

function FeatureCard({ icon, title, description, href, color }: FeatureCardProps) {
  return (
    <WithAuth>
    <Card className="overflow-hidden border-none shadow-md transition-all duration-300 hover:shadow-lg">
      <Link href={href} className="block h-full">
        <div className={`p-6 ${color}`}>
          <div className="bg-white dark:bg-gray-800 rounded-full p-2 inline-flex items-center justify-center">
            {icon}
          </div>
        </div>
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" className="p-0 h-auto text-sm font-medium hover:underline">
            Go to {title} →
          </Button>
        </CardContent>
      </Link>
    </Card>
    </WithAuth>
  );
} 