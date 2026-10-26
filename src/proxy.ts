import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

// Temporary single-operator API gate. Replace with identity-based sessions and
// tenant-scoped DB queries before commercial multiuser deployment.
export function proxy(request: NextRequest) {
  const configured = process.env.PROSPECTOR_API_TOKEN;
  const header = request.headers.get("authorization");
  if (!configured || configured.length < 32 || !header?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supplied = header.slice(7);
  const expectedDigest = createHash("sha256").update(configured).digest();
  const suppliedDigest = createHash("sha256").update(supplied).digest();
  if (!timingSafeEqual(expectedDigest, suppliedDigest)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
