import { NextRequest, NextResponse } from "next/server";
import { getConnections } from "@/lib/db/connections";

/**
 * Get Connections Route
 * 
 * GET /api/connections
 * 
 * Returns all active connections for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Get actual user ID from your authentication system
    const userId = request.cookies.get("user_id")?.value || "demo-user";

    const connections = await getConnections(userId);

    // Return connections without sensitive data
    const safeConnections = connections.map((conn) => ({
      id: conn.id,
      platform: conn.platform,
      platformUserId: conn.platformUserId,
      platformUsername: conn.platformUsername,
      platformProfileImage: conn.platformProfileImage,
      scopes: conn.scopes,
      connectedAt: conn.connectedAt,
      lastRefreshedAt: conn.lastRefreshedAt,
      tokenExpiresAt: conn.tokenExpiresAt,
    }));

    return NextResponse.json({ connections: safeConnections });
  } catch (error) {
    console.error("Get connections error:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 }
    );
  }
}

