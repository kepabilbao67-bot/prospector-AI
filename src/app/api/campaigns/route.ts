import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, unauthorized } from "@/lib/auth";
async function getCampaigns(userId: string) {
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: { steps: { orderBy: { order: "asc" } }, campaignContacts: true },
      orderBy: { createdAt: "desc" },
    });
    return campaigns;
  } catch {
    throw new Error("Campaign database unavailable");
  }
}

export async function GET(request: NextRequest) {
  const userId = getSessionUser(request);
  if (!userId) return unauthorized();
  try {
    const campaigns = await getCampaigns(userId);
    return NextResponse.json({ campaigns });
  } catch {
    return NextResponse.json({ error: "CRM no disponible; no se muestran campañas de demostración" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = getSessionUser(request);
  if (!userId) return unauthorized();
  try {
    const body = await request.json();
    try {
      const prisma = (await import("@/lib/prisma")).default;
      const created = await prisma.campaign.create({
        data: { userId, name: body.name, description: body.description, network: body.network || "multi", status: "draft", settings: JSON.stringify(body.settings || {}) },
      });
      return NextResponse.json(created, { status: 201 });
    } catch {
      return NextResponse.json({ error: "CRM no disponible; campaña no guardada" }, { status: 503 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
