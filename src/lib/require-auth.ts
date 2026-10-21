import { NextRequest } from "next/server";
import jwt, { type JwtPayload } from "jsonwebtoken";

export function getSessionSecret(): string | null {
  const secret = process.env.AUTH_JWT_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("prospector_session")?.value;
  const secret = getSessionSecret();
  if (!token || !secret) return null;
  try {
    const payload = jwt.verify(token, secret, { algorithms: ["HS256"] }) as JwtPayload;
    return typeof payload.sub === "string" && payload.sub.length > 0 ? payload.sub : null;
  } catch {
    return null;
  }
}
