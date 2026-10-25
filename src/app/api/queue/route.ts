import { NextResponse } from "next/server";

// SECURITY HOLD: queue is disabled until identity, ownership and approval are enforced.
const blocked = () => NextResponse.json(
  { error: "Task queue unavailable until authentication is configured" },
  { status: 503 }
);
export async function GET() { return blocked(); }
export async function POST() { return blocked(); }
