import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/campaigns/[id] - Get a campaign by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId: "default-user" },
      include: {
        steps: { orderBy: { order: "asc" }, include: { template: true } },
        campaignContacts: { include: { contact: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json({ error: "Error fetching campaign" }, { status: 500 });
  }
}

// PUT /api/campaigns/[id] - Update campaign
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.campaign.findFirst({ where: { id, userId: "default-user" } });
    if (!existing) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    const campaign = await prisma.campaign.update({
      where: { id: existing.id },
      data: {
        name: body.name,
        description: body.description,
        network: body.network,
        status: body.status,
        settings: body.settings ? JSON.stringify(body.settings) : undefined,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return NextResponse.json({ error: "Error updating campaign" }, { status: 500 });
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await prisma.campaign.findFirst({ where: { id, userId: "default-user" } });
    if (!existing) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    await prisma.campaign.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json({ error: "Error deleting campaign" }, { status: 500 });
  }
}
