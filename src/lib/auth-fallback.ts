// Fallback auth configuration for development/testing
'use client';

import { useUser as useClerkUser } from '@clerk/nextjs';

// Mock user for development when Clerk is not configured
const mockUser = {
  id: 'dev-user-123',
  firstName: 'Development',
  lastName: 'User',
  fullName: 'Development User',
  emailAddresses: [{ emailAddress: 'dev@example.com' }],
  imageUrl: 'https://via.placeholder.com/40',
};

// Check if Clerk is properly configured
const isClerkConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_publishable_key_here'
  );
};

// Enhanced useUser hook with fallback
export function useUser() {
  const clerkUser = useClerkUser();

  // If Clerk is configured, use it
  if (isClerkConfigured()) {
    return clerkUser;
  }

  // Otherwise, provide mock user for development
  console.warn('Clerk is not configured. Using mock user for development.');
  return {
    isLoaded: true,
    isSignedIn: true,
    user: mockUser,
  };
}

// Enhanced auth check for API routes
export async function getAuthUser() {
  if (!isClerkConfigured()) {
    console.warn('Clerk is not configured. Using mock user for API routes.');
    return { userId: 'dev-user-123' };
  }

  // Import dynamically to avoid build errors when Clerk is not configured
  try {
    const { auth } = await import('@clerk/nextjs/server');
    return await auth();
  } catch (error) {
    console.error('Clerk auth error:', error);
    return { userId: null };
  }
}
