import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ClerkWrapperProps {
  children: ReactNode;
}

// Check if we're in a Bolt.new environment
const isBoltEnvironment = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('bolt.new') || 
         window.location.hostname.includes('stackblitz.com') ||
         window.location.hostname.includes('webcontainer');
};

// Enhanced Clerk configuration for different environments
const getClerkConfig = () => {
  const config: any = {
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  };
  
  // Handle different environments
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // For Bolt.new and StackBlitz environments
    if (hostname.includes('bolt.new') || hostname.includes('stackblitz.com') || hostname.includes('webcontainer')) {
      config.allowedOrigins = [
        window.location.origin,
        'https://*.bolt.new',
        'https://*.stackblitz.com',
        'https://*.webcontainer.io'
      ];
    }
    
    // Standard configuration
    config.signInUrl = '/sign-in';
    config.signUpUrl = '/sign-up';
    config.afterSignInUrl = '/';
    config.afterSignUpUrl = '/';
  }
  
  return config;
};

export default function ClerkWrapper({ children }: ClerkWrapperProps) {
  // Check if Clerk is properly configured
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (!clerkKey || clerkKey === 'pk_test_your_publishable_key_here' || !clerkKey.startsWith('pk_')) {
    console.error('Clerk publishable key is missing or invalid. Please check your environment variables.');
    console.error('Expected: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should start with "pk_"');
    console.error('Current value:', clerkKey ? 'Set but invalid' : 'Not set');
    
    // Return a basic error message without MockAuth
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600 mb-4">
            Clerk authentication is not properly configured. Please set up your Clerk environment variables.
          </p>
          <p className="text-sm text-gray-500">
            Check your .env.local file for NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
          </p>
        </div>
      </div>
    );
  }

  try {
    const clerkConfig = getClerkConfig();
    
    return (
      <ClerkProvider {...clerkConfig}>
        {children}
      </ClerkProvider>
    );
  } catch (error) {
    console.error('Clerk initialization failed:', error);
    
    // Return error without falling back to MockAuth
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Clerk Initialization Error</h1>
          <p className="text-gray-600 mb-4">
            Failed to initialize Clerk authentication.
          </p>
          <p className="text-sm text-gray-500">
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}
