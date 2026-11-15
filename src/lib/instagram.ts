import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import jwt, { type JwtPayload } from "jsonwebtoken";

export const OAUTH_COOKIE = "prospector_instagram_state";
export const OAUTH_AGE_SECONDS = 600;

export function instagramSettings() {
  const clientId = process.env.INSTAGRAM_APP_ID;
  const clientSecret = process.env.INSTAGRAM_APP_SECRET;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  const key = process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY;
  const sessionSecret = process.env.PROSPECTOR_SESSION_SECRET;
  if (!clientId || !clientSecret || !redirectUri || !sessionSecret || sessionSecret.length < 32 ||
      !key || !/^[0-9a-fA-F]{64}$/.test(key)) return null;
  try {
    const uri = new URL(redirectUri);
    if (uri.protocol !== "https:" && !(uri.protocol === "http:" && ["127.0.0.1","localhost"].includes(uri.hostname))) return null;
    if (uri.pathname !== "/api/instagram/callback" || uri.search || uri.hash) return null;
  } catch { return null; }
  return { clientId, clientSecret, redirectUri, key: Buffer.from(key, "hex"), sessionSecret };
}

export function encryptToken(token: string, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptToken(value: string, key: Buffer) {
  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") throw new Error("Unsupported Instagram token format");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(parts[1], "base64url"));
  decipher.setAuthTag(Buffer.from(parts[2], "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(parts[3], "base64url")), decipher.final()]).toString("utf8");
}

export function signInstagramState(userId: string, secret: string) {
  return jwt.sign({ nonce: randomBytes(18).toString("hex") }, secret, {
    algorithm: "HS256", issuer: "prospector360-instagram", audience: "prospector360-instagram",
    subject: userId, expiresIn: OAUTH_AGE_SECONDS,
  });
}
export function verifyInstagramState(state: string, secret: string): string | null {
  try {
    const data = jwt.verify(state, secret, {
      algorithms: ["HS256"], issuer: "prospector360-instagram", audience: "prospector360-instagram",
    }) as JwtPayload;
    return typeof data.sub === "string" ? data.sub : null;
  } catch { return null; }
}
