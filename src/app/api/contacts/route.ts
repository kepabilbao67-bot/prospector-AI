// The Kepa CRM is the only contact source. No local contact store is used.
export { GET } from "@/app/api/kepa-crm/contacts/route";
import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: "Los contactos pertenecen al CRM de Kepa; escritura deshabilitada" }, { status: 405 });
}
