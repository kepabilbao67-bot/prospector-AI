import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/queue - List queued tasks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const tasks = await prisma.taskQueue.findMany({
      where: {
        userId: "default-user",
        status: status === "all" ? undefined : status,
      },
      orderBy: [{ priority: "desc" }, { scheduledAt: "asc" }],
      take: 100,
    });

    const counts = await prisma.taskQueue.groupBy({
      by: ["status"],
      where: { userId: "default-user" },
      _count: { id: true },
    });

    return NextResponse.json({
      tasks,
      counts: counts.reduce((acc, c) => ({ ...acc, [c.status]: c._count.id }), {}),
    });
  } catch (error) {
    console.error("Error fetching queue:", error);
    return NextResponse.json({ error: "Error fetching queue" }, { status: 500 });
  }
}

// POST /api/queue - Add task to queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Add randomized delay for human-like behavior
    const baseDelay = body.delayMinutes || 5;
    const randomFactor = 0.5 + Math.random(); // 0.5x to 1.5x
    const actualDelayMs = baseDelay * 60 * 1000 * randomFactor;

    const scheduledAt = new Date(Date.now() + actualDelayMs);

    const task = await prisma.taskQueue.create({
      data: {
        userId: "default-user",
        type: body.type,
        network: body.network,
        payload: JSON.stringify(body.payload || {}),
        status: "pending",
        priority: body.priority || 5,
        scheduledAt,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Error creating task" }, { status: 500 });
  }
}
