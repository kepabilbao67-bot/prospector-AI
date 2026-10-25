import { NextRequest, NextResponse } from "next/server";
import { AUTOMATION_TEMPLATES, evaluateConditions, suggestTags } from "@/lib/automations";

// Templates are examples, not enabled production jobs.
export async function GET() {
  return NextResponse.json({ rules: AUTOMATION_TEMPLATES, simulationOnly: true, executionEnabled: false });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    switch (body.action) {
      case "evaluate":
        return NextResponse.json({ matches: evaluateConditions(body.conditions, body.context), simulationOnly: true });
      case "suggest_tags":
        return NextResponse.json({ tags: suggestTags(body.contact), simulationOnly: true });
      case "trigger":
        return NextResponse.json({
          error: "Automation execution is disabled until authenticated approval and a real execution adapter exist",
          triggered: 0,
          executionEnabled: false,
        }, { status: 503 });
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Automation evaluation failed:", error);
    return NextResponse.json({ error: "Automation evaluation failed" }, { status: 400 });
  }
}
