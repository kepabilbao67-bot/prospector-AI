"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Contact = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  sector: string;
  status: "nuevo" | "pendiente" | "contactado" | "respondido" | "cliente";
  nextFollowUp: string;
  notes: string;
  updatedAt: string;
};

const STORE = "prospector:local-crm:v1";
const emptyForm = {
  name: "", company: "", phone: "", email: "", sector: "", status: "nuevo" as Contact["status"],
  nextFollowUp: "", notes: "",
};
const statuses: Contact["status"][] = ["nuevo", "pendiente", "contactado", "respondido", "cliente"];

function isContact(value: unknown): value is Contact {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<Contact>;
  return typeof c.id === "string" && typeof c.name === "string" &&
    typeof c.company === "string" && typeof c.phone === "string" &&
    typeof c.email === "string" && typeof c.notes === "string" &&
    typeof c.sector === "string" && typeof c.nextFollowUp === "string" &&
    typeof c.updatedAt === "string" && statuses.includes(c.status as Contact["status"]);
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORE);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) throw new Error("Formato no válido");
        setContacts(parsed.filter(isContact).slice(0, 2000));
      }
    } catch {
      setNotice("No se pudieron recuperar los contactos locales. No se ha sobrescrito el almacenamiento.");
    }
    setReady(true);
  }, []);

  const results = useMemo(() => {
    const q = query.toLocaleLowerCase("es").trim();
    return contacts.filter(c => !q || [c.name, c.company, c.sector, c.email, c.phone].some(v =>
      v.toLocaleLowerCase("es").includes(q)
    )).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [contacts, query]);

  const today = new Date().toLocaleDateString("en-CA");
  const due = contacts.filter(c => c.nextFollowUp && c.nextFollowUp <= today && c.status !== "cliente")
    .sort((a, b) => a.nextFollowUp.localeCompare(b.nextFollowUp));

  function persist(next: Contact[]): boolean {
    try {
      window.localStorage.setItem(STORE, JSON.stringify(next));
      setContacts(next);
      return true;
    } catch {
      setNotice("No se pudo guardar. Comprueba el almacenamiento del navegador; no se ha confirmado ningún cambio.");
      return false;
    }
  }

  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ready) return;
    if (!form.name.trim() && !form.company.trim()) {
      setNotice("Introduce al menos el nombre del contacto o la empresa.");
      return;
    }
    const timestamp = new Date().toISOString();
    const data = {
      name: form.name.trim(), company: form.company.trim(), phone: form.phone.trim(),
      email: form.email.trim(), sector: form.sector.trim(), status: form.status,
      nextFollowUp: form.nextFollowUp, notes: form.notes.trim(), updatedAt: timestamp,
    };
    const next = editingId
      ? contacts.map(c => c.id === editingId ? { ...c, ...data } : c)
      : [{ id: crypto.randomUUID(), ...data }, ...contacts];
    if (persist(next)) {
      setNotice(editingId ? "Contacto actualizado en este navegador." : "Contacto guardado en este navegador.");
      setForm(emptyForm);
      setEditingId(null);
    }
  }

  function exportBackup() {
    if (!ready || !contacts.length) { setNotice("No hay contactos locales que exportar."); return; }
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), contacts }, null, 2)],
      { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "prospector-contactos-" + new Date().toISOString().slice(0, 10) + ".json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Copia de contactos preparada para descargar. Guárdala en un lugar privado.");
  }

  function edit(c: Contact) {
    setEditingId(c.id);
    setForm({ name: c.name, company: c.company, phone: c.phone, email: c.email,
      sector: c.sector, status: c.status, nextFollowUp: c.nextFollowUp, notes: c.notes });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function remove(c: Contact) {
    if (!window.confirm("¿Eliminar el contacto local de " + (c.company || c.name) + "? Esta acción no se puede deshacer.")) return;
    if (persist(contacts.filter(x => x.id !== c.id))) {
      setNotice("Contacto eliminado del almacenamiento local.");
      if (editingId === c.id) { setEditingId(null); setForm(emptyForm); }
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">CRM · Mis contactos</h1>
        <p className="mt-2 text-sm text-gray-600">Añade tus empresas y contactos, consulta el estado comercial y anota cuándo debes volver a llamar.</p>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <strong>Versión local de pruebas.</strong> Los contactos se guardan únicamente en este navegador y perfil, sin sincronización ni copia de seguridad automática. No uses todavía datos personales sensibles ni este CRM en dispositivos compartidos. La conexión multiusuario y segura al servidor sigue pendiente.
      </div>
      <section className="rounded-xl border bg-white p-5" aria-label="Seguimientos pendientes">
        <h2 className="font-semibold">Seguimientos de hoy y atrasados: {due.length}</h2>
        {due.length === 0 ? <p className="mt-2 text-sm text-gray-600">No hay seguimientos vencidos registrados.</p> :
          <ul className="mt-3 space-y-2">
            {due.map(c => <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm">
              <span>{c.company || c.name} · {c.nextFollowUp} · {c.status}</span>
              <button type="button" className="text-blue-700 underline" onClick={() => edit(c)}>Abrir seguimiento</button>
            </li>)}
          </ul>}
        <p className="mt-2 text-xs text-gray-500">Este panel se calcula con los contactos de este navegador. No envía recordatorios ni mensajes.</p>
      </section>
      <form onSubmit={save} className="space-y-4 rounded-xl border bg-white p-5">
        <h2 className="text-lg font-semibold">{editingId ? "Editar contacto" : "Añadir contacto"}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ["name", "Nombre del contacto"], ["company", "Empresa"], ["phone", "Teléfono con prefijo"], ["email", "Correo electrónico"], ["sector", "Sector"],
          ] as const).map(([key, title]) => (
            <label key={key} className="block text-sm font-medium">{title}
              <input className="mt-1 w-full rounded-lg border px-3 py-2 font-normal"
                type={key === "email" ? "email" : key === "phone" ? "tel" : "text"}
                maxLength={key === "email" ? 254 : 120}
                value={form[key]} onChange={e => setForm(v => ({ ...v, [key]: e.target.value }))} />
            </label>
          ))}
          <label className="block text-sm font-medium">Estado comercial
            <select value={form.status} onChange={e => setForm(v => ({ ...v, status: e.target.value as Contact["status"] }))} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal">
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Próximo seguimiento
            <input type="date" value={form.nextFollowUp} onChange={e => setForm(v => ({ ...v, nextFollowUp: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal" />
          </label>
        </div>
        <label className="block text-sm font-medium">Notas comerciales
          <textarea rows={3} maxLength={1500} value={form.notes} onChange={e => setForm(v => ({ ...v, notes: e.target.value }))} className="mt-1 w-full rounded-lg border px-3 py-2 font-normal" />
        </label>
        <div className="flex gap-2">
          <button disabled={!ready} type="submit" className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50">{editingId ? "Guardar cambios" : "Guardar contacto"}</button>
          {editingId && <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancelar edición</button>}
        </div>
      </form>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-semibold">Mis registros: {contacts.length}</h2>
            <button type="button" disabled={!ready || !contacts.length} onClick={exportBackup} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">Exportar copia JSON</button>
          </div>
          <input aria-label="Buscar contactos" placeholder="Buscar por empresa, sector, nombre…" value={query} onChange={e => setQuery(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm sm:w-80" />
        </div>
        {!ready ? <p>Cargando contactos locales…</p> : results.length === 0 ? <p className="rounded-xl border bg-white p-5 text-sm text-gray-600">No hay contactos. Utiliza el formulario para añadir el primero.</p> : (
          <div className="grid gap-3">
            {results.map(c => <article key={c.id} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div><h3 className="font-semibold">{c.company || c.name}</h3><p className="text-sm text-gray-600">{c.name}{c.company && c.name ? " · " : ""}{c.sector}</p></div>
                <span className="rounded bg-gray-100 px-2 py-1 text-xs">{c.status}</span>
              </div>
              <p className="mt-2 text-sm text-gray-700">{c.phone || "Sin teléfono"} · {c.email || "Sin email"}</p>
              {c.nextFollowUp && <p className="mt-1 text-sm">Próximo seguimiento: {c.nextFollowUp}</p>}
              {c.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">{c.notes}</p>}
              <div className="mt-3 flex flex-wrap gap-3">
                <Link href="/buscar-empresas" onClick={() => { try { window.sessionStorage.setItem("prospector:selected-contact:v1", JSON.stringify({ phone: c.phone, company: c.company, name: c.name })); } catch { setNotice("No se pudieron transferir los datos. Introdúcelos manualmente."); } }} className="text-sm font-medium text-green-800">Preparar WhatsApp y voz</Link>
                <a href={"https://www.linkedin.com/search/results/companies/?keywords=" + encodeURIComponent(c.company || c.name)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-700">Buscar en LinkedIn</a>
                <button type="button" className="text-sm font-medium text-blue-700" onClick={() => edit(c)}>Editar</button>
                <button type="button" className="text-sm font-medium text-red-700" onClick={() => remove(c)}>Eliminar</button>
              </div>
            </article>)}
          </div>
        )}
      </div>
      <p role="status" aria-live="polite" className="text-sm text-gray-700">{notice}</p>
    </section>
  );
}
