import { NextRequest, NextResponse } from "next/server";
import { AUTOMATION_TEMPLATES, evaluateConditions, suggestTags } from "@/lib/automations";

// GET /api/automations - List automation rules
export async function GET() {
  return NextResponse.json({ rules: AUTOMATION_TEMPLATES });
}

// POST /api/automations - Execute or create automation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "evaluate": {
        // Check if conditions match
        const result = evaluateConditions(body.conditions, body.context);
        return NextResponse.json({ matches: result });
      }

      case "suggest_tags": {
        const tags = suggestTags(body.contact);
        return NextResponse.json({ tags });
      }

      case "trigger": {
        // Simulate triggering an automation
        const matchingRules = AUTOMATION_TEMPLATES.filter(
          (rule) => rule.isActive && rule.trigger.type === body.triggerType
        );
        return NextResponse.json({
          triggered: matchingRules.length,
          rules: matchingRules.map((r) => ({ id: r.id, name: r.name, actions: r.actions })),
        });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Automation error:", error);
    return NextResponse.json({ error: "Automation failed" }, { status: 500 });
  }
}
