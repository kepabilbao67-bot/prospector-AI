"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Megaphone, MessageSquare, RefreshCw, Sparkles, Target, Users, Workflow } from "lucide-react";

type Campaign = { id: string; name: string; network: string; status: string; stats: string | null };
type Contact = { id: string; firstName: string; lastName: string | null; company: string | null; status: string; network: string };
type Analytics = { stats: { messagesSent: number; repliesReceived: number; connectionsAccepted: number; conversions: number }; replyRate: string; conversionRate: string };
const networkNames: Record<string,string> = { linkedin:"LinkedIn",fiverr:"Fiverr",instagram:"Instagram",email:"Email",whatsapp:"WhatsApp",twitter:"X",facebook:"Facebook" };
const statusNames: Record<string,string> = { active:"Activa",paused:"Pausada",draft:"Borrador",completed:"Completada",new:"Nuevo",contacted:"Contactado",replied:"Respondido",qualified:"Calificado",converted:"Convertido",lost:"Perdido" };
const tones: Record<string,string> = { active:"bg-emerald-100 text-emerald-700",completed:"bg-indigo-100 text-indigo-700",paused:"bg-amber-100 text-amber-700",draft:"bg-slate-100 text-slate-600",converted:"bg-emerald-100 text-emerald-700",qualified:"bg-violet-100 text-violet-700",replied:"bg-sky-100 text-sky-700" };
const shortcuts = [
  { href:"/wizard",title:"Crear campaña",detail:"Asistente para preparar una campaña",icon:Sparkles,color:"from-violet-600 to-indigo-600",light:false },
  { href:"/contacts",title:"Prospectar clientes",detail:"CRM y oportunidades comerciales",icon:Users,color:"",light:true },
  { href:"/pipeline",title:"Pipeline de ventas",detail:"Visualiza el seguimiento",icon:Target,color:"",light:true },
  { href:"/campaigns",title:"Publicidad 360",detail:"Gestiona campañas y contenidos",icon:Megaphone,color:"",light:true },
];
function parseStats(value: string | null): { sent?: number; replied?: number } {
  try { const parsed: unknown = JSON.parse(value || "{}"); if (!parsed || typeof parsed !== "object") return {}; const p = parsed as Record<string,unknown>; return { sent: typeof p.sent === "number" ? p.sent : undefined, replied:typeof p.replied === "number" ? p.replied : undefined }; } catch { return {}; }
}
async function readApi(path:string):Promise<unknown> {
  const response=await fetch(path,{cache:"no-store"});
  if(!response.ok) throw new Error("No se pudo consultar "+path+" (HTTP "+response.status+")");
  return response.json();
}
export default function DashboardPage() {
  const [campaigns,setCampaigns]=useState<Campaign[]>([]);
  const [contacts,setContacts]=useState<Contact[]>([]);
  const [analytics,setAnalytics]=useState<Analytics | null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string | null>(null);
  const reload=useCallback(async ()=>{
    setLoading(true);setError(null);
    try {
      const [campaignData,contactData,analyticsData]=await Promise.all([readApi("/api/campaigns"),readApi("/api/contacts?limit=5"),readApi("/api/analytics?days=7")]);
      const c=campaignData as {campaigns?:Campaign[]};
      const co=contactData as {contacts?:Contact[]};
      const a=analyticsData as Analytics;
      if(!Array.isArray(c.campaigns)||!Array.isArray(co.contacts)||!a?.stats) throw new Error("La API devolvió datos incompletos");
      setCampaigns(c.campaigns);setContacts(co.contacts);setAnalytics(a);
    }catch(e){setCampaigns([]);setContacts([]);setAnalytics(null);setError(e instanceof Error?e.message:"Error al cargar los datos");}
    finally {setLoading(false);}
  },[]);
  useEffect(()=>{void reload();},[reload]);
  const stats=analytics?.stats;
  const metrics=[
    {title:"Mensajes registrados",value:stats?.messagesSent,detail:"Período consultado: 7 días",icon:MessageSquare,color:"bg-blue-100 text-blue-700"},
    {title:"Respuestas",value:stats?.repliesReceived,detail:analytics?analytics.replyRate+"% tasa":"Sin datos",icon:Workflow,color:"bg-violet-100 text-violet-700"},
    {title:"Conexiones",value:stats?.connectionsAccepted,detail:"Aceptadas",icon:Users,color:"bg-amber-100 text-amber-700"},
    {title:"Conversiones",value:stats?.conversions,detail:analytics?analytics.conversionRate+"% tasa":"Sin datos",icon:BarChart3,color:"bg-emerald-100 text-emerald-700"},
  ];
  return <div className="space-y-7 pb-8">
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-900 px-6 py-7 text-white shadow-xl md:px-9 md:py-9">
      <div className="pointer-events-none absolute -right-12 -top-28 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
      <div className="relative flex flex-wrap items-center justify-between gap-5">
        <div className="max-w-2xl"><p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-violet-200">Centro comercial · Kepa 360</p>
          <h1 className="text-2xl font-bold tracking-tight md:text-4xl">Prospector IA <span className="text-fuchsia-300">+ Publicidad 360</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-200">Gestiona prospectos, campañas y oportunidades desde un único panel. Las comunicaciones reales requieren autorización.</p>
        </div>
        <div className="flex gap-2"><Link href="/wizard" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-violet-100"><Sparkles size={16}/> Nueva campaña <ArrowRight size={15}/></Link></div>
      </div>
    </section>
    <section aria-label="Indicadores comerciales">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">Resumen comercial</h2><p className="text-xs text-slate-500">Información recibida de las APIs; no equivale a envíos verificados externamente.</p></div><button type="button" disabled={loading} onClick={()=>void reload()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"><RefreshCw size={14} className={loading?"animate-spin":""}/>Actualizar</button></div>
      {error && <div role="alert" className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">Datos no disponibles: {error}. No se muestran cifras ficticias.</div>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(m=><div key={m.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{m.title}</span><span className={`rounded-xl p-2 ${m.color}`}><m.icon size={19}/></span></div><p className="text-3xl font-bold tabular-nums text-slate-950">{loading?"…":m.value ?? "—"}</p><p className="mt-1 text-xs text-slate-500">{m.detail}</p></div>)}</div>
    </section>
    <section><h2 className="mb-3 font-bold text-slate-900">Acciones rápidas</h2><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{shortcuts.map(s=><Link key={s.href} href={s.href} className={`group rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${s.light?"border-slate-200 bg-white":"border-transparent bg-gradient-to-br "+s.color+" text-white"}`}><s.icon size={23} className={s.light?"text-indigo-600":"text-white"}/><p className={`mt-4 font-bold ${s.light?"text-slate-900":"text-white"}`}>{s.title}</p><p className={`mt-1 text-xs ${s.light?"text-slate-500":"text-violet-100"}`}>{s.detail}</p><ArrowRight size={17} className="mt-4 opacity-60 transition group-hover:translate-x-1"/></Link>)}</div></section>
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-900">Campañas</h2><p className="text-xs text-slate-500">Estados registrados en el CRM</p></div><Link href="/campaigns" className="text-sm font-semibold text-indigo-600 hover:underline">Ver todas</Link></div>
      {campaigns.length===0?<p className="p-6 text-sm text-slate-500">{loading?"Cargando campañas…":error?"No se pueden consultar campañas.":"No hay campañas registradas."}</p>:<div className="divide-y divide-slate-100">{campaigns.slice(0,5).map(c=>{const s=parseStats(c.stats);return <div key={c.id} className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{c.name}</p><p className="mt-1 text-xs text-slate-500">{networkNames[c.network]||c.network}</p></div><div className="text-right"><span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${tones[c.status]||"bg-slate-100 text-slate-600"}`}>{statusNames[c.status]||c.status}</span><p className="mt-1 text-xs text-slate-500">{s.sent===undefined?"Sin métricas":s.sent+" enviados registrados"}</p></div></div>})}</div>}</section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 p-5"><div><h2 className="font-bold text-slate-900">Leads recientes</h2><p className="text-xs text-slate-500">Contactos disponibles en el CRM</p></div><Link href="/contacts" className="text-sm font-semibold text-indigo-600 hover:underline">Ver todos</Link></div>
      {contacts.length===0?<p className="p-6 text-sm text-slate-500">{loading?"Cargando contactos…":error?"No se pueden consultar contactos.":"No hay contactos registrados."}</p>:<div className="divide-y divide-slate-100">{contacts.map(c=><div key={c.id} className="flex items-center gap-3 p-4 hover:bg-slate-50"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-bold text-indigo-700">{(c.firstName?.[0]||"?")+(c.lastName?.[0]||"")}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{c.firstName} {c.lastName||""}</p><p className="truncate text-xs text-slate-500">{c.company||"Sin empresa"} · {networkNames[c.network]||c.network}</p></div><span className={`rounded-full px-2 py-1 text-xs font-medium ${tones[c.status]||"bg-slate-100 text-slate-600"}`}>{statusNames[c.status]||c.status}</span></div>)}</div>}</section>
    </div>
    <p className="text-center text-xs text-slate-400">Prospector IA 360 · Panel de gestión. La disponibilidad de datos depende de las APIs y los permisos configurados.</p>
  </div>;
}
