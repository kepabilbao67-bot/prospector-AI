/**
 * Airtable CRM Ventas adapter.
 * This uses the EXISTING commercial CRM; it does not provision or migrate a database.
 * Must be server-only. No Airtable credentials may reach the browser.
 */
import "server-only";

type AirtableRecord = {
  id: string;
  createdTime: string;
  fields: Record<string, unknown>;
};
type AirtableList = { records: AirtableRecord[]; offset?: string };
type ContactInput = {
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  company?: string | null;
  network?: string | null;
  jobTitle?: string | null;
};

const BASE = "app" + "tF660qSKGAfAkJ";
const TABLE = "tblI84JXMxXnvFv2N";
const URL_BASE = `https://api.airtable.com/v0/${BASE}/${TABLE}`;
const FIELD_NAME = "Nombre del cliente";
const FIELD_EMAIL = "Correo electrónic";
const FIELD_COMPANY = "Empresa";

function configFor(userId: string): { token: string } | null {
  const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  const ownerId = process.env.PROSPECTOR_AIRTABLE_OWNER_USER_ID;
  // Airtable's shared commercial CRM is NOT a multi-tenant data store.
  // Fail closed rather than reveal a different user's contact records.
  if (!ownerId && !token) return null;
  if (!ownerId) throw new Error("Airtable CRM owner is not configured");
  if (userId !== ownerId) return null;
  // Never silently fall back to another CRM if Airtable is assigned to this user.
  if (!token) throw new Error("Airtable CRM credentials are missing");
  return { token };
}

async function airtable(
  token: string,
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`Airtable CRM HTTP ${res.status}`);
  return res;
}

async function listRecords(token: string): Promise<AirtableRecord[]> {
  const items: AirtableRecord[] = [];
  let offset: string | undefined;
  do {
    const url = new URL(URL_BASE);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const result = (await (await airtable(token, url.toString())).json()) as AirtableList;
    if (!Array.isArray(result.records)) throw Error("Invalid Airtable CRM response");
    items.push(...result.records);
    offset = result.offset;
    if (items.length > 1000) throw Error("CRM exceeds safe read limit");
  } while (offset);
  return items;
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalize(value: string): string {
  return value.trim().toLocaleLowerCase("es");
}

function mapRecord(record: AirtableRecord, userId: string) {
  const fullName = asText(record.fields[FIELD_NAME]).trim();
  const [firstName, ...last] = fullName.split(/\s+/);
  const source = record.fields.Origen;
  const origin = typeof source === "object" && source !== null && "name" in source
    ? asText((source as { name: unknown }).name)
    : asText(source);
  const originKey = normalize(origin);
  const network = originKey === "linkedin" ? "linkedin" : originKey === "gmail" ? "email" : originKey === "whatsapp" ? "whatsapp" : "other";
  const pipeline = record.fields["Pipeline Lead"];
  const pipelineName = typeof pipeline === "object" && pipeline !== null && "name" in pipeline
    ? asText((pipeline as { name: unknown }).name)
    : asText(pipeline);
  const stage = normalize(pipelineName);
  // Map only explicitly defined CRM pipeline stages, without inventing replies.
  const status = stage === "negociacion" ? "qualified"
    : stage === "negocio rechazado" ? "lost"
    : stage === "acuerdo cerrado" ? "converted"
    : stage === "propuesta enviada" ? "contacted" : "new";
  return {
    id: record.id,
    userId,
    firstName: firstName || fullName,
    lastName: last.join(" ") || null,
    email: asText(record.fields[FIELD_EMAIL]) || null,
    company: asText(record.fields[FIELD_COMPANY]) || null,
    jobTitle: null,
    network,
    status,
    score: 0,
    tags: "[]",
    profileUrl: null,
    createdAt: record.createdTime,
    updatedAt: record.createdTime,
    source: "airtable",
    airtablePipeline: pipelineName || null,
  };
}

/**
 * null means no Airtable integration is enabled for this authenticated user.
 * Failures throw and must result in HTTP 503, never fabricated demo data.
 */
export async function readAirtableContacts(
  userId: string,
  filters: { search?: string | null; network?: string | null; status?: string | null; page?: number },
) {
  const cfg = configFor(userId);
  if (!cfg) return null;
  const records = await listRecords(cfg.token);
  const term = normalize(filters.search || "");
  const mapped = records.map(record => mapRecord(record, userId));
  const filtered = mapped.filter(contact =>
    (!term || [contact.firstName, contact.lastName, contact.company, contact.email]
      .some(value => normalize(value || "").includes(term))) &&
    (!filters.network || filters.network === "all" || filters.network === contact.network) &&
    (!filters.status || filters.status === "all" || filters.status === contact.status)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 50));
  const page = Number.isSafeInteger(filters.page) && (filters.page || 0) > 0 ? Math.min(filters.page!, totalPages) : 1;
  const start = (page - 1) * 50;
  return { contacts: filtered.slice(start, start + 50), total: filtered.length, page, totalPages };
}

export async function createAirtableContact(userId: string, input: ContactInput) {
  const cfg = configFor(userId);
  if (!cfg) return null;
  const fullName = [input.firstName.trim(), input.lastName?.trim()].filter(Boolean).join(" ");
  if (!fullName || fullName.length > 120) throw Error("Invalid contact name");
  const records = await listRecords(cfg.token);
  const email = normalize(input.email || "");
  const company = normalize(input.company || "");
  const collision = records.find(record =>
    (email && normalize(asText(record.fields[FIELD_EMAIL])) === email) ||
    (normalize(asText(record.fields[FIELD_NAME])) === normalize(fullName) &&
     normalize(asText(record.fields[FIELD_COMPANY])) === company)
  );
  if (collision) return { duplicate: true, contact: mapRecord(collision, userId) };

  const fields: Record<string, string> = { [FIELD_NAME]: fullName };
  if (input.email?.trim()) fields[FIELD_EMAIL] = input.email.trim();
  if (input.company?.trim()) fields[FIELD_COMPANY] = input.company.trim();
  const response = await airtable(cfg.token, URL_BASE, {
    method: "POST",
    body: JSON.stringify({ records: [{ fields }], typecast: false }),
  });
  const result = await response.json() as { records?: AirtableRecord[] };
  if (!result.records?.[0]?.id) throw Error("Airtable did not confirm persistence");
  return { duplicate: false, contact: mapRecord(result.records[0], userId) };
}
