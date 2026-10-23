"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Contact = { id: string; name: string; company: string; status: string; nextFollowUp: string; updatedAt: string };
const KEY = "prospector:local-crm:v1";
function localToday() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
}

export default function AgendaComercialPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) throw new Error("bad data");
      setContacts(parsed.filter((c): c is Contact =>
        c !== null && typeof c === "object" &&
        typeof c.id === "string" && typeof c.status === "string" &&
        typeof c.nextFollowUp === "string" && typeof c.company === "string" &&
        typeof c.name === "string" && typeof c.updatedAt === "string"));
    } catch { setError("No se pudieron cargar los contactos locales. No se ha modificado ningún dato."); }
    setLoaded(true);
  }, []);
  const today = localToday();
  const stats = useMemo(() => {
    const due = contacts.filter(c => c.nextFollowUp && c.nextFollowUp <= today && c.status !== "cliente");
    return { total: contacts.length, newCount: contacts.filter(c => c.status === "nuevo").length,
      contacted: contacts.filter(c => ["contactado", "respondido", "cliente"].includes(c.status)).length,
      due: due.sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp)) };
  }, [contacts, today]);
  return (
    <section className="mx-auto max-w-4xl space-y-5">
      <h1 className="text-2xl font-semibold">Mi jornada comercial</h1>
      <p className="text-sm text-gray-600">Datos del CRM local de este navegador. No se consulta una base de datos central.</p>
      {error && <p role="alert" className="rounded-lg border p-3 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([["Contactos", stats.total], ["Nuevos", stats.newCount], ["Contactados o más", stats.contacted], ["Seguimientos vencidos", stats.due.length]] as const).map(([label, count]) =>
          <div key={label} className="rounded-xl border bg-white p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-2 text-2xl font-semibold">{loaded ? count : "—"}</p></div>)}
      </div>
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Qué hacer hoy</h2>
        <ol className="mt-3 list-inside list-decimal space-y-3 text-sm text-gray-700">
          <li>Revisar {stats.due.length} seguimientos pendientes.</li>
          <li>Buscar cinco empresas reales por sector y municipio.</li>
          <li>Verificar la web oficial y el responsable de cada empresa.</li>
          <li>Preparar mensajes personalizados sin envío automático.</li>
          <li>Actualizar estado y próxima fecha en el CRM de pruebas.</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white" href="/contacts">Abrir CRM</Link>
          <Link className="rounded-lg border px-4 py-2 text-sm" href="/buscar-empresas">Buscar empresas</Link>
        </div>
      </div>
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Próximos seguimientos</h2>
        {!stats.due.length ? <p className="mt-2 text-sm text-gray-500">No hay seguimientos vencidos en el CRM local.</p> :
          <ul className="mt-3 space-y-2">{stats.due.slice(0, 20).map(c =>
            <li key={c.id} className="border-b pb-2 text-sm">{c.company || c.name} · {c.nextFollowUp} · {c.status}</li>)}</ul>}
      </div>
      <p className="text-xs text-gray-500">Las cifras no son clientes captados ni mensajes enviados. Este panel no envía mensajes, no crea tareas automáticas y no representa datos de producción.</p>
    </section>
  );
}
