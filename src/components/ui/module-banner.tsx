"use client";
import { usePathname } from "next/navigation";
import { Activity, BarChart3, CalendarDays, CheckCircle2, Clock3, FileText, Gift, Inbox, Layers3, Megaphone, MessageSquare, Package, Radar, Settings, ShieldCheck, Sparkles, Target, Upload, Users, Wallet, Workflow } from "lucide-react";
const sections = [
 ["/contacts","CRM y contactos","Organiza y clasifica oportunidades comerciales.",Users],
 ["/campaigns","Gestión de campañas","Prepara, revisa y supervisa tus campañas.",Megaphone],
 ["/wizard","Asistente de campañas","Diseña una nueva campaña paso a paso.",Sparkles],
 ["/analytics","Inteligencia comercial","Consulta el rendimiento registrado de tus acciones.",BarChart3],
 ["/pipeline","Pipeline de ventas","Controla las oportunidades por etapa.",Target],
 ["/inbox","Bandeja de comunicaciones","Revisa conversaciones y seguimientos.",Inbox],
 ["/calendar","Agenda comercial","Organiza tus próximas actividades.",CalendarDays],
 ["/automations","Automatizaciones","Gestiona reglas y flujos de trabajo.",Workflow],
 ["/products","Catálogo comercial","Presenta tus productos y servicios.",Package],
 ["/revenue","Ingresos y resultados","Consulta los registros financieros disponibles.",Wallet],
 ["/templates","Plantillas comerciales","Reutiliza mensajes y contenidos.",FileText],
 ["/import","Importación de contactos","Añade información al CRM con control.",Upload],
 ["/content","Estudio de contenidos","Prepara material de comunicación.",MessageSquare],
 ["/spy","Análisis de competencia","Consulta oportunidades y referencias.",Radar],
 ["/referrals","Referidos","Gestiona recomendaciones comerciales.",Gift],
 ["/warmup","Preparación de cuentas","Revisa configuraciones y estado de cuentas.",ShieldCheck],
 ["/queue","Cola de tareas","Consulta trabajos programados y pendientes.",Clock3],
 ["/settings","Configuración","Ajusta las preferencias de la plataforma.",Settings],
 ["/onboarding","Primeros pasos","Configura el entorno de trabajo.",CheckCircle2],
 ["/menu","Herramientas","Accede a los módulos de Prospector 360.",Layers3],
] as const;
export function ModuleBanner(){
 const pathname=usePathname();
 if(pathname==="/")return null;
 const section=sections.find(s=>pathname===s[0]||pathname.startsWith(s[0]+"/"));
 const [,title,subtitle,Icon]=section??["/","Centro de herramientas","Gestiona tu actividad comercial.",Activity];
 return <section className="relative mb-6 overflow-hidden rounded-2xl border border-violet-200/70 bg-gradient-to-r from-indigo-950 via-indigo-900 to-violet-800 px-5 py-5 text-white shadow-lg md:px-7 md:py-6">
   <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" aria-hidden="true"/>
   <div className="relative flex items-center gap-4"><div className="rounded-2xl bg-white/15 p-3"><Icon size={24} aria-hidden="true"/></div><div className="min-w-0"><p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-indigo-200">Prospector IA · Publicidad 360</p><h2 className="text-xl font-bold text-white md:text-2xl">{title}</h2><p className="mt-1 text-xs text-indigo-100 md:text-sm">{subtitle}</p></div></div>
 </section>;
}
