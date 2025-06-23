# Environment Variables Configuration for Bolt.new

When importing this project to Bolt.new, you'll need to configure several environment variables for full functionality:

## Required Environment Variables

### 1. Clerk Authentication (REQUIRED)

Get these from your Clerk Dashboard (https://clerk.com):

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

### 2. Database Connection (REQUIRED)

Use Vercel Postgres or Neon for best compatibility with Bolt.new:

```
DATABASE_URL=your_database_url_here
POSTGRES_URL=your_postgres_url_here
```

### 3. AI Analysis (OPTIONAL)

For sustainability analysis features:

```
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

## Quick Setup Steps for Bolt.new

1. **Create a Clerk Account**:

   - Go to https://clerk.com and create a free account
   - Create a new application
   - Copy the publishable key and secret key

2. **Setup Database**:

   - Use Vercel Postgres (recommended for Bolt.new)
   - Or use Neon (https://neon.tech) for PostgreSQL
   - Copy the connection string

3. **Configure Environment Variables in Bolt.new**:

   - In your Bolt.new project, go to Settings > Environment Variables
   - Add each variable from the .env.example file
   - Make sure to use the actual values from your services

4. **Deploy and Test**:
   - The app should work without authentication errors
   - All auth-protected routes will redirect to Clerk's sign-in

## Troubleshooting Common Issues

### "Clerk Publishable Key Missing" Error

- Ensure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly
- Check that the key starts with `pk_test_` or `pk_live_`

### Authentication Redirects Not Working

- Verify your Clerk dashboard has the correct redirect URLs
- Add your Bolt.new domain to allowed origins in Clerk

### Database Connection Issues

- Ensure DATABASE_URL is correctly formatted
- Check that your database accepts connections from external IPs

## Development vs Production

For development (local):

- Use test keys (pk*test*, sk*test*)
- Use local database or development instance

For production (Bolt.new):

- Consider upgrading to production keys for live use
- Use production database instance
- Ensure all domains are whitelisted in Clerk dashboard

⚠️ **IMPORTANT FOR BOLT.NEW USERS**: If you're seeing a "clerk.accounts.dev refused to connect" error, follow the steps below.

## 🚨 Bolt.new Clerk Authentication Fix

If you're getting the error shown in the image (`smart-falcon-81.clerk.accounts.dev refused to connect`), here's how to fix it:

### Quick Fix Steps:

1. **In your Clerk Dashboard** (https://dashboard.clerk.com):

   - Go to your application setting
   - Navigate to "Domains" section
   - Add your Bolt.new URL as an allowed domain
   - Format: `https://your-project-name.bolt.new`
   - Also add: `https://*.bolt.new` as a wildcard

2. **Set Environment Variables in Bolt.new**:

   - Go to your Bolt.new project settings
   - Add these environment variables:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c21hcnQtZmFsY29uLTgxLmNsZXJrLmFjY291bnRzLmRldiQ
   CLERK_SECRET_KEY=sk_test_u10W5peXKKF3k6NpDX5im7Drrt4SEFAwiO1vVWWdEv
   ```

3. **Alternative**: The app includes a fallback mode that will work without Clerk if needed.
