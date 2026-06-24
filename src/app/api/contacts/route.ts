import { NextRequest, NextResponse } from "next/server";
import { DEMO_CONTACTS } from "@/lib/demo-data";

let inMemoryContacts = [...DEMO_CONTACTS];

async function getContacts() {
  try {
    const prisma = (await import("@/lib/prisma")).default;
    const contacts = await prisma.contact.findMany({
      where: { userId: "default-user" },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    if (contacts.length > 0) return contacts;
  } catch { /* DB not available */ }
  return inMemoryContacts;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let contacts: any[] = await getContacts();

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
    return NextResponse.json({ contacts: DEMO_CONTACTS, total: DEMO_CONTACTS.length, page: 1, totalPages: 1 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newContact = {
      id: `c${Date.now()}`,
      userId: "default-user",
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

    try {
      const prisma = (await import("@/lib/prisma")).default;
      const contact = await prisma.contact.create({ data: newContact as never });
      return NextResponse.json(contact, { status: 201 });
    } catch {
      inMemoryContacts.unshift(newContact as typeof inMemoryContacts[0]);
      return NextResponse.json(newContact, { status: 201 });
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
