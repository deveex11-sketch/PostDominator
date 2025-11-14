import { NextRequest, NextResponse } from "next/server";
import { disconnectConnection } from "@/lib/db/connections";
import type { SupportedPlatform } from "@/lib/oauth/providers/base";

/**
 * Disconnect Route
 * 
 * POST /api/auth/disconnect
 * 
 * Disconnects a social media account
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform } = body;

    if (!platform) {
      return NextResponse.json({ error: "Platform is required" }, { status: 400 });
    }

    // TODO: Get actual user ID from your authentication system
    const userId = request.cookies.get("user_id")?.value || "demo-user";

    const success = await disconnectConnection(userId, platform as SupportedPlatform);

    if (!success) {
      return NextResponse.json({ error: "Connection not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 }
    );
  }
}

