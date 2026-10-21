import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/require-auth";

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const events = await prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });


    const stats = {
      messagesSent: events.filter((e) => e.eventType === "message_sent").length,
      repliesReceived: events.filter((e) => e.eventType === "reply_received").length,
      connectionsAccepted: events.filter((e) => e.eventType === "connection_accepted").length,
      profilesViewed: events.filter((e) => e.eventType === "profile_viewed").length,
      conversions: events.filter((e) => e.eventType === "conversion").length,
    };

    const replyRate = stats.messagesSent > 0 ? ((stats.repliesReceived / stats.messagesSent) * 100).toFixed(1) : "0";
    const conversionRate = stats.messagesSent > 0 ? ((stats.conversions / stats.messagesSent) * 100).toFixed(1) : "0";

    return NextResponse.json({ stats, replyRate, conversionRate, chartData: [], networkStats: {}, totalEvents: events.length });
  } catch {
    return NextResponse.json({ error: "Analytics unavailable" }, { status: 503 });
  }
}
