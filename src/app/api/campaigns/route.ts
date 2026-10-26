import { configuredOperatorId } from "@/lib/operator-identity";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// No demo fallback. Authentication and tenant scoping are required before release.
export async function GET() {
  const userId = configuredOperatorId();
  if (!userId) return NextResponse.json({ error: "Operator identity not configured" }, { status: 503 });
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId: userId },
      include: { steps: { orderBy: { order: "asc" } }, campaignContacts: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Campaign database unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = configuredOperatorId();
  if (!userId) return NextResponse.json({ error: "Operator identity not configured" }, { status: 503 });
  try {
    const body = await request.json();
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }
    const created = await prisma.campaign.create({
      data: {
        userId: userId,
        name: body.name.trim(),
        description: body.description || null,
        network: body.network || "multi",
        status: "draft",
        settings: JSON.stringify(body.settings || {}),
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Campaign was not saved" }, { status: 503 });
  }
}
