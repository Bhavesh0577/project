import { NextRequest, NextResponse } from "next/server";

// Check if Clerk is properly configured
const isClerkConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_your_publishable_key_here' &&
    process.env.CLERK_SECRET_KEY &&
    process.env.CLERK_SECRET_KEY !== 'sk_test_your_secret_key_here'
  );
};

// Utility to get the current user with fallback
export async function getCurrentUser() {
  if (!isClerkConfigured()) {
    console.warn('Clerk is not configured. Using mock user ID for development.');
    return 'dev-user-123';
  }

  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  } catch (error) {
    console.error('Clerk auth error:', error);
    return null;
  }
}

// Middleware for protected API routes
export async function isAuthenticated(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  if (!isClerkConfigured()) {
    console.warn('Clerk is not configured. Allowing request for development.');
    return handler(request);
  }

  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    return handler(request);
  } catch (error) {
    console.error('Clerk auth error:', error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}

// Middleware for checking if user owns a resource
export async function isResourceOwner(
  request: NextRequest,
  resourceUserId: string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  if (!isClerkConfigured()) {
    console.warn('Clerk is not configured. Allowing request for development.');
    return handler(request);
  }

  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    if (userId !== resourceUserId) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    
    return handler(request);
  } catch (error) {
    console.error('Clerk auth error:', error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
} 