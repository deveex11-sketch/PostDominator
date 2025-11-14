import { NextRequest, NextResponse } from "next/server";
import { getProviderConfig } from "@/lib/oauth/providers";
import type { SupportedPlatform } from "@/lib/oauth/providers/base";

/**
 * OAuth Initiation Route
 * 
 * GET /api/auth/[platform]
 * 
 * Initiates the OAuth flow by redirecting to the platform's authorization URL
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const provider = getProviderConfig(platform as SupportedPlatform);

  if (!provider) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  // Generate state parameter for CSRF protection
  const state = crypto.randomUUID();

  // Build authorization URL
  const authUrl = new URL(provider.authorizationUrl);
  authUrl.searchParams.set("client_id", provider.clientId);
  authUrl.searchParams.set("redirect_uri", provider.redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", provider.scopes.join(" "));
  authUrl.searchParams.set("state", state);

  // Store state in httpOnly cookie (for verification in callback)
  const response = NextResponse.redirect(authUrl.toString());
  response.cookies.set(`oauth_state_${platform}`, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}

