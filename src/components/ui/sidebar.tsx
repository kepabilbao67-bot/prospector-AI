"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Wizard IA", href: "/wizard", icon: "✨" },
  { name: "Inbox", href: "/inbox", icon: "💬" },
  { name: "Agenda", href: "/calendar", icon: "📅" },
  { name: "Pipeline", href: "/pipeline", icon: "🎯" },
  { name: "Contactos", href: "/contacts", icon: "👥" },
  { name: "Campañas", href: "/campaigns", icon: "🚀" },
  { name: "Automatizaciones", href: "/automations", icon: "🤖" },
  { name: "Productos", href: "/products", icon: "🛍️" },
  { name: "Ingresos", href: "/revenue", icon: "💰" },
  { name: "Templates", href: "/templates", icon: "📝" },
  { name: "Importar", href: "/import", icon: "📥" },
  { name: "Cola de Tareas", href: "/queue", icon: "⏳" },
  { name: "Analytics", href: "/analytics", icon: "📈" },
  { name: "Configuración", href: "/settings", icon: "⚙️" },
  { name: "Warm-up", href: "/warmup", icon: "🛡️" },
  { name: "Contenido", href: "/content", icon: "📣" },
  { name: "Espía", href: "/spy", icon: "🕵️" },
  { name: "Referidos", href: "/referrals", icon: "🎁" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          🔥 ProspectorAI
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-600/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Network Status */}
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-2">Redes Conectadas</p>
        <div className="flex gap-2 flex-wrap">
          {["💼", "🟢", "🐦", "📸", "📧", "💬", "🎵", "📘"].map((icon, i) => (
            <span key={i} title="Network" className="text-lg opacity-80 hover:opacity-100 cursor-pointer">{icon}</span>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold">
          U
        </div>
        <div>
          <p className="text-sm font-medium">Mi Cuenta</p>
          <p className="text-xs text-gray-500">Plan Pro</p>
        </div>
      </div>
    </div>
  );
}
