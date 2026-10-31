"use client";
import Link from "next/link";
import { FilePenLine, Megaphone, ShieldCheck, Sparkles } from "lucide-react";
export default function ContentPage(){
 const ideas=[
  {title:"Digitalización de empresas de Bizkaia",channel:"LinkedIn",summary:"Explicar cómo centralizar solicitudes y seguimiento comercial sin prometer resultados no medidos.",cta:"Solicitar diagnóstico"},
  {title:"Gestión de presupuestos",channel:"Email",summary:"Mostrar una propuesta de flujo: recepción, presupuesto, revisión y seguimiento.",cta:"Pedir una demostración"},
  {title:"Automatización administrativa",channel:"Web",summary:"Describir tareas repetitivas que una aplicación puede facilitar tras estudiar el proceso real.",cta:"Consultar posibilidades"}
 ];
 return <div className="space-y-6">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Estudio de contenidos 360</h1><p className="mt-2 text-sm text-slate-500">Conceptos publicitarios preparados para revisar y adaptar.</p></div><Link href="/wizard" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"><Sparkles size={16}/> Crear campaña</Link></div>
  <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"><FilePenLine className="text-indigo-600"/><p className="mt-3 text-2xl font-bold text-slate-900">{ideas.length}</p><p className="text-sm text-slate-500">Ideas editoriales de ejemplo</p></div><div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><Megaphone className="text-violet-600"/><p className="mt-3 text-2xl font-bold text-slate-900">—</p><p className="text-sm text-slate-500">Publicaciones verificadas</p></div><div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm"><ShieldCheck className="text-teal-600"/><p className="mt-3 font-bold text-slate-900">Revisión humana</p><p className="text-sm text-slate-500">No se publica desde este módulo</p></div></div>
  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Estas ideas son propuestas editoriales, no publicaciones programadas o realizadas. No se registran campañas reales desde esta página.</div>
  <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{ideas.map(idea=><article key={idea.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{idea.channel} · Idea</span><h2 className="mt-5 text-lg font-bold text-slate-900">{idea.title}</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">{idea.summary}</p><p className="mt-5 border-t border-slate-100 pt-4 text-sm font-semibold text-violet-700">CTA propuesto: {idea.cta}</p></article>)}</section>
 </div>;
}
