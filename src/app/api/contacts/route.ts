import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { currentUser } from "@/lib/session";

const noStore = { "Cache-Control": "no-store" };
export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión para ver tu CRM." }, { status: 401, headers: noStore });
  try {
    const contacts = await prisma.contact.findMany({ where: { userId: user.id }, orderBy: { updatedAt: "desc" }, take: 2000 });
    return NextResponse.json({ contacts }, { headers: noStore });
  } catch { return NextResponse.json({ error: "Base de datos no disponible." }, { status: 503, headers: noStore }); }
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Inicia sesión para guardar contactos." }, { status: 401, headers: noStore });
  try {
    const input: unknown = await request.json();
    if (!input || typeof input !== "object") return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    const c = input as Record<string, unknown>;
    const field = (key: string, limit: number) => typeof c[key] === "string" ? (c[key] as string).trim().slice(0, limit) : "";
    const firstName = field("firstName", 120);
    const company = field("company", 150);
    if (!firstName && !company) return NextResponse.json({ error: "Indica nombre o empresa." }, { status: 400 });
    const network = field("network", 40) || "other";
    if (!["linkedin", "email", "instagram", "facebook", "twitter", "other"].includes(network))
      return NextResponse.json({ error: "Red no admitida." }, { status: 400 });
    const contact = await prisma.contact.create({ data: {
      userId: user.id, firstName: firstName || company,
      lastName: field("lastName", 120) || null,
      email: field("email", 254) || null, phone: field("phone", 40) || null,
      company: company || null, jobTitle: field("jobTitle", 120) || null,
      network, profileUrl: field("profileUrl", 500) || null,
      notes: field("notes", 1500) || null, status: "new",
    } });
    return NextResponse.json({ contact }, { status: 201, headers: noStore });
  } catch { return NextResponse.json({ error: "No se pudo guardar el contacto." }, { status: 503, headers: noStore }); }
}
