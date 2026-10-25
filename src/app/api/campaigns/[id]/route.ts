import { NextResponse } from "next/server";

// SECURITY HOLD: tenant ownership checks are not yet implemented.
// Do not expose cross-account campaign data or permit edits/deletion.
const blocked = () => NextResponse.json(
  { error: "Campaign details unavailable until authentication is configured" },
  { status: 503 }
);
export async function GET() { return blocked(); }
export async function PUT() { return blocked(); }
export async function DELETE() { return blocked(); }
