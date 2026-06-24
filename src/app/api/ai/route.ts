import { NextRequest, NextResponse } from "next/server";
import { generateMessage, generateVariations, calculateLeadScore, generateCampaignStrategy, type AIContext } from "@/lib/ai";

// POST /api/ai - AI operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "generate_message": {
        const context: AIContext = body.context;
        const result = generateMessage(context);
        return NextResponse.json(result);
      }

      case "generate_variations": {
        const context: AIContext = body.context;
        const count = body.count || 3;
        const result = generateVariations(context, count);
        return NextResponse.json(result);
      }

      case "score_lead": {
        const result = calculateLeadScore(body.contact);
        return NextResponse.json(result);
      }

      case "generate_strategy": {
        const result = generateCampaignStrategy(body.params);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: "AI processing failed" }, { status: 500 });
  }
}
