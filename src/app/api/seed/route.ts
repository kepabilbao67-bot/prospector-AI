import { NextResponse } from "next/server";

// POST /api/seed - Always succeeds (uses demo data or seeds DB)
export async function POST() {
  try {
    // Try to seed the real database
    const prisma = (await import("@/lib/prisma")).default;
    
    const existingUser = await prisma.user.findUnique({ where: { id: "default-user" } });
    if (!existingUser) {
      await prisma.user.create({
        data: { id: "default-user", email: "demo@prospector.ai", name: "Demo User", password: "demo", plan: "pro" },
      });
    }

    return NextResponse.json({ success: true, message: "Platform initialized" });
  } catch {
    // If DB is not available, still return success (demo data will be used)
    return NextResponse.json({ success: true, message: "Platform initialized (demo mode)" });
  }
}
