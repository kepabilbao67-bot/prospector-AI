import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateDailyInsights } from "@/lib/ai-templates";

// GET /api/daily-summary - Get daily AI-powered summary
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's analytics
    const events = await prisma.analyticsEvent.findMany({
      where: { userId: "default-user", createdAt: { gte: today } },
    });

    const messagesSent = events.filter(e => e.eventType === "message_sent").length;
    const repliesReceived = events.filter(e => e.eventType === "reply_received").length;
    const conversions = events.filter(e => e.eventType === "conversion").length;

    // Get active campaigns count
    const activeCampaigns = await prisma.campaign.count({
      where: { userId: "default-user", status: "active" },
    });

    // Get pending queue
    const queuePending = await prisma.taskQueue.count({
      where: { userId: "default-user", status: "pending" },
    });

    // Get top network
    const networkCounts: Record<string, number> = {};
    events.forEach(e => { networkCounts[e.network] = (networkCounts[e.network] || 0) + 1; });
    const topNetwork = Object.entries(networkCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "linkedin";

    // Generate AI insights
    const summary = generateDailyInsights({
      messagesSent,
      repliesReceived,
      conversions,
      topNetwork,
      activeCampaigns,
      queuePending,
    });

    // Get total contacts and recent additions
    const totalContacts = await prisma.contact.count({ where: { userId: "default-user" } });
    const newContactsToday = await prisma.contact.count({
      where: { userId: "default-user", createdAt: { gte: today } },
    });

    return NextResponse.json({
      ...summary,
      stats: {
        messagesSent,
        repliesReceived,
        conversions,
        activeCampaigns,
        queuePending,
        totalContacts,
        newContactsToday,
        topNetwork,
      },
    });
  } catch (error) {
    console.error("Error generating daily summary:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
