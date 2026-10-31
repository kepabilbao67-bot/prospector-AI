import { NextRequest, NextResponse } from "next/server";

// P0 fail-closed barrier. This is intentionally NOT a login implementation.
// Do not remove until server-verified sessions AND per-user database scoping exist.
// All private routes and APIs are denied regardless of client-provided headers.
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Authentication is not configured" }, { status: 401 });
  }
  if (request.nextUrl.pathname === "/access-required") return NextResponse.next();
  return NextResponse.redirect(new URL("/access-required", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/|sw.js|access-required).*)"],
};
