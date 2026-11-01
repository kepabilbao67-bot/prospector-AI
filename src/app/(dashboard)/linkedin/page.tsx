"use client";

import { useState } from "react";
import Link from "next/link";

export default function LinkedInProspectingPage() {
  const [sector, setSector] = useState("administradores de fincas");
  const [product, setProduct] = useState("Fincas 360");
  const [location, setLocation] = useState("Bizkaia");
  const [municipality, setMunicipality] = useState("Toda Bizkaia");
  const [keyword, setKeyword] = useState("");
  const [lead, setLead] = useState({ firstName: "", company: "", jobTitle: "", email: "", profileUrl: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState("");
  async function saveLead(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lead.firstName.trim() && !lead.company.trim()) return;
    setSaving(true); setResult("");
    try {
      const response = await fetch("/api/contacts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...lead, firstName: lead.firstName.trim() || lead.company.trim(), network: "linkedin", tags: ["prospeccion", product, sector.trim(), location.trim()].filter(Boolean) }) });
      if (response.status === 409) { setResult("Este contacto ya existe en el CRM. No se ha duplicado."); return; }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setResult("Contacto guardado. Compruébalo en el CRM.");
      setLead({ firstName: "", company: "", jobTitle: "", email: "", profileUrl: "", notes: "" });
    } catch { setResult("No se pudo guardar el contacto. No se ha confirmado el registro."); }
    finally { setSaving(false); }
  }
  const zone = municipality === "Toda Bizkaia" ? location.trim() : `${municipality} ${location.trim()}`;
  const query = [sector.trim(), keyword.trim(), zone].filter(Boolean).join(" ");
  const googleQuery = [sector.trim(), keyword.trim(), zone, "-site:linkedin.com"].filter(Boolean).join(" ");
  const googleUrl = "https://www.google.com/search?q=" + encodeURIComponent(googleQuery);
  const searchUrl = "https://www.linkedin.com/search/results/companies/?keywords=" + encodeURIComponent(query);
  const peopleUrl = "https://www.linkedin.com/search/results/people/?keywords=" + encodeURIComponent(query);
  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Prospección en LinkedIn</h1>
        <p className="mt-2 text-sm text-gray-600">Busca empresas y responsables comerciales en LinkedIn. La búsqueda se abre en LinkedIn; esta pantalla no extrae perfiles ni envía mensajes automáticamente.</p>
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Búsquedas comerciales rápidas">
        {[
          { label: "Fincas 360", sector: "administradores de fincas" },
          { label: "Llamadas 360", sector: "clínicas y empresas de servicios" },
          { label: "Electricista 360", sector: "instaladores eléctricos" },
          { label: "Autónomo 360", sector: "asesorías y gestorías" },
        ].map(item => (
          <button key={item.label} type="button" onClick={() => { setSector(item.sector); setProduct(item.label); }} className="rounded-full border border-gray-300 bg-white px-3 py-2 text-sm hover:border-blue-600">{item.label}</button>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <label className="block text-sm font-medium">Sector o tipo de cliente
          <input className="mt-1 w-full rounded-lg border border-gray-300 p-2.5" value={sector} onChange={e => setSector(e.target.value)} placeholder="Ej. administradores de fincas" />
        </label>
        <label className="block text-sm font-medium">Zona
          <input className="mt-1 w-full rounded-lg border border-gray-300 p-2.5" value={location} onChange={e => setLocation(e.target.value)} placeholder="Ej. Bilbao, Bizkaia" />
        </label>
        <label className="block text-sm font-medium">Municipio
          <select className="mt-1 w-full rounded-lg border border-gray-300 p-2.5" value={municipality} onChange={e => setMunicipality(e.target.value)}>
            {["Toda Bizkaia", "Bilbao", "Barakaldo", "Getxo", "Portugalete", "Santurtzi", "Basauri", "Leioa", "Durango", "Gernika-Lumo", "Sestao", "Erandio"].map(city => <option key={city}>{city}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Palabras clave adicionales
          <input className="mt-1 w-full rounded-lg border border-gray-300 p-2.5" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Ej. comunidades de propietarios, mantenimiento, seguros" />
        </label>
        <p className="text-xs text-gray-500">Estas opciones preparan búsquedas externas; los resultados y los filtros finales dependen de LinkedIn o Google.</p>
        <div className="flex flex-wrap gap-3">
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white">Buscar múltiples empresas en Google</a>
          <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white">Buscar empresas en LinkedIn</a>
          <a href={peopleUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-blue-700 px-4 py-2.5 text-sm font-medium text-blue-700">Buscar responsables</a>
        </div>
      </div>
      <form onSubmit={saveLead} className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold">Registrar oportunidad en el CRM</h2>
        <p className="text-sm text-gray-600">Después de localizar una empresa, copia aquí sus datos públicos. Se guarda como contacto de LinkedIn.</p>
        {([["firstName", "Responsable o nombre de contacto"], ["company", "Empresa"], ["jobTitle", "Cargo"], ["email", "Correo"], ["profileUrl", "URL de LinkedIn"], ["notes", "Notas y producto 360 recomendado"]] as const).map(([key, label]) => (
          <label key={key} className="block text-sm">{label}<input value={lead[key]} onChange={e => setLead(v => ({ ...v, [key]: e.target.value }))} type={key === "email" ? "email" : key === "profileUrl" ? "url" : "text"} className="mt-1 w-full rounded-lg border border-gray-300 p-2" /></label>
        ))}
        <button type="submit" disabled={saving || (!lead.firstName.trim() && !lead.company.trim())} className="rounded-lg bg-indigo-700 px-4 py-2 text-white disabled:opacity-40">{saving ? "Guardando..." : "Guardar en CRM"}</button>
        {result && <p role="status" className="text-sm">{result}</p>}
      </form>
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <h2 className="font-semibold">Guardar oportunidades en Prospecto IA</h2>
        <p className="text-sm text-gray-600">Cuando encuentres una empresa, guarda su nombre, responsable y enlace de LinkedIn en Contactos. Si tienes un CSV obtenido legítimamente, utiliza Importar. No se sincroniza tu cuenta de LinkedIn automáticamente.</p>
        <div className="flex gap-4 text-sm font-medium text-blue-700"><Link href="/contacts">Abrir CRM</Link><Link href="/import">Importar CSV</Link></div>
      </div>
    </div>
  );
}
