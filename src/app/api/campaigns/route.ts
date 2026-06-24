import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const network = searchParams.get("network");

    const where: Record<string, unknown> = { userId: "default-user" };
    if (status && status !== "all") where.status = status;
    if (network && network !== "all") where.network = network;

    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        steps: { orderBy: { order: "asc" } },
        campaignContacts: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Error fetching campaigns" }, { status: 500 });
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const campaign = await prisma.campaign.create({
      data: {
        userId: "default-user",
        name: body.name,
        description: body.description || null,
        network: body.network || "multi",
        status: "draft",
        settings: JSON.stringify(body.settings || { dailyLimit: 50, startHour: 9, endHour: 18 }),
      },
    });

    // Create steps if provided
    if (body.steps && body.steps.length > 0) {
      await prisma.campaignStep.createMany({
        data: body.steps.map((step: Record<string, unknown>, index: number) => ({
          campaignId: campaign.id,
          order: index + 1,
          type: step.type as string,
          network: (step.network as string) || body.network || "multi",
          templateId: (step.templateId as string) || null,
          config: JSON.stringify(step.config || {}),
          delayHours: (step.delayHours as number) || 24,
        })),
      });
    }

    const fullCampaign = await prisma.campaign.findUnique({
      where: { id: campaign.id },
      include: { steps: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json(fullCampaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Error creating campaign" }, { status: 500 });
  }
}
