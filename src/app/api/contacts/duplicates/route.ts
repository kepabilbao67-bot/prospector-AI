import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { configuredOperatorId } from "@/lib/operator-identity";

// Limited to the configured single operator. API access is gated by src/proxy.ts.
// Multiuser release still requires user sessions and request-scoped authorization.
export async function GET() {
  const userId = configuredOperatorId();
  if (!userId) {
    return NextResponse.json({ error: "Operator identity not configured" }, { status: 503 });
  }
  try {
    const contacts = await prisma.contact.findMany({
      where: { userId },
      select: {
        id: true, firstName: true, lastName: true, email: true,
        company: true, network: true, profileUrl: true,
      },
    });
    const groups = new Map<string, typeof contacts>();
    for (const c of contacts) {
      const email = c.email?.trim().toLowerCase();
      const name = [c.firstName, c.lastName || "", c.company || ""].map(v => v.trim().toLowerCase()).join("|");
      const keys = [
        ...(email ? [`email:${email}`] : []),
        ...(c.firstName.trim() && c.company?.trim() ? [`name:${name}`] : []),
      ];
      for (const key of keys) groups.set(key, [...(groups.get(key) || []), c]);
    }
    const duplicates = [...groups].filter(([, list]) => list.length > 1).map(([key, list]) => ({
      ids: list.map(c => c.id),
      reason: key.startsWith("email:") ? "Mismo email" : "Mismo nombre + empresa",
      contacts: list,
    }));
    return NextResponse.json({ duplicates, totalDuplicates: duplicates.length });
  } catch (error) {
    console.error("Error checking contact duplicates:", error);
    return NextResponse.json({ error: "Contact database unavailable" }, { status: 503 });
  }
}
