"use client";
import Link from "next/link";
import { Inbox, Mail, ShieldAlert, ArrowRight, MessageCircle } from "lucide-react";

export default function InboxPage() {
 return <div className="space-y-6">
   <div className="flex flex-wrap items-center justify-between gap-4">
     <div><h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Centro de comunicaciones</h1><p className="mt-1 text-sm text-slate-500">Gestiona seguimientos comerciales sin confundir ejemplos con mensajes recibidos.</p></div>
     <Link href="/contacts" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"><ArrowRight size={16}/> Abrir contactos</Link>
   </div>
   <div className="grid gap-4 md:grid-cols-3">
     <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm"><Inbox size={24} className="text-indigo-600"/><h2 className="mt-4 font-bold text-slate-900">Bandeja unificada</h2><p className="mt-2 text-sm text-slate-500">Pendiente de conexión con proveedores de correo y mensajería autorizados.</p></div>
     <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm"><Mail size={24} className="text-violet-600"/><h2 className="mt-4 font-bold text-slate-900">Seguimientos</h2><p className="mt-2 text-sm text-slate-500">Consulta contactos y prepara respuestas antes de enviarlas desde un canal autorizado.</p></div>
     <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm"><MessageCircle size={24} className="text-teal-600"/><h2 className="mt-4 font-bold text-slate-900">IA comercial</h2><p className="mt-2 text-sm text-slate-500">Sugerencias y borradores disponibles cuando exista una conversación real autenticada.</p></div>
   </div>
   <div className="flex flex-col items-start gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:flex-row">
      <ShieldAlert size={24} className="shrink-0 text-amber-700"/><div><h2 className="font-bold text-amber-950">Sin bandeja de mensajes verificada</h2><p className="mt-2 text-sm leading-relaxed text-amber-900">Se han retirado los chats y respuestas precargados que aparentaban ser conversaciones reales. Esta pantalla no envía mensajes ni confirma recepción hasta disponer de una integración segura con el canal correspondiente.</p></div>
   </div>
 </div>;
}
