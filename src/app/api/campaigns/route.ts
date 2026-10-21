import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/require-auth";

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: { steps: { orderBy: { order: "asc" } }, campaignContacts: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ campaigns });
  } catch {
    return NextResponse.json({ error: "Campaigns unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (typeof body.name !== "string" || !body.name.trim() || body.name.length > 200) {
      return NextResponse.json({ error: "Invalid campaign name" }, { status: 400 });
    }
    const campaign = await prisma.campaign.create({
      data: { userId, name: body.name.trim(), description: body.description || null,
        network: body.network || "multi", status: "draft",
        settings: JSON.stringify(body.settings || {}) },
    });
    return NextResponse.json(campaign, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Campaign was not saved" }, { status: 503 });
  }
}
