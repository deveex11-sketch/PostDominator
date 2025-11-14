import type { OAuthProvider } from "./base";

/**
 * Instagram OAuth Provider Configuration
 * 
 * Note: Instagram uses Facebook's OAuth system
 * Users must have a Facebook Page connected to their Instagram Business account
 * 
 * Setup:
 * 1. Follow Facebook setup steps
 * 2. Add "Instagram Graph API" product to your Facebook app
 * 3. Connect Instagram Business account to Facebook Page
 */

export const instagramProvider: OAuthProvider = {
  name: "instagram",
  clientId: process.env.FACEBOOK_APP_ID || "", // Uses Facebook App ID
  clientSecret: process.env.FACEBOOK_APP_SECRET || "", // Uses Facebook App Secret
  authorizationUrl: "https://www.facebook.com/v18.0/dialog/oauth",
  tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/instagram/callback`,
  scopes: [
    "instagram_basic",
    "instagram_content_publish",
    "pages_show_list", // Required to list connected pages
  ],
};

/**
 * Fetch Instagram Business account info
 * Requires a Facebook Page access token
 */
export async function fetchInstagramAccount(pageAccessToken: string) {
  // First, get the Instagram Business Account ID from the page
  const pagesResponse = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?access_token=${pageAccessToken}`
  );

  if (!pagesResponse.ok) {
    throw new Error("Failed to fetch pages");
  }

  const pagesData = await pagesResponse.json();
  const page = pagesData.data?.[0];

  if (!page) {
    throw new Error("No Facebook pages found. Instagram requires a connected Facebook Page.");
  }

  // Get Instagram Business Account ID
  const igAccountResponse = await fetch(
    `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${pageAccessToken}`
  );

  if (!igAccountResponse.ok) {
    throw new Error("No Instagram Business account connected to this Facebook Page");
  }

  const igAccountData = await igAccountResponse.json();
  const igAccountId = igAccountData.instagram_business_account?.id;

  if (!igAccountId) {
    throw new Error("Instagram Business account not found");
  }

  // Fetch Instagram account details
  const igDetailsResponse = await fetch(
    `https://graph.facebook.com/v18.0/${igAccountId}?fields=id,username,profile_picture_url&access_token=${pageAccessToken}`
  );

  if (!igDetailsResponse.ok) {
    throw new Error("Failed to fetch Instagram account details");
  }

  return igDetailsResponse.json();
}

