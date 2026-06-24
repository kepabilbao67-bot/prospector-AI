"use client";

import Link from "next/link";

const menuItems = [
  { name: "Campañas", href: "/campaigns", icon: "🚀", description: "Secuencias automatizadas" },
  { name: "Templates", href: "/templates", icon: "📝", description: "Mensajes personalizables" },
  { name: "Productos", href: "/products", icon: "🛍️", description: "Tu catálogo de servicios" },
  { name: "Analytics", href: "/analytics", icon: "📈", description: "Métricas y rendimiento" },
  { name: "Cola de Tareas", href: "/queue", icon: "⏳", description: "Acciones programadas" },
  { name: "Configuración", href: "/settings", icon: "⚙️", description: "Redes y preferencias" },
];

export default function MenuPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center gap-2 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm active:scale-95 transition-all hover:shadow-md"
          >
            <span className="text-3xl">{item.icon}</span>
            <span className="text-sm font-semibold text-gray-900">{item.name}</span>
            <span className="text-[11px] text-gray-500 text-center">{item.description}</span>
          </Link>
        ))}
      </div>

      {/* Quick stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-5 text-white">
        <h3 className="font-semibold text-lg mb-3">Tu Plan: Pro</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold">∞</p>
            <p className="text-xs opacity-80">Contactos</p>
          </div>
          <div>
            <p className="text-2xl font-bold">∞</p>
            <p className="text-xs opacity-80">Campañas</p>
          </div>
          <div>
            <p className="text-2xl font-bold">5</p>
            <p className="text-xs opacity-80">Redes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
