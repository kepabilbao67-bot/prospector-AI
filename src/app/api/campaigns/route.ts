import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

async function sessionUserId(request: NextRequest): Promise<string | null> {
  return (await verifySession(request.cookies.get(SESSION_COOKIE)?.value))?.userId ?? null;
}

export async function GET(request: NextRequest) {
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: { steps: { orderBy: { order: "asc" } }, campaignContacts: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ campaigns }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Campañas no disponibles" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await sessionUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let input: unknown;
  try { input = await request.json(); }
  catch { return NextResponse.json({ error: "JSON inválido" }, { status: 400 }); }
  if (!input || typeof input !== "object" || Array.isArray(input))
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });

  const data = input as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const description = typeof data.description === "string" ? data.description.trim() : null;
  const network = typeof data.network === "string" ? data.network : "multi";
  const validNetworks = ["linkedin", "fiverr", "twitter", "instagram", "email", "multi"];
  if (name.length < 1 || name.length > 160 || (description && description.length > 2000) ||
      !validNetworks.includes(network))
    return NextResponse.json({ error: "Datos de campaña inválidos" }, { status: 400 });

  const settings = data.settings == null ? {} : data.settings;
  if (typeof settings !== "object" || Array.isArray(settings) ||
      JSON.stringify(settings).length > 10000)
    return NextResponse.json({ error: "Configuración inválida" }, { status: 400 });

  try {
    const created = await prisma.campaign.create({
      data: {
        userId,
        name,
        description,
        network,
        status: "draft",
        settings: JSON.stringify(settings),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No se pudo guardar la campaña" }, { status: 503 });
  }
}
