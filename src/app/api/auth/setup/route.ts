import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { issueSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";

function permitted(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const parts = host.split(":");
  const localHost = parts.length === 2 && ["127.0.0.1", "localhost"].includes(parts[0]) &&
    /^[0-9]{2,5}$/.test(parts[1]);
  return process.env.PROSPECTOR_LOCAL_SETUP === "1" && localHost &&
    request.headers.get("origin") === `http://${host}` &&
    request.headers.get("content-type")?.startsWith("application/json");
}

export async function POST(request: NextRequest) {
  if (!permitted(request)) return NextResponse.json({ error: "Alta local deshabilitada" }, { status: 403 });
  if (!process.env.PROSPECTOR_SESSION_SECRET || process.env.PROSPECTOR_SESSION_SECRET.length < 32)
    return NextResponse.json({ error: "Firma de sesiones no configurada" }, { status: 503 });
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ||
        email.length > 254 || typeof password !== "string" ||
        password.length < 16 || password.length > 256) {
      return NextResponse.json({ error: "Correo válido y contraseña de 16 caracteres o más" }, { status: 400 });
    }
    if (await prisma.user.count() !== 0)
      return NextResponse.json({ error: "El propietario ya está registrado" }, { status: 409 });
    const user = await prisma.user.create({
      data: { id: "prospector-local-owner", email: email.trim().toLowerCase(), name: "Kepa", plan: "enterprise",
        password: await bcrypt.hash(password, 12) },
    });
    const response = NextResponse.json({ ok: true }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, issueSession(user.id), {
      httpOnly: true, secure: false, sameSite: "strict", path: "/", maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo crear la cuenta local" }, { status: 503 });
  }
}
