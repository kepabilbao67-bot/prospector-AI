import jwt, { type JwtPayload } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE = "prospector_session";
export const SESSION_MAX_AGE = 8 * 60 * 60;

export function getSessionUser(request: NextRequest): string | null {
  const secret = process.env.PROSPECTOR_SESSION_SECRET;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!secret || secret.length < 32 || !token) return null;
  try {
    const decoded = jwt.verify(token, secret, { algorithms: ["HS256"], issuer: "prospector360", audience: "prospector360" }) as JwtPayload;
    return typeof decoded.sub === "string" && decoded.sub.length > 0 && decoded.sub.length <= 128 ? decoded.sub : null;
  } catch {
    return null;
  }
}

export function issueSession(userId: string): string {
  const secret = process.env.PROSPECTOR_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Session signing secret not configured");
  return jwt.sign({}, secret, { algorithm: "HS256", subject: userId, issuer: "prospector360", audience: "prospector360", expiresIn: SESSION_MAX_AGE });
}

export function unauthorized() {
  return NextResponse.json({ error: "Autenticacion requerida" }, { status: 401 });
}
