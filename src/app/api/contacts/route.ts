import { configuredOperatorId } from "@/lib/operator-identity";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Safe single-operator mode: the authenticated API token does not imply a
// multi-tenant identity. Explicitly configure the existing operator's DB user ID.
// Never use a shared demo identity for production CRM data.
const unavailable = () => NextResponse.json(
  { error: "Operator identity is not configured" }, { status: 503 }
);

export async function GET(request: NextRequest) {
  const userId = configuredOperatorId();
  if (!userId) return unavailable();
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const contacts = await prisma.contact.findMany({
      where: {
        userId,
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
  const userId = configuredOperatorId();
  if (!userId) return unavailable();
  try {
    const body = await request.json();
    if (typeof body.firstName !== "string" || !body.firstName.trim()) {
      return NextResponse.json({ error: "firstName is required" }, { status: 400 });
    }
    const contact = await prisma.contact.create({
      data: {
        userId,
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
