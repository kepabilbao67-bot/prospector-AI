import { NextRequest, NextResponse } from "next/server";
import { sessionUserId } from "@/lib/session";
import { apis360LocalAvailable, askApis360Local } from "@/lib/apis360-local";

export const runtime = "nodejs";
const noStore = { "Cache-Control": "private, no-store" };

async function authorized() {
  try {
    await sessionUserId();
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await authorized())) {
    return NextResponse.json({ error: "Sesión requerida." }, { status: 401, headers: noStore });
  }
  const available = await apis360LocalAvailable();
  return NextResponse.json(
    { available, mode: "local", cloud: false, project: "prospector360" },
    { headers: noStore },
  );
}

const supported = new Set(["first_message", "follow_up", "proposal"]);
const tones = new Set(["professional", "casual", "friendly", "direct", "creative"]);
const networks = new Set(["linkedin", "instagram", "email", "whatsapp", "facebook", "twitter", "fiverr", "tiktok"]);
const maxLength: Record<string, number> = {
  linkedin: 300, instagram: 1000, email: 5000, whatsapp: 4096,
  facebook: 2000, twitter: 280, fiverr: 2500, tiktok: 500,
};
const take = (value: unknown, size: number) =>
  typeof value === "string" ? value.trim().slice(0, size) : "";

export async function POST(request: NextRequest) {
  if (!(await authorized())) {
    return NextResponse.json({ error: "Sesión requerida." }, { status: 401, headers: noStore });
  }
  let origin: URL;
  try {
    origin = new URL(request.headers.get("origin") || "");
  } catch {
    return NextResponse.json({ error: "Origen no autorizado." }, { status: 403, headers: noStore });
  }
  if (origin.host !== request.headers.get("host") ||
      !["http:", "https:"].includes(origin.protocol)) {
    return NextResponse.json({ error: "Origen no autorizado." }, { status: 403, headers: noStore });
  }
  if (Number(request.headers.get("content-length") || 0) > 6000) {
    return NextResponse.json({ error: "Solicitud demasiado grande." }, { status: 413, headers: noStore });
  }
  let raw: string;
  try {
    raw = await request.text();
    if (raw.length > 6000) throw new Error("too large");
  } catch {
    return NextResponse.json({ error: "Solicitud no válida." }, { status: 413, headers: noStore });
  }
  let body: unknown;
  try { body = JSON.parse(raw); }
  catch { return NextResponse.json({ error: "JSON no válido." }, { status: 400, headers: noStore }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Solicitud no válida." }, { status: 400, headers: noStore });
  }
  const data = body as { action?: unknown; context?: unknown };
  const context = data.context as Record<string, unknown> | undefined;
  const contact = context?.contact as Record<string, unknown> | undefined;
  const product = context?.product as Record<string, unknown> | undefined;
  const kind = take(context?.messageType, 40);
  const network = take(contact?.network, 40);
  const tone = take(context?.tone, 40);
  const language = take(context?.language, 4);
  if (data.action !== "draft_message" || !supported.has(kind) ||
      !networks.has(network) || !tones.has(tone) || !["es", "en"].includes(language)) {
    return NextResponse.json({ error: "Parámetros no admitidos." }, { status: 400, headers: noStore });
  }
  const productName = take(product?.name, 100);
  const description = take(product?.description, 400);
  const price = take(product?.price, 80);
  const benefits = Array.isArray(product?.benefits)
    ? product.benefits.slice(0, 3).map(v => take(v, 100)).filter(Boolean)
    : [];
  if (!(await apis360LocalAvailable())) {
    return NextResponse.json({ error: "APIs360 local no disponible; no se ha generado un mensaje con IA." },
      { status: 503, headers: noStore });
  }
  const prompt = [
    "Eres un asistente comercial. Redacta UN borrador de mensaje para revisión humana.",
    "No envíes nada ni afirmes haber investigado la empresa o conocido a la persona.",
    "No inventes resultados, garantías, descuentos ni urgencias comerciales.",
    "Usa los marcadores {{nombre}}, {{empresa}} y {{cargo}}; no recibes datos reales de clientes.",
    "Devuelve SOLO el mensaje, sin explicación.",
    "Idioma: " + language, "Canal: " + network, "Tipo: " + kind, "Tono: " + tone,
    "Producto: " + (productName || "servicio no especificado"),
    "Descripción: " + description, "Precio: " + price,
    "Beneficios declarados: " + benefits.join("; "),
    "Límite de caracteres: " + maxLength[network],
  ].join("\n");

  try {
    const message = (await askApis360Local(prompt)).slice(0, maxLength[network]);
    return NextResponse.json({
      message, source: "apis360-local", costUsd: 0, draftOnly: true,
      confidence: null, tips: ["Borrador para revisión. No se ha enviado ningún mensaje."],
    }, { headers: noStore });
  } catch {
    return NextResponse.json({ error: "La IA local no confirmó una respuesta válida." },
      { status: 503, headers: noStore });
  }
}
