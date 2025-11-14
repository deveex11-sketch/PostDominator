# OAuth Setup Guide

This guide will help you set up OAuth authentication for social media platforms in Post Dominator.

## Quick Start

1. **Set up environment variables** (see below)
2. **Generate encryption key** for token storage
3. **Configure OAuth apps** on each platform
4. **Test the connection flow**

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# App URL (required for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Encryption Key (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=your_64_character_hex_key_here

# Facebook & Instagram (uses same app)
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Twitter/X
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Reddit
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=PostDominator/1.0 by YourUsername

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# TikTok (optional)
TIKTOK_CLIENT_ID=your_tiktok_client_id
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret

# Google/YouTube (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Pinterest (optional)
PINTEREST_APP_ID=your_pinterest_app_id
PINTEREST_APP_SECRET=your_pinterest_app_secret
```

## Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and add it to your `.env.local` file as `ENCRYPTION_KEY`.

## Platform-Specific Setup

### Facebook & Instagram

1. Go to [Facebook Developers](https://developers.facebook.com/apps/)
2. Create a new app (choose "Business" type)
3. Add "Facebook Login" product
4. Add "Instagram Graph API" product (for Instagram)
5. Configure OAuth Redirect URIs:
   - `http://localhost:3000/api/auth/facebook/callback` (development)
   - `https://yourdomain.com/api/auth/facebook/callback` (production)
   - `http://localhost:3000/api/auth/instagram/callback` (development)
   - `https://yourdomain.com/api/auth/instagram/callback` (production)
6. Add required permissions:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `pages_show_list`
   - `instagram_basic`
   - `instagram_content_publish`
7. Submit for app review (required for production)

**Note:** Instagram requires a Facebook Page connected to the Instagram Business account.

### Reddit

1. Go to [Reddit Apps](https://www.reddit.com/prefs/apps)
2. Click "create another app..." or "create application"
3. Choose "web app" type
4. Set redirect URI: `http://localhost:3000/api/auth/reddit/callback`
5. Note your client ID (under the app name)
6. **Important:** Copy the client secret immediately - it's only shown once!

### Twitter/X

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new Project and App
3. Choose "Read and Write" access level (for posting)
4. Set callback URL: `http://localhost:3000/api/auth/twitter/callback`
5. Add required scopes:
   - `tweet.read`
   - `tweet.write`
   - `users.read`
   - `offline.access`

### LinkedIn

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Request access to "Marketing Developer Platform" (for posting)
4. Set authorized redirect URLs:
   - `http://localhost:3000/api/auth/linkedin/callback` (development)
   - `https://yourdomain.com/api/auth/linkedin/callback` (production)
5. Add required products:
   - "Sign In with LinkedIn"
   - "Share on LinkedIn"

## Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/dashboard/connections`

3. Click "Connect" on any platform

4. Complete the OAuth flow

5. Verify the connection appears in the list

## Database Setup

**Note:** The current implementation uses an in-memory store for development. For production, you'll need to:

1. Set up a database (PostgreSQL, MySQL, etc.)
2. Create the `social_connections` table (see `OAUTH_IMPLEMENTATION_GUIDE.md`)
3. Update `src/lib/db/connections.ts` to use your database/ORM

Example schema (Drizzle ORM):

```typescript
import { pgTable, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const socialConnections = pgTable('social_connections', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  platform: text('platform').notNull(),
  accessToken: text('access_token').notNull(), // Encrypted
  refreshToken: text('refresh_token'), // Encrypted
  tokenExpiresAt: timestamp('token_expires_at'),
  platformUserId: text('platform_user_id').notNull(),
  platformUsername: text('platform_username'),
  platformProfileImage: text('platform_profile_image'),
  scopes: text('scopes').array(),
  isActive: boolean('is_active').default(true),
  connectedAt: timestamp('connected_at').defaultNow(),
  lastRefreshedAt: timestamp('last_refreshed_at'),
});
```

## User Authentication

**Important:** The current implementation uses a placeholder user ID (`"demo-user"`). You need to:

1. Integrate with your authentication system
2. Update the following files to get the actual user ID:
   - `src/app/api/auth/[platform]/callback/route.ts` (line ~237)
   - `src/app/api/auth/disconnect/route.ts` (line ~18)
   - `src/app/api/connections/route.ts` (line ~9)

Example with NextAuth:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const session = await getServerSession(authOptions);
const userId = session?.user?.id;
```

## Troubleshooting

### "Invalid redirect_uri"
- Ensure the redirect URI in your `.env.local` matches exactly what's configured in the platform's developer portal
- Check for trailing slashes, http vs https, and port numbers

### "Invalid client_id"
- Verify environment variables are set correctly
- Restart your development server after adding new environment variables

### "Token expired"
- Implement token refresh logic (see `src/lib/oauth/token-refresh.ts`)
- Check token expiration times in the database

### "Insufficient permissions"
- Verify requested scopes match what's approved in the platform's developer portal
- Some platforms require app review for certain permissions

## Security Notes

1. **Never commit `.env.local`** to version control
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Encrypt tokens at rest** - The encryption key should be kept secret
4. **Validate state parameter** - Already implemented for CSRF protection
5. **Use httpOnly cookies** - Already implemented for state storage

## Next Steps

- [ ] Set up production database
- [ ] Integrate with your authentication system
- [ ] Implement token refresh automation
- [ ] Add error monitoring and logging
- [ ] Set up webhook handlers for token revocation
- [ ] Implement rate limiting for API calls

For more details, see `OAUTH_IMPLEMENTATION_GUIDE.md`.

