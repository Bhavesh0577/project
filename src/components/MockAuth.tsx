'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, User, Settings } from 'lucide-react';

interface MockAuthProps {
  children: ReactNode;
}

// Mock authentication component for environments where Clerk isn't working
export default function MockAuth({ children }: MockAuthProps) {
  const isClerkWorking = () => {
    try {
      // Check if we can access Clerk without errors
      if (typeof window !== 'undefined') {
        return !window.location.hostname.includes('bolt.new');
      }
      return true;
    } catch {
      return false;
    }
  };

  // If Clerk is working, render children normally
  if (isClerkWorking()) {
    return <>{children}</>;
  }

  // Otherwise, show a mock authentication state
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Demo Mode
            </CardTitle>
            <CardDescription>
              Authentication is running in demo mode for this environment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <User className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Demo User</p>
                <p className="text-sm text-muted-foreground">demo@example.com</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => window.location.reload()}>
                <Settings className="h-4 w-4 mr-2" />
                Continue as Demo User
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                In production, this would redirect to proper authentication.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  );
}
