"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function BuscarEmpresasPage() {
  const [sector, setSector] = useState("administradores de fincas");
  const [zona, setZona] = useState("Bilbao, Bizkaia");
  const [mensaje, setMensaje] = useState("Hola, he visto vuestra empresa y me gustaría presentaros una solución para digitalizar y simplificar la gestión de clientes y documentos. ¿Os vendría bien una breve conversación?");
  const [estado, setEstado] = useState("");

  const busqueda = useMemo(() => [sector.trim(), zona.trim()].filter(Boolean).join(" "), [sector, zona]);
  const lista = [
    { titulo: "Google Maps", url: "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(busqueda) },
    { titulo: "LinkedIn (búsqueda de empresas)", url: "https://www.linkedin.com/search/results/companies/?keywords=" + encodeURIComponent(busqueda) },
    { titulo: "Google (webs oficiales)", url: "https://www.google.com/search?q=" + encodeURIComponent(busqueda + " empresa contacto") },
  ];

  function escuchar() {
    if (!("speechSynthesis" in window)) { setEstado("Este navegador no admite lectura de voz."); return; }
    window.speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(mensaje);
    voz.lang = "es-ES";
    window.speechSynthesis.speak(voz);
    setEstado("Leyendo el borrador. No se ha enviado.");
  }

  async function copiar() {
    try { await navigator.clipboard.writeText(mensaje); setEstado("Borrador copiado. Ningún mensaje enviado."); }
    catch { setEstado("No se pudo copiar automáticamente. Selecciona el texto para copiarlo."); }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Buscar empresas</h1>
        <p className="mt-2 text-sm text-gray-600">Encuentra empresas reales, consulta sus datos en la fuente original y prepara un primer contacto. Sin extracción ni envío automático.</p>
      </div>
      <div className="grid gap-4 rounded-xl border bg-white p-5 sm:grid-cols-2">
        <label className="text-sm font-medium">Sector
          <input value={sector} onChange={(e) => setSector(e.target.value)} maxLength={100} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" placeholder="Ej. administradores de fincas" />
        </label>
        <label className="text-sm font-medium">Zona
          <input value={zona} onChange={(e) => setZona(e.target.value)} maxLength={100} className="mt-2 w-full rounded-lg border px-3 py-2 font-normal" placeholder="Ej. Bilbao, Bizkaia" />
        </label>
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          {lista.map((item) => (
            <a key={item.titulo} href={item.url} target="_blank" rel="noopener noreferrer" aria-disabled={!busqueda} className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700">{item.titulo} ↗</a>
          ))}
        </div>
      </div>
      <div className="space-y-3 rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Preparar mensaje (borrador local)</h2>
        <label className="block text-sm text-gray-600" htmlFor="borrador-prospector">Edita el texto antes de contactar a alguien</label>
        <textarea id="borrador-prospector" rows={5} value={mensaje} onChange={e => setMensaje(e.target.value)} className="w-full rounded-lg border p-3 text-sm" />
        <div className="flex flex-wrap gap-2">
          <button onClick={copiar} className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white">Copiar borrador</button>
          <button onClick={escuchar} className="rounded-lg border px-4 py-2 text-sm">Escuchar</button>
          <button onClick={() => { if ("speechSynthesis" in window) window.speechSynthesis.cancel(); setEstado("Lectura detenida."); }} className="rounded-lg border px-4 py-2 text-sm">Detener voz</button>
          <Link href="/contacts" className="rounded-lg border px-4 py-2 text-sm">Abrir CRM</Link>
        </div>
        <p role="status" className="text-xs text-gray-600">{estado}</p>
        <p className="text-xs text-gray-500">El texto no se guarda en la base de datos. Ninguna acción envía mensajes. La lectura utiliza el motor del navegador, no Gemini ni KEPA VOZ 360.</p>
      </div>
    </section>
  );
}
