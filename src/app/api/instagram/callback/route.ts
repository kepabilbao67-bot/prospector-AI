import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser, unauthorized } from "@/lib/auth";
import { encryptToken, instagramSettings, OAUTH_COOKIE, verifyInstagramState } from "@/lib/instagram";

export async function GET(request: NextRequest) {
  const userId = getSessionUser(request);
  if (!userId) return unauthorized();
  const config = instagramSettings();
  if (!config) return NextResponse.json({ error: "Instagram OAuth no configurado" }, { status: 503 });
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.replace(/#_$/, "");
  const state = searchParams.get("state");
  if (!code || code.length > 1024 || !state || state.length > 2048 ||
      request.cookies.get(OAUTH_COOKIE)?.value !== state ||
      verifyInstagramState(state, config.sessionSecret) !== userId)
    return NextResponse.json({ error: "Autorizacion denegada o estado OAuth invalido" }, { status: 400 });
  try {
    const form = new URLSearchParams({
      client_id: config.clientId, client_secret: config.clientSecret,
      grant_type: "authorization_code", redirect_uri: config.redirectUri, code,
    });
    const shortResponse = await fetch("https://api.instagram.com/oauth/access_token", {
      method: "POST", body: form, cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!shortResponse.ok) throw new Error("Instagram code exchange failed");
    const shortData: unknown = await shortResponse.json();
    if (!shortData || typeof shortData !== "object" || !("access_token" in shortData) ||
        typeof shortData.access_token !== "string") throw new Error("Invalid token response");
    const longUrl = new URL("https://graph.instagram.com/access_token");
    longUrl.searchParams.set("grant_type", "ig_exchange_token");
    longUrl.searchParams.set("client_secret", config.clientSecret);
    longUrl.searchParams.set("access_token", shortData.access_token);
    const longResponse = await fetch(longUrl, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!longResponse.ok) throw new Error("Instagram long token exchange failed");
    const longData: unknown = await longResponse.json();
    if (!longData || typeof longData !== "object" || !("access_token" in longData) ||
        typeof longData.access_token !== "string") throw new Error("Invalid long token response");
    const meResponse = await fetch("https://graph.instagram.com/me?fields=id,username", {
      headers: { Authorization: `Bearer ${longData.access_token}` },
      cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!meResponse.ok) throw new Error("Instagram account verification failed");
    const profile: unknown = await meResponse.json();
    if (!profile || typeof profile !== "object" || !("id" in profile) || typeof profile.id !== "string" ||
        !("username" in profile) || typeof profile.username !== "string")
      throw new Error("Instagram profile unavailable");
    const existing = await prisma.networkAccount.findFirst({ where: { userId, network: "instagram" } });
    const encrypted = encryptToken(longData.access_token, config.key);
    const payload = { accountName: profile.username, credentials: encrypted, isActive: true };
    if (existing) {
      await prisma.networkAccount.update({ where: { id: existing.id }, data: payload });
    } else {
      await prisma.networkAccount.create({ data: { userId, network: "instagram", ...payload } });
    }
    const response = NextResponse.redirect(new URL("/settings?instagram=connected", request.url));
    response.cookies.set(OAUTH_COOKIE, "", {
      httpOnly: true, sameSite: "lax", secure: config.redirectUri.startsWith("https:"),
      path: "/api/instagram", maxAge: 0,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo verificar o guardar la cuenta de Instagram" }, { status: 503 });
  }
}
