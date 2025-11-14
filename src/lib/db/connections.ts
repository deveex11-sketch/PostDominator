/**
 * Database functions for social connections
 * 
 * Note: This is a simplified in-memory implementation.
 * In production, replace with actual database calls using your preferred ORM.
 * 
 * For Drizzle ORM example:
 * ```typescript
 * import { db } from './client';
 * import { socialConnections } from './schema';
 * import { eq, and } from 'drizzle-orm';
 * ```
 */

import { encryptToken, decryptToken } from "@/lib/oauth/encryption";
import type { SupportedPlatform } from "@/lib/oauth/providers/base";

export interface SocialConnection {
  id: string;
  userId: string;
  platform: SupportedPlatform;
  accessToken: string; // Encrypted
  refreshToken?: string; // Encrypted
  tokenExpiresAt?: Date;
  platformUserId: string;
  platformUsername?: string;
  platformProfileImage?: string;
  scopes: string[];
  isActive: boolean;
  connectedAt: Date;
  lastRefreshedAt?: Date;
}

// In-memory store (replace with database in production)
const connectionsStore = new Map<string, SocialConnection>();

/**
 * Save a new connection or update existing
 */
export async function saveConnection(data: {
  userId: string;
  platform: SupportedPlatform;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  platformUserId: string;
  platformUsername?: string;
  platformProfileImage?: string;
  scopes: string[];
}): Promise<SocialConnection> {
  // Check if connection already exists
  const existing = Array.from(connectionsStore.values()).find(
    (conn) => conn.userId === data.userId && conn.platform === data.platform && conn.isActive
  );

  const connection: SocialConnection = {
    id: existing?.id || crypto.randomUUID(),
    userId: data.userId,
    platform: data.platform,
    accessToken: encryptToken(data.accessToken),
    refreshToken: data.refreshToken ? encryptToken(data.refreshToken) : undefined,
    tokenExpiresAt: data.tokenExpiresAt,
    platformUserId: data.platformUserId,
    platformUsername: data.platformUsername,
    platformProfileImage: data.platformProfileImage,
    scopes: data.scopes,
    isActive: true,
    connectedAt: existing?.connectedAt || new Date(),
    lastRefreshedAt: new Date(),
  };

  connectionsStore.set(connection.id, connection);
  return connection;
}

/**
 * Get all active connections for a user
 */
export async function getConnections(userId: string): Promise<SocialConnection[]> {
  return Array.from(connectionsStore.values()).filter(
    (conn) => conn.userId === userId && conn.isActive
  );
}

/**
 * Get a specific connection
 */
export async function getConnection(
  userId: string,
  platform: SupportedPlatform
): Promise<SocialConnection | null> {
  const connection = Array.from(connectionsStore.values()).find(
    (conn) => conn.userId === userId && conn.platform === platform && conn.isActive
  );
  return connection || null;
}

/**
 * Get decrypted access token for a connection
 * Only use this in secure server context
 */
export async function getDecryptedAccessToken(
  userId: string,
  platform: SupportedPlatform
): Promise<string | null> {
  const connection = await getConnection(userId, platform);
  if (!connection) {
    return null;
  }
  return decryptToken(connection.accessToken);
}

/**
 * Update connection tokens (for refresh)
 */
export async function updateConnectionTokens(
  userId: string,
  platform: SupportedPlatform,
  tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }
): Promise<SocialConnection | null> {
  const connection = await getConnection(userId, platform);
  if (!connection) {
    return null;
  }

  connection.accessToken = encryptToken(tokens.accessToken);
  if (tokens.refreshToken) {
    connection.refreshToken = encryptToken(tokens.refreshToken);
  }
  if (tokens.expiresIn) {
    connection.tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
  }
  connection.lastRefreshedAt = new Date();

  connectionsStore.set(connection.id, connection);
  return connection;
}

/**
 * Disconnect (deactivate) a connection
 */
export async function disconnectConnection(
  userId: string,
  platform: SupportedPlatform
): Promise<boolean> {
  const connection = await getConnection(userId, platform);
  if (!connection) {
    return false;
  }

  connection.isActive = false;
  connectionsStore.set(connection.id, connection);
  return true;
}

/**
 * Delete a connection (permanent removal)
 */
export async function deleteConnection(
  userId: string,
  platform: SupportedPlatform
): Promise<boolean> {
  const connection = await getConnection(userId, platform);
  if (!connection) {
    return false;
  }

  connectionsStore.delete(connection.id);
  return true;
}

