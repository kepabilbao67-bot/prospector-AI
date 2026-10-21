import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Fail closed: never accept user IDs supplied in request headers or bodies.
 * Configure AUTH_JWT_SECRET and issue signed session cookies after login.
 */
export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get("prospector_session")?.value;
  const secret = process.env.AUTH_JWT_SECRET;
  if (!token || !secret || secret.length < 32) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"],
    });
    return typeof payload.sub === "string" && payload.sub.length > 0 ? payload.sub : null;
  } catch {
    return null;
  }
}
