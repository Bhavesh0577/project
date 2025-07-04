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
    
    // Return a comprehensive error message with Netlify instructions
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-red-600 mb-6">🔑 Environment Variables Required</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">📋 Setup Instructions for Netlify</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">Step 1: Go to Netlify Dashboard</h3>
                <p className="text-blue-600">Navigate to your site: <strong>hackonoconnect.netlify.app</strong></p>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">Step 2: Add Environment Variables</h3>
                <p className="text-blue-600 mb-2">Go to: <strong>Site Settings → Environment Variables</strong></p>
                <div className="bg-gray-100 p-4 rounded text-sm font-mono space-y-1">
                  <div><strong>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</strong></div>
                  <div><strong>CLERK_SECRET_KEY</strong></div>
                  <div><strong>DATABASE_URL</strong></div>
                  <div><strong>NEXT_PUBLIC_CLERK_SIGN_IN_URL</strong> = /sign-in</div>
                  <div><strong>NEXT_PUBLIC_CLERK_SIGN_UP_URL</strong> = /sign-up</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">Step 3: Get Your Keys</h3>
                <p className="text-blue-600">Copy values from your local .env file or get them from Clerk dashboard</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-700 mb-2">Step 4: Redeploy</h3>
                <p className="text-blue-600">After adding variables, redeploy your site</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://dashboard.clerk.com/last-active?path=api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔑 Get Clerk API Keys
            </a>
            <a 
              href="https://app.netlify.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              🚀 Netlify Dashboard
            </a>
          </div>
          
          <div className="mt-6 text-sm text-gray-600">
            <p>💡 <strong>Quick Fix:</strong> Your build was successful! Just need to configure environment variables.</p>
          </div>
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
