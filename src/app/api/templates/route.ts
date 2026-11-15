import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const userId = getSessionUser(request);
  if (!userId) return unauthorized();
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const templates = await prisma.template.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ error: "Plantillas no disponibles: CRM desconectado" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getSessionUser(request);
  if (!userId) return unauthorized();
  try {
    const body = await request.json();
    if (![body.name, body.network, body.type, body.content].every((value) => typeof value === "string" && value.trim().length > 0)) {
      return NextResponse.json({ error: "Nombre, red, tipo y contenido son obligatorios" }, { status: 400 });
    }
    try {
      const prisma = (await import("@/lib/prisma")).default;
      const template = await prisma.template.create({
        data: {
          userId,
          name: body.name.trim(),
          network: body.network.trim(),
          type: body.type.trim(),
          subject: typeof body.subject === "string" ? body.subject : null,
          content: body.content,
        },
      });
      return NextResponse.json(template, { status: 201 });
    } catch {
      return NextResponse.json({ error: "CRM no disponible; plantilla no guardada" }, { status: 503 });
    }
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
