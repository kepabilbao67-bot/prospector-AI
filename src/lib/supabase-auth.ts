type AuthUser = { id?: string; email?: string; email_confirmed_at?: string | null };
type PasswordResponse = { access_token?: string; user?: AuthUser; error?: string };

export function supabaseAuthEnabled(): boolean {
  return process.env.PROSPECTOR_AUTH_PROVIDER === "supabase";
}

export function supabaseAuthConfig() {
  const url = process.env.PROSPECTOR_SUPABASE_URL;
  const key = process.env.PROSPECTOR_SUPABASE_PUBLISHABLE_KEY;
  const owner = process.env.PROSPECTOR_OWNER_EMAIL?.trim().toLowerCase();
  if (!url || !key || !owner || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(owner)) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !/^[a-z0-9]{20}\.supabase\.co$/.test(parsed.host) ||
        parsed.pathname !== "/" || parsed.search || parsed.hash) return null;
    if (!key.startsWith("sb_publishable_") && !key.startsWith("eyJ")) return null;
    return { url: parsed.origin, key, owner };
  } catch { return null; }
}

export async function verifySupabasePassword(email: string, password: string):
  Promise<"ok" | "invalid" | "unavailable"> {
  const config = supabaseAuthConfig();
  if (!config) return "unavailable";
  if (email.trim().toLowerCase() !== config.owner) return "invalid";
  try {
    const response = await fetch(config.url + "/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { "apikey": config.key, "Content-Type": "application/json" },
      body: JSON.stringify({ email: config.owner, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (response.status === 400 || response.status === 401 || response.status === 422) return "invalid";
    if (!response.ok) return "unavailable";
    const json: PasswordResponse = await response.json();
    if (!json.access_token || !json.user?.id ||
        json.user.email?.toLowerCase() !== config.owner ||
        !json.user.email_confirmed_at) return "invalid";
    return "ok";
  } catch { return "unavailable"; }
}

export async function registerSupabaseOwner(email: string, password: string):
  Promise<"sent" | "invalid" | "rate_limited" | "unavailable"> {
  const config = supabaseAuthConfig();
  if (!config) return "unavailable";
  if (email.trim().toLowerCase() !== config.owner) return "invalid";
  if (password.length < 20 || password.length > 256) return "invalid";
  try {
    const response = await fetch(config.url + "/auth/v1/signup", {
      method: "POST",
      headers: { "apikey": config.key, "Content-Type": "application/json" },
      body: JSON.stringify({ email: config.owner, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    if (response.status === 429) return "rate_limited";
    if (!response.ok) return "unavailable";
    return "sent";
  } catch { return "unavailable"; }
}
