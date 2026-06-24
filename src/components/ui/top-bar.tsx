"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "ProspectorAI",
  "/contacts": "Contactos",
  "/campaigns": "Campañas",
  "/wizard": "Wizard IA",
  "/templates": "Templates",
  "/inbox": "Inbox",
  "/analytics": "Analytics",
  "/products": "Productos",
  "/settings": "Ajustes",
  "/queue": "Cola",
  "/menu": "Menú",
  "/pipeline": "Pipeline",
  "/revenue": "Ingresos",
  "/import": "Importar",
  "/onboarding": "Configuración Inicial",
};

export function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "ProspectorAI";

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center justify-between px-4 h-14 md:h-16 md:px-8">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900 md:text-xl">
            {pathname === "/" && <span className="mr-1">🔥</span>}
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold md:w-9 md:h-9">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
