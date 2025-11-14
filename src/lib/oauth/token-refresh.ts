import type { SupportedPlatform } from "./providers/base";
import { getProviderConfig } from "./providers";
import { getConnection, updateConnectionTokens, getDecryptedAccessToken } from "@/lib/db/connections";

/**
 * Token refresh utilities
 * Handles automatic token refresh before expiration
 */

/**
 * Check if token needs refresh and refresh if necessary
 */
export async function refreshTokenIfNeeded(
  userId: string,
  platform: SupportedPlatform
): Promise<string | null> {
  const connection = await getConnection(userId, platform);

  if (!connection) {
    return null;
  }

  // If no expiration, assume token is valid
  if (!connection.tokenExpiresAt) {
    return getDecryptedAccessToken(userId, platform);
  }

  // Check if token expires within 5 minutes
  const expiresIn = connection.tokenExpiresAt.getTime() - Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes

  if (expiresIn < bufferTime) {
    // Token needs refresh
    if (!connection.refreshToken) {
      throw new Error(`Token expired and no refresh token available for ${platform}`);
    }

    // Refresh the token
    const newTokens = await refreshAccessToken(platform, connection.refreshToken);
    await updateConnectionTokens(userId, platform, {
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken || connection.refreshToken,
      expiresIn: newTokens.expiresIn,
    });

    return newTokens.accessToken;
  }

  // Token is still valid
  return getDecryptedAccessToken(userId, platform);
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(
  platform: SupportedPlatform,
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}> {
  const provider = getProviderConfig(platform);
  if (!provider) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  // Platform-specific refresh logic
  switch (platform) {
    case "facebook": {
      // Facebook tokens are long-lived (60 days), but can be refreshed
      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
          `grant_type=fb_exchange_token&` +
          `client_id=${process.env.FACEBOOK_APP_ID}&` +
          `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
          `fb_exchange_token=${refreshToken}`
      );

      if (!response.ok) {
        throw new Error("Failed to refresh Facebook token");
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
      };
    }

    case "twitter": {
      const response = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${provider.clientId}:${provider.clientSecret}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh Twitter token");
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    }

    case "reddit": {
      const credentials = Buffer.from(
        `${provider.clientId}:${provider.clientSecret}`
      ).toString("base64");

      const response = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": process.env.REDDIT_USER_AGENT || "PostDominator/1.0",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh Reddit token");
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    }

    case "linkedin": {
      const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: provider.clientId,
          client_secret: provider.clientSecret,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh LinkedIn token");
      }

      const data = await response.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      };
    }

    default:
      throw new Error(`Token refresh not implemented for ${platform}`);
  }
}

