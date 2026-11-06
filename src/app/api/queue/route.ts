import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { configuredOperatorId } from "@/lib/operator-identity";

// Read-only queue visibility for configured operator. No execution or scheduling.
export async function GET() {
  const userId = configuredOperatorId();
  if (!userId) return NextResponse.json({ error: "Operator identity not configured" }, { status: 503 });
  try {
    const tasks = await prisma.taskQueue.findMany({
      where: { userId },
      orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
      take: 100,
    });
    return NextResponse.json({ tasks, total: tasks.length });
  } catch (error) {
    console.error("Error loading task queue:", error);
    return NextResponse.json({ error: "Task database unavailable" }, { status: 503 });
  }
}
export async function POST() {
  return NextResponse.json({ error: "Task scheduling disabled pending approval and multiuser authorization" }, { status: 503 });
}
