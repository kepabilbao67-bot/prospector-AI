import { NextResponse } from "next/server";

// Seeding demo accounts must not be exposed through an unauthenticated endpoint.
export async function POST() {
  return NextResponse.json({ error: "Creación de usuario demo deshabilitada" }, { status: 403 });
}
