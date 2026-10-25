import { NextResponse } from "next/server";

// SECURITY HOLD: never disclose contact identities before tenant-scoped authentication.
export async function GET() {
  return NextResponse.json(
    { error: "Deduplication unavailable until authentication is configured" },
    { status: 503 }
  );
}
