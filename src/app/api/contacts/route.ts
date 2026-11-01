import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const network = searchParams.get("network");
    const status = searchParams.get("status");
    const product = searchParams.get("product");
    const allowedProducts = ["Fincas 360", "Llamadas 360", "Electricista 360", "Autónomo 360"];
    if (product && product !== "all" && !allowedProducts.includes(product)) return NextResponse.json({ error: "Invalid product filter" }, { status: 400 });
    const search = searchParams.get("search")?.trim();
    const requestedPage = Number(searchParams.get("page") || "1");
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 100000) : 1;
    const pageSize = 50;

    // Keep filters in the database so results beyond the first 50 are searchable.
    const where = {
      userId: "default-user",
      ...(network && network !== "all" ? { network } : {}),
      ...(status && status !== "all" ? { status } : {}),
      ...(product && product !== "all" ? { tags: { contains: JSON.stringify(product) } } : {}),
      ...(search ? { OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { company: { contains: search } },
      ] } : {}),
    };
    const prisma = (await import("@/lib/prisma")).default;
    const [contacts, total] = await prisma.$transaction([
      prisma.contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contact.count({ where }),
    ]);
    return NextResponse.json({ contacts, total, page, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    console.error("Error loading contacts:", error);
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body.firstName !== "string" || !body.firstName.trim()) {
      return NextResponse.json({ error: "Contact name is required" }, { status: 400 });
    }
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    const profileUrl = typeof body.profileUrl === "string" ? body.profileUrl.trim() : "";
    if (profileUrl) {
      try { const parsed = new URL(profileUrl); if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid protocol"); }
      catch { return NextResponse.json({ error: "Invalid profile URL" }, { status: 400 }); }
    }
    if (body.tags !== undefined && (!Array.isArray(body.tags) || body.tags.some((tag: unknown) => typeof tag !== "string"))) return NextResponse.json({ error: "Invalid tags" }, { status: 400 });
    const newContact = {
      userId: "default-user",
      firstName: body.firstName.trim(),
      lastName: body.lastName || null,
      email: email || null,
      phone: body.phone || null,
      notes: body.notes || null,
      company: body.company || null,
      jobTitle: body.jobTitle || null,
      network: body.network || "other",
      status: "new",
      score: 0,
      tags: JSON.stringify(body.tags || []),
      profileUrl: profileUrl || null,
    };

    const prisma = (await import("@/lib/prisma")).default;
    const contact = await prisma.contact.create({ data: newContact as never });
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
