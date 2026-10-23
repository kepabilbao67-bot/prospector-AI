import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sessionCookie, sessionToken } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)
      return NextResponse.json({ error: "Autenticación no configurada." }, { status: 503 });
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
    const { email, password, name } = body as Record<string, unknown>;
    if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        password.length < 12 || password.length > 128 || !name.trim() || name.length > 120)
      return NextResponse.json({ error: "Introduce nombre, email válido y contraseña de 12-128 caracteres." }, { status: 400 });
    const normalized = email.trim().toLowerCase();
    if (await prisma.user.findUnique({ where: { email: normalized }, select: { id: true } }))
      return NextResponse.json({ error: "La cuenta ya existe." }, { status: 409 });
    const hash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { email: normalized, name: name.trim(), password: hash } });
    return sessionCookie(NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 }), sessionToken(user.id));
  } catch {
    return NextResponse.json({ error: "No se pudo registrar. Comprueba la configuración de la base de datos." }, { status: 503 });
  }
}
