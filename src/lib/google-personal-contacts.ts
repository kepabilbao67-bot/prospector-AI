import "server-only";

/**
 * Read-only Google Contacts integration for the authenticated owner.
 * Does not copy data into Airtable, Prospector Prisma or Llamadas 360.
 * Requires a dedicated OAuth refresh-token grant for this application.
 */
export type PersonalContact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: "google_contacts";
};

function configFor(userId: string) {
  const owner = process.env.PROSPECTOR_GOOGLE_CONTACTS_OWNER_USER_ID;
  if (!owner || userId !== owner) return null;
  const clientId = process.env.PROSPECTOR_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.PROSPECTOR_GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.PROSPECTOR_GOOGLE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Google Contacts no está autorizado para Prospectoría");
  return { clientId, clientSecret, refreshToken };
}

async function accessToken(config: { clientId: string; clientSecret: string; refreshToken: string }): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw Error("Google Contacts OAuth no disponible");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !("access_token" in payload) ||
      typeof payload.access_token !== "string") throw Error("Google Contacts OAuth inválido");
  return payload.access_token;
}

type Person = {
  resourceName?: string;
  names?: { displayName?: string }[];
  emailAddresses?: { value?: string }[];
  phoneNumbers?: { value?: string }[];
  organizations?: { name?: string }[];
};
type PeopleResponse = { connections?: Person[]; nextPageToken?: string; totalPeople?: number };

export async function getGooglePersonalContacts(
  userId: string,
  options: { pageToken?: string | null; search?: string | null },
): Promise<{ contacts: PersonalContact[]; nextPageToken: string | null } | null> {
  const config = configFor(userId);
  if (!config) return null;
  const token = await accessToken(config);
  const url = new URL("https://people.googleapis.com/v1/people/me/connections");
  url.searchParams.set("personFields", "names,emailAddresses,phoneNumbers,organizations");
  url.searchParams.set("pageSize", "250");
  if (options.pageToken) url.searchParams.set("pageToken", options.pageToken);
  const result = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!result.ok) throw Error("Google Contacts no disponible");
  const payload = await result.json() as PeopleResponse;
  if (payload.connections && !Array.isArray(payload.connections)) throw Error("Google Contacts respuesta inválida");
  const search = (options.search || "").trim().toLocaleLowerCase("es");
  const contacts = (payload.connections || []).map((p): PersonalContact => ({
    id: p.resourceName || "",
    name: p.names?.[0]?.displayName || "",
    email: p.emailAddresses?.[0]?.value || null,
    phone: p.phoneNumbers?.[0]?.value || null,
    company: p.organizations?.[0]?.name || null,
    source: "google_contacts",
  })).filter(p => p.id.startsWith("people/") && p.name &&
    (!search || [p.name, p.email, p.phone, p.company].some(v => v?.toLocaleLowerCase("es").includes(search))));
  return { contacts, nextPageToken: payload.nextPageToken || null };
}
