import { configuredOperatorId } from "@/lib/operator-identity";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const userId = configuredOperatorId();
  if (!userId) return NextResponse.json({ error: "Operator identity not configured" }, { status: 503 });
  try {
    const events = await prisma.analyticsEvent.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "asc" },
    });
    const stats = {
      messagesSent: events.filter(e => e.eventType === "message_sent").length,
      repliesReceived: events.filter(e => e.eventType === "reply_received").length,
      connectionsAccepted: events.filter(e => e.eventType === "connection_accepted").length,
      profilesViewed: events.filter(e => e.eventType === "profile_viewed").length,
      conversions: events.filter(e => e.eventType === "conversion").length,
    };
    const replyRate = stats.messagesSent > 0 ? ((stats.repliesReceived / stats.messagesSent) * 100).toFixed(1) : "0";
    const conversionRate = stats.messagesSent > 0 ? ((stats.conversions / stats.messagesSent) * 100).toFixed(1) : "0";
    return NextResponse.json({ stats, replyRate, conversionRate, chartData: [], networkStats: {}, totalEvents: events.length });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Analytics database unavailable" }, { status: 503 });
  }
}
