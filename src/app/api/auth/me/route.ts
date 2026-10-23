import { NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
export async function GET() {
  const user = await currentUser();
  return NextResponse.json(user ? { user } : { error: "Inicia sesión." }, { status: user ? 200 : 401, headers: { "Cache-Control": "no-store" } });
}
