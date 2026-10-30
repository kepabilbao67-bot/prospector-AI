"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CircleAlert, RefreshCw, Users } from "lucide-react";

type Lead = { id:string; firstName:string; lastName:string|null; company:string|null; network:string; status:string; };
const stages = [
 { id:"new",label:"Nuevos",tone:"border-sky-200 bg-sky-50",dot:"bg-sky-500" },
 { id:"contacted",label:"Contactados",tone:"border-indigo-200 bg-indigo-50",dot:"bg-indigo-500" },
 { id:"replied",label:"Respondidos",tone:"border-violet-200 bg-violet-50",dot:"bg-violet-500" },
 { id:"qualified",label:"Calificados",tone:"border-amber-200 bg-amber-50",dot:"bg-amber-500" },
 { id:"converted",label:"Convertidos",tone:"border-emerald-200 bg-emerald-50",dot:"bg-emerald-500" },
] as const;
const networks:Record<string,string>={linkedin:"LinkedIn",fiverr:"Fiverr",instagram:"Instagram",email:"Email",whatsapp:"WhatsApp",other:"Otro"};
export default function PipelinePage(){
 const [leads,setLeads]=useState<Lead[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState<string|null>(null);
 async function refresh(){
  setLoading(true);setError(null);
  try {
   const r=await fetch("/api/contacts",{cache:"no-store"});
   if(!r.ok)throw new Error("HTTP "+r.status);
   const json:unknown=await r.json();
   if(!json||typeof json!=="object"||!Array.isArray((json as {contacts?:unknown}).contacts))throw new Error("Respuesta del CRM no válida");
   setLeads((json as {contacts:Lead[]}).contacts);
  }catch(e){setLeads([]);setError(e instanceof Error?e.message:"Error de conexión");}
  finally{setLoading(false);}
 }
 useEffect(()=>{void refresh();},[]);
 return <div className="space-y-6">
   <div className="flex flex-wrap items-center justify-between gap-4">
     <div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Pipeline comercial</h1><p className="mt-1 text-sm text-slate-500">Contactos registrados en el CRM, agrupados por etapa.</p></div>
     <div className="flex gap-2"><button type="button" onClick={()=>void refresh()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-semibold text-indigo-700 disabled:opacity-50"><RefreshCw size={16}/>Actualizar</button><Link href="/contacts" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Ver CRM <ArrowRight size={16}/></Link></div>
   </div>
   {error&&<div role="alert" className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><CircleAlert size={20}/>No se pudieron cargar los contactos: {error}. No se mostrarán datos ficticios.</div>}
   <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"><Users className="text-indigo-600" size={20}/><p className="mt-3 text-3xl font-bold text-slate-900">{loading?"—":error?"—":leads.length}</p><p className="text-sm text-slate-500">Contactos consultados</p></div><div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><BriefcaseBusiness className="text-violet-600" size={20}/><p className="mt-3 text-3xl font-bold text-slate-900">{loading||error?"—":leads.filter(l=>l.status==="qualified").length}</p><p className="text-sm text-slate-500">Calificados</p></div><div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm"><ArrowRight className="text-emerald-600" size={20}/><p className="mt-3 text-3xl font-bold text-slate-900">{loading||error?"—":leads.filter(l=>l.status==="converted").length}</p><p className="text-sm text-slate-500">Convertidos según CRM</p></div></div>
   <p className="text-xs text-slate-500">Vista de consulta: las tarjetas no se pueden arrastrar hasta habilitar persistencia y autorización. No se muestran importes no verificados.</p>
   <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{stages.map(stage=><section key={stage.id} className={`min-h-60 rounded-2xl border p-3 ${stage.tone}`}><div className="mb-4 flex items-center justify-between gap-2 px-1"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-800"><span className={`h-2.5 w-2.5 rounded-full ${stage.dot}`}/>{stage.label}</h2><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-700">{loading||error?"—":leads.filter(l=>l.status===stage.id).length}</span></div><div className="space-y-3">{!loading&&!error&&leads.filter(l=>l.status===stage.id).length===0&&<p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">Sin registros</p>}{leads.filter(l=>l.status===stage.id).map(l=><article key={l.id} className="rounded-xl border border-white bg-white p-4 shadow-sm"><p className="truncate text-sm font-bold text-slate-900">{l.firstName} {l.lastName||""}</p><p className="mt-1 truncate text-xs text-slate-500">{l.company||"Sin empresa"}</p><p className="mt-3 text-xs font-medium text-indigo-600">{networks[l.network]||l.network}</p></article>)}</div></section>)}</div>
   <p className="text-xs text-slate-500">Los registros con estados diferentes de los cinco representados permanecen en el CRM. La API puede limitar el número de resultados consultados.</p>
 </div>;
}
