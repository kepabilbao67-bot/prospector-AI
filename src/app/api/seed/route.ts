import { NextResponse } from "next/server";

// Production safety: never initialize a shared demo user or store a plaintext
// password. Database setup must be part of a reviewed authenticated migration.
export async function POST() {
  return NextResponse.json(
    { error: "La carga de datos ficticios está desactivada." },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}
