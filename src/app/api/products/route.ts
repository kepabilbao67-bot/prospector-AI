import { NextRequest, NextResponse } from "next/server";

// In-memory products store (in production, use DB)
let products = [
  {
    id: "1", name: "Diseño Web Profesional", description: "Landing page o sitio web completo",
    price: "497", currency: "€", type: "service",
    benefits: ["Diseño personalizado", "SEO básico", "Responsive", "Entrega en 7 días"],
    deliveryTime: "7 días", isActive: true,
  },
  {
    id: "2", name: "Gestión de Redes Sociales", description: "Contenido y engagement mensual",
    price: "299/mes", currency: "€", type: "subscription",
    benefits: ["20 posts/mes", "Stories diarias", "Engagement activo", "Reporte mensual"],
    deliveryTime: "Mensual", isActive: true,
  },
];

export async function GET() {
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = { id: Date.now().toString(), ...body, isActive: true };
  products = [product, ...products];
  return NextResponse.json(product, { status: 201 });
}
