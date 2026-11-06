"use client";

import { useState } from "react";
import Link from "next/link";

type PersonalContact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: "google_contacts";
};

export default function PersonalContactsPage() {
  const [contacts, setContacts] = useState<PersonalContact[]>([]);
  const [query, setQuery] = useState("");
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  async function loadContacts(next = false) {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (next && nextPageToken) params.set("pageToken", nextPageToken);
      const response = await fetch("/api/contactos-personales?" + params.toString(), { cache: "no-store" });
      if (!response.ok) {
        throw new Error(response.status === 503
          ? "Google Contacts aún no está autorizado para Prospectoría 360."
          : "No se pudo cargar la agenda (" + response.status + ").");
      }
      const data = await response.json();
      if (!Array.isArray(data.contacts)) throw new Error("Respuesta inválida de Google Contacts");
      setContacts(previous => next ? [...previous, ...data.contacts] : data.contacts);
      setNextPageToken(data.nextPageToken || null);
      setLoaded(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-5">
      <header className="space-y-2">
        <Link href="/contacts" className="text-sm text-indigo-600 hover:underline">Volver al CRM comercial</Link>
        <h1 className="text-2xl font-bold text-slate-900">Mis contactos · Google</h1>
        <p className="text-sm text-slate-600">Agenda personal de solo lectura. No se copian, fusionan ni envían contactos a campañas.</p>
      </header>
      <form className="flex flex-wrap gap-2" onSubmit={event => { event.preventDefault(); setNextPageToken(null); void loadContacts(false); }}>
        <input className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2" value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar en los contactos" aria-label="Buscar contactos personales" />
        <button disabled={loading} type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-white disabled:opacity-50">{loading ? "Consultando..." : "Consultar agenda"}</button>
      </form>
      {error && <p role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
      {loaded && <p className="text-sm text-slate-600">{contacts.length} contactos mostrados</p>}
      <div className="space-y-2">
        {contacts.map(person => (
          <article key={person.id} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="font-semibold text-slate-900">{person.name}</p>
            {person.company && <p className="text-sm text-slate-600">{person.company}</p>}
            {person.email && <p className="text-sm text-slate-600">{person.email}</p>}
            {person.phone && <p className="text-sm text-slate-600">{person.phone}</p>}
          </article>
        ))}
      </div>
      {nextPageToken && <button disabled={loading} type="button" onClick={() => void loadContacts(true)} className="rounded-lg border border-indigo-600 px-4 py-2 text-sm text-indigo-700 disabled:opacity-50">Cargar más contactos</button>}
    </main>
  );
}
