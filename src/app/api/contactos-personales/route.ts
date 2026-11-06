import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { getGooglePersonalContacts } from "@/lib/google-personal-contacts";

export async function GET(request: NextRequest) {
  const userId = (await verifySession(request.cookies.get(SESSION_COOKIE)?.value))?.userId;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = request.nextUrl.searchParams;
  const pageToken = params.get("pageToken");
  const search = params.get("search");
  if ((pageToken && pageToken.length > 1024) || (search && search.length > 120))
    return NextResponse.json({ error: "Filtro inválido" }, { status: 400 });
  try {
    const data = await getGooglePersonalContacts(userId, { pageToken, search });
    if (!data) return NextResponse.json({ error: "Agenda personal no habilitada para este usuario" }, { status: 403 });
    return NextResponse.json(data, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Agenda de Google no conectada todavía" }, { status: 503 });
  }
}
