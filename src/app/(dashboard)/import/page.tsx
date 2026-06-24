"use client";

import { useState } from "react";

export default function ImportPage() {
  const [csvContent, setCsvContent] = useState("");
  const [parsed, setParsed] = useState<{ contacts: Record<string, string>[]; errors: string[]; columns: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCsvContent(ev.target?.result as string);
    reader.readAsText(file);
  }

  async function parseCSV() {
    const res = await fetch("/api/smart", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "parse_csv", csvContent }),
    });
    setParsed(await res.json());
  }

  async function importContacts() {
    if (!parsed) return;
    setImporting(true);
    let count = 0;
    for (const contact of parsed.contacts) {
      await fetch("/api/contacts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: contact.firstName || "Unknown", lastName: contact.lastName || "", email: contact.email || "", company: contact.company || "", jobTitle: contact.jobTitle || "", network: contact.network || "other" }),
      });
      count++;
      setImported(count);
    }
    setImporting(false);
    alert(`${count} contactos importados`);
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Importar contactos</h1>
        <p className="text-xs text-gray-500">Sube un archivo CSV o pega los datos</p>
      </div>

      {/* Upload */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
        <p className="text-sm text-gray-500 mb-3">Arrastra un CSV aquí o selecciona un archivo</p>
        <label className="cursor-pointer">
          <input type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
          <span className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Seleccionar archivo</span>
        </label>
      </div>

      {/* Textarea */}
      <div>
        <label className="text-xs font-medium text-gray-700 block mb-1.5">O pega tu CSV:</label>
        <textarea value={csvContent} onChange={(e) => setCsvContent(e.target.value)} rows={5}
          placeholder="nombre,apellido,email,empresa,cargo,red&#10;Carlos,García,carlos@tech.com,TechCorp,CEO,linkedin"
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-gray-900" />
      </div>

      {csvContent && !parsed && (
        <button onClick={parseCSV} className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">Analizar CSV</button>
      )}

      {/* Results */}
      {parsed && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium text-green-800">{parsed.contacts.length} contactos detectados</p>
            {parsed.errors.length > 0 && <p className="text-xs text-orange-600 mt-0.5">{parsed.errors.length} filas con errores</p>}
          </div>

          {/* Preview */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-[11px] font-medium text-gray-500">Vista previa</div>
            <div className="divide-y divide-gray-50">
              {parsed.contacts.slice(0, 5).map((c, i) => (
                <div key={i} className="px-4 py-2 text-sm text-gray-700">{c.firstName} {c.lastName} · {c.email} · {c.company}</div>
              ))}
            </div>
          </div>

          <button onClick={importContacts} disabled={importing} className="w-full py-3 bg-gray-900 text-white rounded-lg text-sm font-medium disabled:opacity-50">
            {importing ? `Importando ${imported}/${parsed.contacts.length}...` : `Importar ${parsed.contacts.length} contactos`}
          </button>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-700 mb-1">Formatos aceptados</p>
        <p className="text-[11px] text-gray-500">CSV con columnas: nombre, apellido, email, empresa, cargo, red. Acepta columnas en español e inglés. Compatible con exportaciones de LinkedIn.</p>
      </div>
    </div>
  );
}
