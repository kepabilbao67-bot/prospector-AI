import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { configuredOperatorId } from "@/lib/operator-identity";

// Single-operator read-only recovery. Writes remain disabled until sessions,
// authorization and explicit campaign safety checks are implemented.
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = configuredOperatorId();
  if (!userId) return NextResponse.json({ error: "Operator identity not configured" }, { status: 503 });
  const { id } = await context.params;
  if (!id || id.length > 128) return NextResponse.json({ error: "Invalid campaign ID" }, { status: 400 });
  try {
    const campaign = await prisma.campaign.findFirst({
      where: { id, userId },
      include: { steps: { orderBy: { order: "asc" } }, campaignContacts: true },
    });
    if (!campaign) return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error loading campaign:", error);
    return NextResponse.json({ error: "Campaign database unavailable" }, { status: 503 });
  }
}
const blocked = () => NextResponse.json({ error: "Campaign modifications are disabled pending authorization" }, { status: 503 });
export async function PUT() { return blocked(); }
export async function DELETE() { return blocked(); }
