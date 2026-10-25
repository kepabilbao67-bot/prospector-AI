import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      where: { userId: "default-user" },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Template database unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.name !== "string" || !body.name.trim() || typeof body.content !== "string" || !body.content.trim() || typeof body.network !== "string" || !body.network.trim() || typeof body.type !== "string" || !body.type.trim()) {
      return NextResponse.json({ error: "name, content, network and type are required" }, { status: 400 });
    }
    const template = await prisma.template.create({
      data: {
        userId: "default-user",
        name: body.name.trim(),
        network: body.network.trim(),
        type: body.type.trim(),
        subject: typeof body.subject === "string" ? body.subject : null,
        content: body.content.trim(),
        variables: "[]",
        usageCount: 0,
        replyRate: 0,
      },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error saving template:", error);
    return NextResponse.json({ error: "Template was not saved" }, { status: 503 });
  }
}
