import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";
import { instagramSettings, OAUTH_AGE_SECONDS, OAUTH_COOKIE, signInstagramState } from "@/lib/instagram";

export async function GET(request: NextRequest) {
  const userId = getSessionUser(request);
  if (!userId) return unauthorized();
  const config = instagramSettings();
  if (!config) return NextResponse.json({ error: "Instagram OAuth no configurado" }, { status: 503 });
  const state = signInstagramState(userId, config.sessionSecret);
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("redirect_uri", config.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "instagram_business_basic");
  url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_COOKIE, state, {
    httpOnly: true, sameSite: "lax", secure: config.redirectUri.startsWith("https:"),
    path: "/api/instagram", maxAge: OAUTH_AGE_SECONDS,
  });
  return response;
}
