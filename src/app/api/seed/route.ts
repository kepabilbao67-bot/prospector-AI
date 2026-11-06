import { NextResponse } from "next/server";

// Seeding a shared demo user via a public HTTP endpoint is unsafe.
// Initialization must be performed through a controlled, authenticated migration.
export async function POST() {
  return NextResponse.json(
    { error: "Public database seeding is disabled" },
    { status: 403 }
  );
}
