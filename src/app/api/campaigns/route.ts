import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const campaigns = await prisma.campaign.findMany({
      where: { userId: "default-user" },
      include: { steps: { orderBy: { order: "asc" } }, campaignContacts: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error loading campaigns:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }
    const prisma = (await import("@/lib/prisma")).default;
    const campaign = await prisma.campaign.create({
      data: {
        userId: "default-user",
        name: body.name.trim(),
        description: typeof body.description === "string" ? body.description : null,
        network: body.network || "multi",
        status: "draft",
        settings: JSON.stringify(body.settings || {}),
      },
    });
    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
