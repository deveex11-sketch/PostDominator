import { NextRequest, NextResponse } from "next/server";
import { getProviderConfig, exchangeCodeForTokens, fetchUserProfile } from "@/lib/oauth/providers";
import { saveConnection } from "@/lib/db/connections";
import type { SupportedPlatform } from "@/lib/oauth/providers/base";

/**
 * OAuth Callback Route
 * 
 * GET /api/auth/[platform]/callback
 * 
 * Handles the OAuth callback from the platform
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    console.error("OAuth error:", error, errorDescription);
    return NextResponse.redirect(
      `/dashboard/connections?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || "Authentication failed")}`
    );
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      "/dashboard/connections?error=missing_parameters&message=Missing authorization code or state"
    );
  }

  // Verify state parameter (CSRF protection)
  const storedState = request.cookies.get(`oauth_state_${platform}`)?.value;
  if (storedState !== state) {
    return NextResponse.redirect(
      "/dashboard/connections?error=invalid_state&message=Invalid state parameter"
    );
  }

  try {
    const provider = getProviderConfig(platform as SupportedPlatform);
    if (!provider) {
      throw new Error("Invalid platform");
    }

    // Exchange authorization code for access token
    const tokens = await exchangeCodeForTokens(platform as SupportedPlatform, code);

    // Fetch user profile from platform
    const userProfile = await fetchUserProfile(platform as SupportedPlatform, tokens.accessToken);

    // TODO: Get actual user ID from your authentication system
    // For now, using a placeholder - replace with your auth logic
    const userId = request.cookies.get("user_id")?.value || "demo-user";

    // Save connection to database
    await saveConnection({
      userId,
      platform: platform as SupportedPlatform,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: tokens.expiresIn
        ? new Date(Date.now() + tokens.expiresIn * 1000)
        : undefined,
      platformUserId: userProfile.id,
      platformUsername: userProfile.username || userProfile.name,
      platformProfileImage: userProfile.profileImage,
      scopes: provider.scopes,
    });

    // Clear state cookie
    const response = NextResponse.redirect("/dashboard/connections?success=true");
    response.cookies.delete(`oauth_state_${platform}`);

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    const errorMessage = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.redirect(
      `/dashboard/connections?error=connection_failed&message=${encodeURIComponent(errorMessage)}`
    );
  }
}

