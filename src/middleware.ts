import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Create a matcher for public routes
const publicRoutes = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/sign-out(.*)'
]);

export default clerkMiddleware((auth, req) => {
  if (publicRoutes(req)) {
    return;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};