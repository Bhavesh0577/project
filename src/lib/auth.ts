import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Utility to get the current user
export async function getCurrentUser() {
  const { userId } = await auth();
  return userId;
}

// Middleware for protected API routes
export async function isAuthenticated(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }
  
  return handler(request);
}

// Middleware for checking if user owns a resource
export async function isResourceOwner(
  request: NextRequest,
  resourceUserId: string,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
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
} 