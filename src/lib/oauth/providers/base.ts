/**
 * Base OAuth provider interfaces and types
 */

export interface OAuthProvider {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  name?: string;
  email?: string;
  profileImage?: string;
  [key: string]: unknown;
}

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

