import type { OAuthProvider } from "./base";

/**
 * X (Twitter) OAuth Provider Configuration
 * 
 * Setup:
 * 1. Go to https://developer.twitter.com/en/portal/dashboard
 * 2. Create a new Project and App
 * 3. Choose "Read and Write" access level (for posting)
 * 4. Set callback URL: https://yourdomain.com/api/auth/twitter/callback
 */

export const twitterProvider: OAuthProvider = {
  name: "twitter",
  clientId: process.env.TWITTER_CLIENT_ID || "",
  clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
  authorizationUrl: "https://twitter.com/i/oauth2/authorize",
  tokenUrl: "https://api.twitter.com/2/oauth2/token",
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/twitter/callback`,
  scopes: [
    "tweet.read", // Read tweets
    "tweet.write", // Post tweets
    "users.read", // Read user profile
    "offline.access", // Refresh token
  ],
};

/**
 * Post a tweet
 */
export async function postTweet(accessToken: string, text: string) {
  const response = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post tweet: ${error}`);
  }

  return response.json();
}

/**
 * Fetch Twitter user profile
 */
export async function fetchTwitterProfile(accessToken: string) {
  const response = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch profile: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.data.id,
    username: data.data.username,
    name: data.data.name,
    profileImage: data.data.profile_image_url,
  };
}

