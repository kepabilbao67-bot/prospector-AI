import { NextResponse } from "next/server";

// Until server-side authentication is restored and tested, fail closed.
// Never expose default-user campaigns or invented in-memory data.
function unavailable() {
  return NextResponse.json(
    { error: "Campañas temporalmente bloqueadas: falta verificar la sesión y el aislamiento por usuario." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  return unavailable();
}

export async function POST() {
  return unavailable();
}
