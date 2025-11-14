import type { OAuthProvider, SupportedPlatform, UserProfile } from "./base";
import { facebookProvider } from "./facebook";
import { instagramProvider } from "./instagram";
import { linkedinProvider } from "./linkedin";
import { redditProvider } from "./reddit";
import { twitterProvider } from "./twitter";

/**
 * Get OAuth provider configuration for a platform
 */
export function getProviderConfig(platform: SupportedPlatform): OAuthProvider | null {
  const providers: Record<SupportedPlatform, OAuthProvider> = {
    facebook: facebookProvider,
    instagram: instagramProvider,
    twitter: twitterProvider,
    reddit: redditProvider,
    linkedin: linkedinProvider,
    tiktok: {
      name: "tiktok",
      clientId: process.env.TIKTOK_CLIENT_ID || "",
      clientSecret: process.env.TIKTOK_CLIENT_SECRET || "",
      authorizationUrl: "https://www.tiktok.com/v2/auth/authorize",
      tokenUrl: "https://open.tiktokapis.com/v2/oauth/token",
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/tiktok/callback`,
      scopes: ["user.info.basic", "video.upload"],
    },
    youtube: {
      name: "youtube",
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/youtube/callback`,
      scopes: [
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.readonly",
      ],
    },
    pinterest: {
      name: "pinterest",
      clientId: process.env.PINTEREST_APP_ID || "",
      clientSecret: process.env.PINTEREST_APP_SECRET || "",
      authorizationUrl: "https://www.pinterest.com/oauth",
      tokenUrl: "https://api.pinterest.com/v5/oauth/token",
      redirectUri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/pinterest/callback`,
      scopes: ["boards:read", "pins:read", "pins:write"],
    },
    threads: instagramProvider, // Threads uses Instagram Graph API
    bluesky: {
      name: "bluesky",
      clientId: "", // Bluesky uses app passwords, not OAuth
      clientSecret: "",
      authorizationUrl: "",
      tokenUrl: "",
      redirectUri: "",
      scopes: [],
    },
  };

  return providers[platform] || null;
}

/**
 * Exchange authorization code for access tokens
 */
export async function exchangeCodeForTokens(
  platform: SupportedPlatform,
  code: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}> {
  const provider = getProviderConfig(platform);

  if (!provider) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  // Reddit uses Basic Auth, handle separately
  if (platform === "reddit") {
    const { exchangeRedditCode } = await import("./reddit");
    const tokens = await exchangeRedditCode(code);
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      tokenType: tokens.token_type,
    };
  }

  // Standard OAuth 2.0 token exchange
  const body = new URLSearchParams({
    client_id: provider.clientId,
    client_secret: provider.clientSecret,
    code,
    grant_type: "authorization_code",
    redirect_uri: provider.redirectUri,
  });

  const response = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const data = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

/**
 * Fetch user profile from platform
 */
export async function fetchUserProfile(
  platform: SupportedPlatform,
  accessToken: string
): Promise<UserProfile> {
  switch (platform) {
    case "facebook": {
      const { fetchFacebookProfile } = await import("./facebook");
      return fetchFacebookProfile(accessToken);
    }
    case "instagram": {
      // Instagram requires page access token
      // This is a simplified version - you may need to handle page selection
      const { fetchFacebookPages } = await import("./facebook");
      const pages = await fetchFacebookPages(accessToken);
      if (pages.data && pages.data.length > 0) {
        const { fetchInstagramAccount } = await import("./instagram");
        const igAccount = await fetchInstagramAccount(pages.data[0].access_token);
        return {
          id: igAccount.id,
          username: igAccount.username,
          profileImage: igAccount.profile_picture_url,
        };
      }
      throw new Error("No Instagram account found");
    }
    case "reddit": {
      const { fetchRedditProfile } = await import("./reddit");
      return fetchRedditProfile(accessToken);
    }
    case "twitter": {
      const { fetchTwitterProfile } = await import("./twitter");
      return fetchTwitterProfile(accessToken);
    }
    case "linkedin": {
      const { fetchLinkedInProfile } = await import("./linkedin");
      return fetchLinkedInProfile(accessToken);
    }
    default:
      throw new Error(`Profile fetching not implemented for ${platform}`);
  }
}

