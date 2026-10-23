import { NextResponse } from "next/server";

// Templates are customer-specific. The old shared default-user implementation
// could expose demo/shared data and acknowledge writes without persisting them.
// Restore endpoints only alongside verified authenticated user scoping.
function unavailable() {
  return NextResponse.json(
    { error: "Plantillas no disponibles hasta verificar sesión y aislamiento por usuario." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() { return unavailable(); }
export async function POST() { return unavailable(); }
