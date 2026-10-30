"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Megaphone, Plus, Sparkles } from "lucide-react";

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
  const title = pageTitles[pathname] || "Prospector IA 360";

  return (
    <header className="sticky top-0 z-40 border-b border-violet-100 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 md:px-6">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Prospector IA + Publicidad 360</p><h1 className="truncate text-base font-bold text-slate-900">{title}</h1></div>
        <div className="flex items-center gap-3">
          <Link href="/campaigns" className="hidden items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-violet-100 sm:inline-flex"><Megaphone size={15}/> Campañas</Link><Link href="/wizard" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white hover:from-indigo-700 hover:to-violet-700"><Plus size={15}/><span className="hidden sm:inline">Nueva campaña</span><Sparkles className="sm:hidden" size={15}/></Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
