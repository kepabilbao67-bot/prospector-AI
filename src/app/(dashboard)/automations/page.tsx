"use client";
import { AUTOMATION_TEMPLATES } from "@/lib/automations";
import { Activity, LockKeyhole, Workflow, ShieldCheck } from "lucide-react";

export default function AutomationsPage(){
 return <div className="space-y-6">
   <div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Automatizaciones 360</h1><p className="mt-1 text-sm text-slate-500">Diseña procesos comerciales con controles y trazabilidad.</p></div><span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800"><LockKeyhole size={15}/> Ejecución no habilitada desde esta pantalla</span></div>
   <div className="grid gap-4 md:grid-cols-3">
    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"><Workflow className="text-indigo-600" size={23}/><p className="mt-3 text-3xl font-extrabold text-indigo-950">{AUTOMATION_TEMPLATES.length}</p><p className="text-sm text-slate-500">Plantillas de referencia</p></div>
    <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><Activity className="text-violet-600" size={23}/><p className="mt-3 text-3xl font-extrabold text-slate-900">—</p><p className="text-sm text-slate-500">Ejecuciones reales no consultadas</p></div>
    <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm"><ShieldCheck className="text-teal-600" size={23}/><p className="mt-3 text-lg font-bold text-slate-900">Control humano</p><p className="text-sm text-slate-500">Sin activación ni envíos desde esta vista</p></div>
   </div>
   <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 text-sm text-indigo-950"><strong>Estado operativo:</strong> las siguientes reglas son ejemplos incluidos en el código, no automatizaciones activas ni ejecuciones verificadas. Para ejecutarlas se requiere autenticación, persistencia, consentimiento y un adaptador autorizado.</div>
   <section className="grid gap-4 xl:grid-cols-2" aria-label="Plantillas de automatización">
     {AUTOMATION_TEMPLATES.map(rule=><article key={rule.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
       <div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-bold text-slate-900">{rule.name}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">Plantilla · no activa</span></div>
       <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-indigo-600">Disparador propuesto</p><p className="mt-1 text-sm text-slate-700">{rule.trigger.type.replace(/_/g," ")}</p>
       <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-violet-600">Acciones propuestas</p><div className="mt-2 flex flex-wrap gap-2">{rule.actions.map((a,i)=><span key={i} className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs text-violet-800">{a.type.replace(/_/g," ")}</span>)}</div>
     </article>)}
   </section>
 </div>;
}
