import { NextResponse } from "next/server";

// Safety gate: the repository does not yet have a verified server-side
// authentication/session mechanism. Never use a shared default user or
// invented demo records for customer data.
const unavailable = () => NextResponse.json(
  { error: "CRM temporalmente bloqueado: falta verificar la autenticación y el aislamiento por usuario." },
  { status: 503, headers: { "Cache-Control": "no-store" } },
);

export async function GET() {
  return unavailable();
}

export async function POST() {
  return unavailable();
}
