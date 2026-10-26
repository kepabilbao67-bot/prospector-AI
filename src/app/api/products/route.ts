import { NextResponse } from "next/server";

// Commercial catalog persistence and prices have not been verified.
// Never return invented offers or acknowledge an unsaved product as created.
const unavailable = () => NextResponse.json(
  { error: "Product catalog is not configured", products: [] },
  { status: 503 }
);
export async function GET() { return unavailable(); }
export async function POST() { return unavailable(); }
