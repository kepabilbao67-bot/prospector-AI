import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network");
    const type = searchParams.get("type");

    const where: Record<string, unknown> = { userId: "default-user" };
    if (network && network !== "all") where.network = network;
    if (type && type !== "all") where.type = type;

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Error fetching templates" }, { status: 500 });
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract variables from content
    const variableMatches = body.content.match(/\{\{(\w+)\}\}/g) || [];
    const variables = [...new Set(variableMatches.map((v: string) => v.replace(/\{\{|\}\}/g, "")))];

    const template = await prisma.template.create({
      data: {
        userId: "default-user",
        name: body.name,
        network: body.network,
        type: body.type,
        subject: body.subject || null,
        content: body.content,
        variables: JSON.stringify(variables),
        isDefault: body.isDefault || false,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Error creating template" }, { status: 500 });
  }
}
