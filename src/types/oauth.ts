/**
 * OAuth-related TypeScript types
 */

export type SupportedPlatform =
  | "facebook"
  | "instagram"
  | "twitter"
  | "reddit"
  | "linkedin"
  | "tiktok"
  | "youtube"
  | "pinterest"
  | "threads"
  | "bluesky";

export interface SocialConnection {
  id: string;
  platform: SupportedPlatform;
  platformUserId: string;
  platformUsername?: string;
  platformProfileImage?: string;
  scopes: string[];
  connectedAt: string;
  lastRefreshedAt?: string;
  tokenExpiresAt?: string;
}

