import type { OAuthProvider } from "./base";

/**
 * Facebook OAuth Provider Configuration
 * 
 * Setup:
 * 1. Go to https://developers.facebook.com/apps/
 * 2. Create a new app (Business type)
 * 3. Add "Facebook Login" product
 * 4. Configure OAuth redirect URI: https://yourdomain.com/api/auth/facebook/callback
 * 5. Add required permissions and submit for review
 */

export const facebookProvider: OAuthProvider = {
  name: "facebook",
  clientId: process.env.FACEBOOK_APP_ID || "",
  clientSecret: process.env.FACEBOOK_APP_SECRET || "",
  authorizationUrl: "https://www.facebook.com/v18.0/dialog/oauth",
  tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/facebook/callback`,
  scopes: [
    "pages_manage_posts", // Post to pages
    "pages_read_engagement", // Read insights
    "pages_show_list", // List user's pages
    "instagram_basic", // Instagram basic access
    "instagram_content_publish", // Post to Instagram
  ],
};

/**
 * Exchange short-lived token for long-lived token
 */
export async function getLongLivedToken(shortLivedToken: string): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
}> {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${process.env.FACEBOOK_APP_ID}&` +
      `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
      `fb_exchange_token=${shortLivedToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to exchange token: ${error}`);
  }

  return response.json();
}

/**
 * Fetch user's Facebook pages
 */
export async function fetchFacebookPages(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch pages: ${error}`);
  }

  return response.json();
}

/**
 * Fetch user profile from Facebook
 */
export async function fetchFacebookProfile(accessToken: string) {
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me?fields=id,name,email,picture&access_token=${accessToken}`
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch profile: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    profileImage: data.picture?.data?.url,
  };
}

