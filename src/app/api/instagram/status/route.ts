import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";
import { decryptToken, instagramSettings } from "@/lib/instagram";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = getSessionUser(request);
  if (!userId) return unauthorized();
  const config = instagramSettings();
  if (!config) return NextResponse.json({ connected: false, reason: "not_configured" }, { status: 503 });
  try {
    const account = await prisma.networkAccount.findFirst({ where: { userId, network: "instagram", isActive: true } });
    if (!account?.credentials) return NextResponse.json({ connected: false, reason: "not_authorized" });
    const token = decryptToken(account.credentials, config.key);
    const response = await fetch("https://graph.instagram.com/me?fields=id,username", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store", signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return NextResponse.json({ connected: false, reason: "authorization_expired_or_invalid" }, { status: 502 });
    const profile: unknown = await response.json();
    if (!profile || typeof profile !== "object" || !("id" in profile) || typeof profile.id !== "string" ||
        !("username" in profile) || typeof profile.username !== "string")
      return NextResponse.json({ connected: false, reason: "invalid_provider_response" }, { status: 502 });
    return NextResponse.json({ connected: true, username: profile.username, readOnly: true });
  } catch {
    return NextResponse.json({ connected: false, reason: "verification_unavailable" }, { status: 503 });
  }
}
