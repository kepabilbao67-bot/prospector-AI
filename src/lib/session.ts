import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

const COOKIE = "prospector_session";
const MAX_AGE = 60 * 60 * 12;
const enc = (s: string) => Buffer.from(s).toString("base64url");
function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET not configured securely");
  return value;
}
function signature(body: string) {
  return createHmac("sha256", secret()).update(body).digest("base64url");
}
export function sessionToken(userId: string) {
  const payload = enc(JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + MAX_AGE }));
  return payload + "." + signature(payload);
}
export function sessionCookie(response: import("next/server").NextResponse, value: string) {
  response.cookies.set(COOKIE, value, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE, path: "/",
  });
  return response;
}
export function clearSession(response: import("next/server").NextResponse) {
  response.cookies.set(COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 0, path: "/" });
  return response;
}
export async function currentUser() {
  try {
    const value = (await cookies()).get(COOKIE)?.value;
    if (!value) return null;
    const [data, mac, extra] = value.split(".");
    if (!data || !mac || extra) return null;
    const a = Buffer.from(signature(data));
    const b = Buffer.from(mac);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload: unknown = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!payload || typeof payload !== "object") return null;
    const p = payload as { sub?: unknown; exp?: unknown };
    if (typeof p.sub !== "string" || typeof p.exp !== "number" || p.exp <= Date.now() / 1000) return null;
    return prisma.user.findUnique({ where: { id: p.sub }, select: { id: true, name: true, email: true } });
  } catch { return null; }
}
