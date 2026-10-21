import { getAuthenticatedUserId } from "@/lib/require-auth";
import { NextRequest, NextResponse } from "next/server";

async function getContacts(userId: string) {
  const prisma = (await import("@/lib/prisma")).default;
  return prisma.contact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contacts: any[] = await getContacts(userId);

    if (network && network !== "all") contacts = contacts.filter((c: any) => c.network === network);
    if (status && status !== "all") contacts = contacts.filter((c: any) => c.status === status);
    if (search) {
      const s = search.toLowerCase();
      contacts = contacts.filter((c: any) =>
        c.firstName.toLowerCase().includes(s) ||
        (c.lastName || "").toLowerCase().includes(s) ||
        (c.company || "").toLowerCase().includes(s)
      );
    }

    return NextResponse.json({ contacts, total: contacts.length, page: 1, totalPages: 1 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Contacts temporarily unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();
    const newContact = {
      id: `c${Date.now()}`,
      userId,
      firstName: body.firstName || "Unknown",
      lastName: body.lastName || null,
      email: body.email || null,
      company: body.company || null,
      jobTitle: body.jobTitle || null,
      network: body.network || "other",
      status: "new",
      score: 0,
      tags: JSON.stringify(body.tags || []),
      profileUrl: body.profileUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const prisma = (await import("@/lib/prisma")).default;
    const contact = await prisma.contact.create({ data: newContact as never });
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Contact was not saved" }, { status: 503 });
  }
}
