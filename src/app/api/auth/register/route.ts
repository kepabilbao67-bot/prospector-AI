import { NextRequest, NextResponse } from "next/server";
import { registerSupabaseOwner, supabaseAuthEnabled } from "@/lib/supabase-auth";

export async function POST(request: NextRequest) {
  if (!supabaseAuthEnabled()) return NextResponse.json({ error: "Alta no disponible" }, { status: 404 });
  const host = request.headers.get("host");
  if (!host || request.headers.get("origin") !== "https://" + host ||
      !request.headers.get("content-type")?.startsWith("application/json"))
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 });
  try {
    const body: unknown = await request.json();
    if (body === null || typeof body !== "object" || Array.isArray(body))
      return NextResponse.json({ error: "Datos incorrectos" }, { status: 400 });
    const data = body as Record<string, unknown>;
    if (typeof data.email !== "string" || typeof data.password !== "string" ||
        data.email.length > 254 || data.password.length < 20 || data.password.length > 256)
      return NextResponse.json({ error: "Correo y contraseña de al menos 20 caracteres" }, { status: 400 });
    const result = await registerSupabaseOwner(data.email, data.password);
    if (result === "invalid") return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    if (result === "rate_limited") return NextResponse.json({ error: "Demasiados intentos; vuelve más tarde" }, { status: 429 });
    if (result === "unavailable") return NextResponse.json({ error: "Proveedor de alta no disponible" }, { status: 503 });
    return NextResponse.json({ ok: true, message: "Revisa tu correo para confirmar la cuenta antes de entrar" }, { status: 202 });
  } catch {
    return NextResponse.json({ error: "Alta temporalmente no disponible" }, { status: 503 });
  }
}
