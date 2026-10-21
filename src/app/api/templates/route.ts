import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUserId } from "@/lib/require-auth";

export async function GET(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const templates = await prisma.template.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json({ error: "Templates unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    if (typeof body.name !== "string" || !body.name.trim() ||
        typeof body.content !== "string" || !body.content.trim() ||
        typeof body.network !== "string" || typeof body.type !== "string") {
      return NextResponse.json({ error: "Invalid template" }, { status: 400 });
    }
    const template = await prisma.template.create({
      data: { userId, name: body.name, network: body.network, type: body.type,
        subject: body.subject || null, content: body.content, variables: "[]" },
    });
    return NextResponse.json(template, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Template was not saved" }, { status: 503 });
  }
}
