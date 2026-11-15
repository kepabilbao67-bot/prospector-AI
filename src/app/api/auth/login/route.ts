import { NextRequest, NextResponse } from "next/server";
import { issueSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/auth";
import { supabaseAuthEnabled, verifySupabasePassword } from "@/lib/supabase-auth";
export async function POST(request: NextRequest) {
  if (!process.env.PROSPECTOR_SESSION_SECRET || process.env.PROSPECTOR_SESSION_SECRET.length < 32)
    return NextResponse.json({ error: "Autenticacion no configurada" }, { status: 503 });
  try {
    const body = await request.json();
    if (typeof body.email !== "string" || typeof body.password !== "string" ||
        body.email.length > 254 || body.password.length > 1024)
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    let sessionOwner = "";
    let name = "Kepa";
    if (supabaseAuthEnabled()) {
      const result = await verifySupabasePassword(body.email, body.password);
      if (result === "unavailable") return NextResponse.json({ error: "Proveedor de autenticacion no disponible" }, { status: 503 });
      if (result !== "ok") return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
      sessionOwner = "prospector-local-owner";
    } else {
      if (process.env.NODE_ENV === "production")
        return NextResponse.json({ error: "Autenticacion persistente no configurada" }, { status: 503 });
      const [{ default: prisma }, { default: bcrypt }] = await Promise.all([
        import("@/lib/prisma"), import("bcryptjs"),
      ]);
      const user = await prisma.user.findUnique({ where: { email: body.email.trim().toLowerCase() } });
      if (!user || !user.password || !(await bcrypt.compare(body.password, user.password)))
        return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
      sessionOwner = user.id;
      name = user.name || name;
    }
    const response = NextResponse.json({ ok: true, name });
    response.cookies.set(SESSION_COOKIE, issueSession(sessionOwner), {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
      path: "/", maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Inicio de sesion no disponible" }, { status: 503 });
  }
}
