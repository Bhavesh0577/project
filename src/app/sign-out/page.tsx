'use client';

import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SignOutPage() {
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      router.push('/');
    } catch (err) {
      setError('Failed to sign out. Please try again.');
      setIsLoading(false);
    }
  };

  // Auto sign-out if the page is directly navigated to
  useEffect(() => {
    handleSignOut();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border rounded-lg shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold mb-6">Sign Out</h1>
        
        {error ? (
          <div className="mb-6">
            <p className="text-destructive mb-4">{error}</p>
            <Button 
              variant="default" 
              onClick={handleSignOut}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Try Again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Signing you out...</p>
          </div>
        )}
        
        {error && (
          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
            >
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
