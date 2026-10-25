import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Do not substitute demo contacts or volatile memory for the CRM database.
// These routes still require an authentication layer before production use.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const contacts = await prisma.contact.findMany({
      where: {
        userId: "default-user",
        ...(network && network !== "all" ? { network } : {}),
        ...(status && status !== "all" ? { status } : {}),
        ...(search ? { OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { company: { contains: search } },
        ] } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ contacts, total: contacts.length, page: 1, totalPages: 1 });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json({ error: "Contact database unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.firstName !== "string" || !body.firstName.trim()) {
      return NextResponse.json({ error: "firstName is required" }, { status: 400 });
    }
    const contact = await prisma.contact.create({
      data: {
        userId: "default-user",
        firstName: body.firstName.trim(),
        lastName: body.lastName || null,
        email: body.email || null,
        company: body.company || null,
        jobTitle: body.jobTitle || null,
        network: body.network || "other",
        status: "new",
        score: 0,
        tags: JSON.stringify(Array.isArray(body.tags) ? body.tags : []),
        profileUrl: body.profileUrl || null,
      },
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json({ error: "Contact was not saved" }, { status: 503 });
  }
}
