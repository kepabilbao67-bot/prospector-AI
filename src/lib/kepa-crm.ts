import { createClient } from "@libsql/client";

export interface KepaContact {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  company: string | null;
  jobTitle: string | null;
  network: string;
  tags: string;
  status: string;
  score: number;
}

const TENANT = "kepa";
const MAX_CONTACTS = 10000;

export function kepaCrmConfig() {
  const url = process.env.KEPA_CRM_TURSO_URL;
  const authToken = process.env.KEPA_CRM_TURSO_READ_TOKEN;
  if (!url || !authToken || authToken.length < 32) return null;
  try {
    const parsed = new URL(url);
    if (!["libsql:", "https:"].includes(parsed.protocol) ||
        !parsed.hostname.endsWith(".turso.io") || parsed.username || parsed.password ||
        parsed.port || (parsed.pathname !== "/" && parsed.pathname !== "") ||
        parsed.search || parsed.hash) return null;
    return { url, authToken, tenantId: TENANT };
  } catch { return null; }
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
export function parseKepaContacts(response: unknown, tenantId = TENANT): KepaContact[] {
  if (tenantId !== TENANT || !record(response) || response.success !== true ||
      !Array.isArray(response.data) || response.data.length > MAX_CONTACTS)
    throw new Error("Invalid CRM response");
  const ids = new Set<string>();
  return response.data.map((value: unknown) => {
    if (!record(value) || typeof value.id !== "string" || !value.id ||
        value.tenantId !== TENANT || typeof value.name !== "string" ||
        !value.name.trim() || ids.has(value.id))
      throw new Error("Invalid, duplicated or foreign CRM contact");
    ids.add(value.id);
    const words = value.name.trim().split(/\s+/);
    const tags = Array.isArray(value.tags)
      ? value.tags.filter((tag): tag is string => typeof tag === "string") : [];
    return {
      id: "kepa:" + value.id,
      firstName: words[0],
      lastName: words.length > 1 ? words.slice(1).join(" ") : null,
      phone: typeof value.phone === "string" ? value.phone : null,
      email: typeof value.email === "string" ? value.email : null,
      company: typeof value.company === "string" ? value.company : null,
      jobTitle: null, network: "other", tags: JSON.stringify(tags),
      status: "new", score: 0,
    };
  });
}
export async function readKepaCrm() {
  const config = kepaCrmConfig();
  if (!config) return { ok: false as const, reason: "not_configured" };
  const client = createClient({ url: config.url, authToken: config.authToken });
  try {
    const counted = await client.execute({
      sql: "SELECT COUNT(*) AS total FROM panel_contacts WHERE tenant_id = ?",
      args: [TENANT],
    });
    const total = Number(counted.rows[0]?.total);
    if (!Number.isSafeInteger(total) || total < 0 || total > MAX_CONTACTS)
      throw new Error("Contact count invalid or over safety limit");
    const response = await client.execute({
      sql: "SELECT doc FROM panel_contacts WHERE tenant_id = ? ORDER BY updated_at DESC LIMIT ?",
      args: [TENANT, MAX_CONTACTS],
    });
    const docs: unknown[] = response.rows.map(row => {
      if (typeof row.doc !== "string") throw new Error("Invalid CRM document");
      return JSON.parse(row.doc) as unknown;
    });
    const contacts = parseKepaContacts({ success: true, data: docs });
    if (contacts.length !== total) throw new Error("Incomplete CRM read");
    return { ok: true as const, contacts, count: total };
  } finally {
    client.close();
  }
}
