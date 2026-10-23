import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { currentUser } from "@/lib/session";
type Context = { params: Promise<{ id: string }> };
const headers = { "Cache-Control": "no-store" };
const allowed = ["new", "contacted", "replied", "qualified", "converted", "lost"];
export async function PATCH(request: NextRequest, { params }: Context) {
 const user = await currentUser();
 if (!user) return NextResponse.json({ error: "Sin sesión." }, { status: 401, headers });
 const { id } = await params;
 if (!id || id.length > 128) return NextResponse.json({ error: "ID incorrecto." }, { status: 400 });
 try {
  const body: unknown = await request.json();
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  const fields = body as Record<string, unknown>;
  const data: Record<string, string | null> = {};
  for (const [field, limit] of Object.entries({ firstName: 120, lastName: 120, email: 254, phone: 40, company: 150, jobTitle: 120, notes: 1500, status: 30 })) {
    if (field in fields) {
      if (typeof fields[field] !== "string") return NextResponse.json({ error: "Campo incorrecto." }, { status: 400 });
      const value = (fields[field] as string).trim().slice(0, limit);
      if (field === "status" && !allowed.includes(value)) return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
      if (field === "firstName" && !value) return NextResponse.json({ error: "Nombre requerido." }, { status: 400 });
      data[field] = field === "firstName" || field === "status" ? value : value || null;
    }
  }
  const result = await prisma.contact.updateMany({ where: { id, userId: user.id }, data });
  if (!result.count) return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  return NextResponse.json({ ok: true }, { headers });
 } catch { return NextResponse.json({ error: "No se pudo actualizar." }, { status: 503 }); }
}
export async function DELETE(_request: NextRequest, { params }: Context) {
 const user = await currentUser();
 if (!user) return NextResponse.json({ error: "Sin sesión." }, { status: 401, headers });
 const { id } = await params;
 if (!id || id.length > 128) return NextResponse.json({ error: "ID incorrecto." }, { status: 400 });
 try {
  const result = await prisma.contact.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: result.count > 0 }, { status: result.count ? 200 : 404, headers });
 } catch { return NextResponse.json({ error: "No se pudo eliminar." }, { status: 503 }); }
}
