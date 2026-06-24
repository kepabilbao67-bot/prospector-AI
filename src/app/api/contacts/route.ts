import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/contacts - List all contacts with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    // For MVP, use a default userId
    where.userId = "default-user";

    if (network && network !== "all") where.network = network;
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ error: "Error fetching contacts" }, { status: 500 });
  }
}

// POST /api/contacts - Create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contact = await prisma.contact.create({
      data: {
        userId: "default-user",
        firstName: body.firstName,
        lastName: body.lastName || null,
        email: body.email || null,
        phone: body.phone || null,
        company: body.company || null,
        jobTitle: body.jobTitle || null,
        network: body.network || "other",
        networkId: body.networkId || null,
        profileUrl: body.profileUrl || null,
        avatarUrl: body.avatarUrl || null,
        tags: JSON.stringify(body.tags || []),
        notes: body.notes || null,
        status: body.status || "new",
        score: body.score || 0,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json({ error: "Error creating contact" }, { status: 500 });
  }
}
