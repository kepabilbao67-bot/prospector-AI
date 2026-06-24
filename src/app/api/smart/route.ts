import { NextRequest, NextResponse } from "next/server";
import {
  analyzeIncomingMessage,
  generateAutoResponse,
  calculateABWinner,
  getOptimalSchedule,
  getNextOptimalTime,
  getFollowUpStrategy,
  checkBlacklist,
  calculateRevenueMetrics,
  parseCSVContacts,
} from "@/lib/smart-engine";

// POST /api/smart - Smart engine operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "analyze_message": {
        const result = analyzeIncomingMessage(body.message);
        const autoReply = generateAutoResponse(result.intent, body.contactName || "", body.message);
        return NextResponse.json({ ...result, autoReply });
      }

      case "ab_winner": {
        const result = calculateABWinner(body.variants);
        return NextResponse.json(result);
      }

      case "optimal_schedule": {
        const schedule = getOptimalSchedule(body.network, body.timezone);
        const nextTime = getNextOptimalTime(body.network);
        return NextResponse.json({ schedule, nextSendTime: nextTime.toISOString() });
      }

      case "follow_up_strategy": {
        const strategy = getFollowUpStrategy(body.network, body.previousAttempts || 0);
        return NextResponse.json(strategy);
      }

      case "check_blacklist": {
        const result = checkBlacklist(body.contact, body.customBlacklist || []);
        return NextResponse.json(result);
      }

      case "revenue_metrics": {
        const metrics = calculateRevenueMetrics(body.entries || []);
        return NextResponse.json(metrics);
      }

      case "parse_csv": {
        const result = parseCSVContacts(body.csvContent);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Smart engine error:", error);
    return NextResponse.json({ error: "Smart engine failed" }, { status: 500 });
  }
}
