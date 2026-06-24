import { NextRequest, NextResponse } from "next/server";
import { DEMO_TEMPLATES } from "@/lib/demo-data";

export async function GET() {
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const templates = await prisma.template.findMany({
      where: { userId: "default-user" },
      orderBy: { createdAt: "desc" },
    });
    if (templates.length > 0) return NextResponse.json({ templates });
  } catch { /* DB not available */ }
  return NextResponse.json({ templates: DEMO_TEMPLATES });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const template = {
      id: `t${Date.now()}`,
      userId: "default-user",
      name: body.name,
      network: body.network,
      type: body.type,
      subject: body.subject || null,
      content: body.content,
      variables: JSON.stringify([]),
      usageCount: 0,
      replyRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return NextResponse.json(template, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
