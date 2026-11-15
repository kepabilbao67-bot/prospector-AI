import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";
import { localFlyBridgeEnabled, readKepaViaFly } from "@/lib/kepa-crm-fly";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = getSessionUser(request);
  if (!userId) return unauthorized();
  if (!localFlyBridgeEnabled()) return NextResponse.json({ connected: false, reason: "local_bridge_unavailable" }, { status: 503 });
  try {
    const owner = await prisma.user.findUnique({
      where: { id: "prospector-local-owner" }, select: { id: true },
    });
    if (!owner || owner.id !== userId)
      return NextResponse.json({ error: "Acceso no autorizado al CRM de Kepa" }, { status: 403 });
    const result = await readKepaViaFly();
    return NextResponse.json({
      connected: true, readOnly: true, source: "Llamadas360",
      contacts: result.contacts, total: result.count,
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ connected: false, reason: "invalid_or_unavailable_source" }, { status: 503 });
  }
}
