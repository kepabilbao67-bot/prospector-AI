import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

// All legacy routes stay closed until their ownership filters are migrated.
// This prevents a signed-in user from reading the historical "default-user" records.
const scopedRoutes = new Set([
  "/api/contacts", "/api/contacts/duplicates", "/api/campaigns",
  "/api/analytics", "/api/templates", "/api/kepa-crm/contacts",
  "/api/instagram/connect", "/api/instagram/callback", "/api/instagram/status",
]);
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/api/auth/login") return NextResponse.next();
  const localSetup = process.env.PROSPECTOR_LOCAL_SETUP === "1" &&
    ["127.0.0.1", "localhost"].includes(request.nextUrl.hostname);
  if (path === "/setup" || path === "/api/auth/setup") {
    if (!localSetup) return NextResponse.json({ error: "No disponible" }, { status: 404 });
    return NextResponse.next();
  }
  if (path === "/api/seed") return NextResponse.json({ error: "Deshabilitado" }, { status: 403 });
  if (path.startsWith("/api/")) {
    if (!scopedRoutes.has(path) && path !== "/api/auth/logout")
      return NextResponse.json({ error: "Ruta pendiente de aislamiento de usuarios" }, { status: 403 });
    if (!getSessionUser(request))
      return NextResponse.json({ error: "Autenticacion requerida" }, { status: 401 });
  } else if (path !== "/login" && !getSessionUser(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}
export const config = {
  matcher: ["/api/:path*", "/((?!_next/|favicon.ico|manifest.json|icons/|sw.js|login$).*)"],
};
