import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "prospector_session";
const options = { issuer: "prospector-ai", audience: "prospector-ai" };

export function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) throw new Error("SESSION_SECRET must contain at least 32 bytes");
  return secret;
}

export function verifySession(token: string): string | null {
  try {
    const claims = jwt.verify(token, sessionSecret(), { ...options, algorithms: ["HS256"] });
    return typeof claims !== "string" && typeof claims.sub === "string" && claims.sub.length > 0 ? claims.sub : null;
  } catch { return null; }
}

export function createSession(userId: string): string {
  return jwt.sign({}, sessionSecret(), { ...options, algorithm: "HS256", subject: userId, expiresIn: "8h" });
}

export async function sessionUserId(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = token && verifySession(token);
  if (!userId) throw new Error("Authentication required");
  return userId;
}
