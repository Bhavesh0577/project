import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ClerkWrapperProps {
  children: ReactNode;
}

// Check if we're in a Bolt.new environment
const isBoltEnvironment = () => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('bolt.new') || 
         window.location.hostname.includes('stackblitz.com');
};

// Enhanced Clerk configuration for different environments
const getClerkConfig = () => {
  const config: any = {};
  
  // Handle Bolt.new specific configuration
  if (isBoltEnvironment()) {
    config.allowedOrigins = [
      window.location.origin,
      'https://*.bolt.new',
      'https://*.stackblitz.com'
    ];
    
    config.signInUrl = '/sign-in';
    config.signUpUrl = '/sign-up';
    config.afterSignInUrl = '/';
    config.afterSignUpUrl = '/';
  }
  
  return config;
};

export default function ClerkWrapper({ children }: ClerkWrapperProps) {
  const isConfigured = !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_publishable_key_here'
  );

  if (!isConfigured) {
    console.warn('Clerk is not configured. Running without authentication.');
    return <>{children}</>;
  }

  try {
    const clerkConfig = getClerkConfig();
    
    return (
      <ClerkProvider {...clerkConfig}>
        {children}
      </ClerkProvider>
    );
  } catch (error) {
    console.error('Clerk initialization error:', error);
    console.warn('Falling back to no authentication mode.');
    return <>{children}</>;
  }
}
