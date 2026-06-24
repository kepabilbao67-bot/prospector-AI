"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/contacts": "Contactos",
  "/campaigns": "Campañas",
  "/wizard": "Nueva Campaña",
  "/templates": "Templates",
  "/inbox": "Inbox",
  "/analytics": "Analytics",
  "/products": "Productos",
  "/settings": "Configuración",
  "/queue": "Cola de tareas",
  "/menu": "Menú",
  "/pipeline": "Pipeline",
  "/revenue": "Ingresos",
  "/import": "Importar",
  "/onboarding": "Configuración",
  "/calendar": "Agenda",
  "/automations": "Automatizaciones",
  "/warmup": "Warm-up",
  "/content": "Contenido",
  "/spy": "Competencia",
  "/referrals": "Referidos",
};

export function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "ProspectorAI";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 h-14 md:px-6">
        <h1 className="text-sm font-semibold text-gray-900">{title}</h1>
        <div className="flex items-center gap-3">
          <button className="relative p-1.5 rounded-md hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-blue-600 rounded-full" />
          </button>
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[11px] font-medium text-gray-600">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
