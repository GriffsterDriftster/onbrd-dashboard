import { clerkMiddleware } from '@clerk/nextjs/server';
export default clerkMiddleware({
  publicRoutes: ['/', '/sign-in(.*)', '/sign-up(.*)', '/api/events(.*)', '/api/stripe/webhook', '/api/invites/accept', '/api/import/intercom'],
});
export const config = {
  matcher: ['/((?!.*\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
