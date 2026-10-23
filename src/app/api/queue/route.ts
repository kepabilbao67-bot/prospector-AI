import { NextResponse } from "next/server";

// Queue access must only be restored after verified per-user sessions
// and explicit, draft-first messaging authorizations are implemented.
function unavailable() {
  return NextResponse.json(
    { error: "Cola comercial no disponible hasta verificar el usuario y los permisos." },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
export async function GET() { return unavailable(); }
export async function POST() { return unavailable(); }
