"use client";

import Link from "next/link";

const menuItems = [
  { name: "Agenda", href: "/calendar", description: "Plan del día" },
  { name: "Pipeline", href: "/pipeline", description: "Kanban de ventas" },
  { name: "Campañas", href: "/campaigns", description: "Secuencias automatizadas" },
  { name: "Automatizaciones", href: "/automations", description: "Reglas automáticas" },
  { name: "Ingresos", href: "/revenue", description: "Tracking de ventas" },
  { name: "Templates", href: "/templates", description: "Mensajes personalizables" },
  { name: "Productos", href: "/products", description: "Catálogo de servicios" },
  { name: "Importar", href: "/import", description: "CSV y contactos" },
  { name: "Contenido", href: "/content", description: "Calendario de posts" },
  { name: "Competencia", href: "/spy", description: "Análisis competitivo" },
  { name: "Referidos", href: "/referrals", description: "Programa de referidos" },
  { name: "Warm-up", href: "/warmup", description: "Calentamiento de cuentas" },
  { name: "Analytics", href: "/analytics", description: "Métricas y rendimiento" },
  { name: "Cola", href: "/queue", description: "Tareas programadas" },
  { name: "Configuración", href: "/settings", description: "Redes y preferencias" },
];

export default function MenuPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.href}
            className="flex flex-col p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            <span className="text-sm font-medium text-gray-900">{item.name}</span>
            <span className="text-[11px] text-gray-500 mt-0.5">{item.description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
