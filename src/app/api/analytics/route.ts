import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");
    const network = searchParams.get("network");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: Record<string, unknown> = {
      userId: "default-user",
      createdAt: { gte: startDate },
    };
    if (network && network !== "all") where.network = network;

    // Get events grouped by type
    const events = await prisma.analyticsEvent.findMany({
      where,
      orderBy: { createdAt: "asc" },
    });

    // Calculate summary stats
    const stats = {
      messagesSent: events.filter((e) => e.eventType === "message_sent").length,
      repliesReceived: events.filter((e) => e.eventType === "reply_received").length,
      connectionsAccepted: events.filter((e) => e.eventType === "connection_accepted").length,
      profilesViewed: events.filter((e) => e.eventType === "profile_viewed").length,
      conversions: events.filter((e) => e.eventType === "conversion").length,
    };

    const replyRate = stats.messagesSent > 0 
      ? ((stats.repliesReceived / stats.messagesSent) * 100).toFixed(1)
      : "0";

    const conversionRate = stats.messagesSent > 0
      ? ((stats.conversions / stats.messagesSent) * 100).toFixed(1)
      : "0";

    // Group by day for chart
    const dailyData: Record<string, Record<string, number>> = {};
    events.forEach((event) => {
      const day = event.createdAt.toISOString().split("T")[0];
      if (!dailyData[day]) dailyData[day] = {};
      dailyData[day][event.eventType] = (dailyData[day][event.eventType] || 0) + 1;
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date,
      ...data,
    }));

    // Group by network
    const networkStats: Record<string, Record<string, number>> = {};
    events.forEach((event) => {
      if (!networkStats[event.network]) networkStats[event.network] = {};
      networkStats[event.network][event.eventType] = (networkStats[event.network][event.eventType] || 0) + 1;
    });

    return NextResponse.json({
      stats,
      replyRate,
      conversionRate,
      chartData,
      networkStats,
      totalEvents: events.length,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Error fetching analytics" }, { status: 500 });
  }
}
