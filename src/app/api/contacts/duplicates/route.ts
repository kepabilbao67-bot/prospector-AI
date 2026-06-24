import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/contacts/duplicates - Find potential duplicate contacts
export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId: "default-user" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        company: true,
        network: true,
        profileUrl: true,
      },
    });

    const duplicates: { ids: string[]; reason: string; contacts: typeof contacts }[] = [];
    const seen = new Map<string, typeof contacts[0][]>();

    for (const contact of contacts) {
      // Check by email
      if (contact.email) {
        const key = `email:${contact.email.toLowerCase()}`;
        if (!seen.has(key)) seen.set(key, []);
        seen.get(key)!.push(contact);
      }

      // Check by name + company
      const nameKey = `name:${contact.firstName.toLowerCase()}_${(contact.lastName || "").toLowerCase()}_${(contact.company || "").toLowerCase()}`;
      if (!seen.has(nameKey)) seen.set(nameKey, []);
      seen.get(nameKey)!.push(contact);
    }

    for (const [key, group] of seen.entries()) {
      if (group.length > 1) {
        duplicates.push({
          ids: group.map(c => c.id),
          reason: key.startsWith("email:") ? "Mismo email" : "Mismo nombre + empresa",
          contacts: group,
        });
      }
    }

    return NextResponse.json({
      duplicates,
      totalDuplicates: duplicates.length,
    });
  } catch (error) {
    console.error("Error finding duplicates:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
