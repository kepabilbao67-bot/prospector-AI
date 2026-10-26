import { NextResponse } from "next/server";

// No persistent notifications store is wired yet. Never advertise fictional replies or sales.
export async function GET() {
  return NextResponse.json(
    { error: "Notifications unavailable until a verified data source is connected" },
    { status: 503 }
  );
}
