import { NextResponse } from "next/server";

// Demo data must never be inserted through a public production endpoint.
export async function POST() {
  return NextResponse.json({ error: "Demo initialization disabled" }, { status: 403 });
}
