import type { OAuthProvider } from "./base";

/**
 * LinkedIn OAuth Provider Configuration
 * 
 * Setup:
 * 1. Go to https://www.linkedin.com/developers/apps
 * 2. Create a new app
 * 3. Request access to "Marketing Developer Platform" (for posting)
 * 4. Set authorized redirect URLs: https://yourdomain.com/api/auth/linkedin/callback
 */

export const linkedinProvider: OAuthProvider = {
  name: "linkedin",
  clientId: process.env.LINKEDIN_CLIENT_ID || "",
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
  authorizationUrl: "https://www.linkedin.com/oauth/v2/authorization",
  tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
  redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/linkedin/callback`,
  scopes: [
    "openid", // Basic profile
    "profile", // Full profile
    "email", // Email address
    "w_member_social", // Post to LinkedIn
  ],
};

/**
 * Fetch LinkedIn user profile
 */
export async function fetchLinkedInProfile(accessToken: string) {
  const response = await fetch("https://api.linkedin.com/v2/userinfo", {
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
    id: data.sub,
    name: data.name,
    email: data.email,
    profileImage: data.picture,
  };
}

/**
 * Post to LinkedIn
 */
export async function postToLinkedIn(
  accessToken: string,
  text: string,
  authorUrn: string // User's LinkedIn URN
) {
  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:person:${authorUrn}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text,
          },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to post: ${error}`);
  }

  return response.json();
}

