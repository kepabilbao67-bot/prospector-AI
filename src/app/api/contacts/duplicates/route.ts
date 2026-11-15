import { NextResponse } from "next/server";
// Duplicates must be reviewed in the Kepa source CRM, not via an independent store.
export async function GET() {
  return NextResponse.json({ error: "Use the Kepa CRM source for duplicates; no secondary CRM" }, { status: 403 });
}
