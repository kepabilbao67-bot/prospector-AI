import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sessionCookie, sessionToken } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)
      return NextResponse.json({ error: "Autenticación no configurada." }, { status: 503 });
    const input: unknown = await request.json();
    if (!input || typeof input !== "object") return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });
    const { email, password } = input as Record<string, unknown>;
    if (typeof email !== "string" || typeof password !== "string" || email.length > 254 || password.length > 128)
      return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !user.password.startsWith("$2") || !(await bcrypt.compare(password, user.password)))
      return NextResponse.json({ error: "Credenciales incorrectas." }, { status: 401 });
    return sessionCookie(NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }), sessionToken(user.id));
  } catch {
    return NextResponse.json({ error: "Servicio de acceso no disponible." }, { status: 503 });
  }
}
