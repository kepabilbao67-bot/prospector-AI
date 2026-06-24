import { NextResponse } from "next/server";
import { DEMO_ANALYTICS } from "@/lib/demo-data";

export async function GET() {
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const events = await prisma.analyticsEvent.findMany({
      where: { userId: "default-user" },
      orderBy: { createdAt: "asc" },
    });

    if (events.length === 0) return NextResponse.json(DEMO_ANALYTICS);

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
    return NextResponse.json(DEMO_ANALYTICS);
  }
}
