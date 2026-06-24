import { NextRequest, NextResponse } from "next/server";
import { DEMO_CAMPAIGNS } from "@/lib/demo-data";

let inMemoryCampaigns = [...DEMO_CAMPAIGNS];

async function getCampaigns() {
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const campaigns = await prisma.campaign.findMany({
      where: { userId: "default-user" },
      include: { steps: { orderBy: { order: "asc" } }, campaignContacts: true },
      orderBy: { createdAt: "desc" },
    });
    if (campaigns.length > 0) return campaigns;
  } catch { /* DB not available */ }
  return inMemoryCampaigns;
}

export async function GET() {
  try {
    const campaigns = await getCampaigns();
    return NextResponse.json({ campaigns });
  } catch {
    return NextResponse.json({ campaigns: DEMO_CAMPAIGNS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const campaign = {
      id: `camp${Date.now()}`,
      userId: "default-user",
      name: body.name,
      description: body.description || null,
      network: body.network || "multi",
      status: "draft",
      settings: JSON.stringify(body.settings || { dailyLimit: 50 }),
      stats: '{"sent":0,"replied":0,"converted":0}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [],
      campaignContacts: [],
    };

    try {
      const prisma = (await import("@/lib/prisma")).default;
      const created = await prisma.campaign.create({
        data: { userId: "default-user", name: body.name, description: body.description, network: body.network || "multi", status: "draft", settings: JSON.stringify(body.settings || {}) },
      });
      return NextResponse.json(created, { status: 201 });
    } catch {
      inMemoryCampaigns.unshift(campaign);
      return NextResponse.json(campaign, { status: 201 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
