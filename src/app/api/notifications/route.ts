import { NextResponse } from "next/server";

// Notifications endpoint - returns demo notifications
export async function GET() {
  const notifications = [
    { id: "1", type: "reply", title: "Carlos García respondió", body: "Me interesa mucho tu propuesta...", network: "linkedin", timestamp: new Date(Date.now() - 5 * 60000).toISOString(), read: false },
    { id: "2", type: "new_client", title: "Nuevo proyecto en Fiverr", body: "buyer_2024 solicita diseño web", network: "fiverr", timestamp: new Date(Date.now() - 30 * 60000).toISOString(), read: false },
    { id: "3", type: "conversion", title: "¡Venta cerrada!", body: "David Chen contrató tu servicio", network: "linkedin", timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), read: true },
    { id: "4", type: "campaign", title: "Campaña completada", body: "LinkedIn Outreach terminó su secuencia", network: "linkedin", timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), read: true },
    { id: "5", type: "warning", title: "Límite casi alcanzado", body: "LinkedIn: 28/30 acciones hoy", network: "linkedin", timestamp: new Date(Date.now() - 8 * 3600000).toISOString(), read: true },
  ];

  return NextResponse.json({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
}
