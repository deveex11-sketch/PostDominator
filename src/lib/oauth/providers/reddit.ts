import type { OAuthProvider } from "./base";

/**
 * Reddit OAuth Provider Configuration
 * 
 * Setup:
 * 1. Go to https://www.reddit.com/prefs/apps
 * 2. Click "create another app..." or "create application"
 * 3. Choose "web app" type
 * 4. Set redirect URI: https://yourdomain.com/api/auth/reddit/callback
 * 5. Note your client ID (under app name) and secret (shown only once)
 */

export const redditProvider: OAuthProvider = {
  name: "reddit",
  clientId: process.env.REDDIT_CLIENT_ID || "",
  clientSecret: process.env.REDDIT_CLIENT_SECRET || "",
  authorizationUrl: "https://www.reddit.com/api/v1/authorize",
  tokenUrl: "https://www.reddit.com/api/v1/access_token",
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/reddit/callback`,
  scopes: [
    "identity", // Read user identity
    "submit", // Submit posts
    "read", // Read posts
    "history", // Read post history
  ],
};

/**
 * Exchange authorization code for access token
 * Reddit uses Basic Auth for token exchange
 */
export async function exchangeRedditCode(code: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}> {
  const credentials = Buffer.from(
    `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": process.env.REDDIT_USER_AGENT || "PostDominator/1.0 by YourUsername", // Required!
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/reddit/callback`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Fetch Reddit user profile
 */
export async function fetchRedditProfile(accessToken: string) {
  const response = await fetch("https://oauth.reddit.com/api/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": process.env.REDDIT_USER_AGENT || "PostDominator/1.0 by YourUsername",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch profile: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    username: data.name,
    name: data.name,
    profileImage: data.icon_img || data.snoovatar_img,
  };
}

/**
 * Post to Reddit
 */
export async function postToReddit(
  accessToken: string,
  subreddit: string,
  title: string,
  text?: string,
  kind: "self" | "link" = "self"
) {
  const response = await fetch("https://oauth.reddit.com/api/submit", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": process.env.REDDIT_USER_AGENT || "PostDominator/1.0 by YourUsername",
    },
    body: new URLSearchParams({
      sr: subreddit,
      title,
      kind,
      ...(text && { text }),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post: ${error}`);
  }

  return response.json();
}

