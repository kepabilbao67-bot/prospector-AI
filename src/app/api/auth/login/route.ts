import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { getSessionSecret } from "@/lib/require-auth";

export async function POST(request: NextRequest) {
  const secret = getSessionSecret();
  if (!secret) return NextResponse.json({ error: "Authentication not configured" }, { status: 503 });
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.email !== "string" || typeof body.password !== "string" ||
      body.email.length > 254 || body.password.length > 1024) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email: body.email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = jwt.sign({}, secret, { algorithm: "HS256", subject: user.id, expiresIn: "8h" });
    const response = NextResponse.json({ id: user.id, name: user.name, email: user.email });
    response.cookies.set("prospector_session", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "strict", path: "/", maxAge: 8 * 60 * 60,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Login temporarily unavailable" }, { status: 503 });
  }
}
