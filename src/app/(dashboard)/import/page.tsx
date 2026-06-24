"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ImportPage() {
  const [csvContent, setCsvContent] = useState("");
  const [parsed, setParsed] = useState<{ contacts: Record<string, string>[]; errors: string[]; columns: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
    };
    reader.readAsText(file);
  }

  async function parseCSV() {
    const res = await fetch("/api/smart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "parse_csv", csvContent }),
    });
    const data = await res.json();
    setParsed(data);
  }

  async function importContacts() {
    if (!parsed) return;
    setImporting(true);
    let count = 0;

    for (const contact of parsed.contacts) {
      await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: contact.firstName || contact.nombre || "Unknown",
          lastName: contact.lastName || contact.apellido || "",
          email: contact.email || contact.correo || "",
          company: contact.company || contact.empresa || "",
          jobTitle: contact.jobTitle || contact.cargo || "",
          network: contact.network || "other",
          profileUrl: contact.profileUrl || contact.url || "",
          notes: contact.notes || "",
        }),
      });
      count++;
      setImported(count);
    }

    setImporting(false);
    alert(`¡${count} contactos importados exitosamente! 🎉`);
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Importar Contactos</h1>
        <p className="text-xs text-gray-500 mt-1">Sube un CSV o pega los datos directamente</p>
      </div>

      {/* Upload method */}
      <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
        <p className="text-4xl mb-3">📄</p>
        <p className="font-medium text-gray-900 mb-2">Arrastra un archivo CSV aquí</p>
        <p className="text-xs text-gray-500 mb-4">o</p>
        <label className="cursor-pointer">
          <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          <span className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">Seleccionar archivo</span>
        </label>
      </div>

      {/* Or paste */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-2 block">O pega tu CSV aquí:</label>
        <textarea
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          placeholder={`nombre,apellido,email,empresa,cargo,red\nCarlos,García,carlos@techcorp.com,TechCorp,CEO,linkedin\nAna,Martínez,ana@ecommerce.com,EcommerceMax,CMO,instagram`}
          rows={6}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono"
        />
      </div>

      {csvContent && !parsed && (
        <Button onClick={parseCSV} className="w-full py-3">🔍 Analizar CSV</Button>
      )}

      {/* Preview */}
      {parsed && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="font-medium text-green-900">✅ {parsed.contacts.length} contactos detectados</p>
            {parsed.errors.length > 0 && (
              <p className="text-xs text-orange-600 mt-1">⚠️ {parsed.errors.length} filas con errores</p>
            )}
          </div>

          {/* Columns detected */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Columnas detectadas:</p>
            <div className="flex flex-wrap gap-2">
              {parsed.columns.map(col => (
                <span key={col} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">{col}</span>
              ))}
            </div>
          </div>

          {/* Preview table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-medium">Vista previa (primeros 5)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Empresa</th>
                    <th className="px-3 py-2 text-left">Red</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {parsed.contacts.slice(0, 5).map((c, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2">{c.firstName} {c.lastName}</td>
                      <td className="px-3 py-2">{c.email}</td>
                      <td className="px-3 py-2">{c.company}</td>
                      <td className="px-3 py-2">{c.network || "other"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Errors */}
          {parsed.errors.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm font-medium text-orange-900 mb-2">⚠️ Errores:</p>
              {parsed.errors.slice(0, 5).map((err, i) => (
                <p key={i} className="text-xs text-orange-700">• {err}</p>
              ))}
            </div>
          )}

          {/* Import button */}
          <Button onClick={importContacts} disabled={importing} className="w-full py-4 text-base">
            {importing ? `Importando... ${imported}/${parsed.contacts.length}` : `📥 Importar ${parsed.contacts.length} contactos`}
          </Button>
        </div>
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Formatos aceptados</h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p>• <strong>LinkedIn:</strong> Exporta desde Sales Navigator o My Network → Connections</p>
          <p>• <strong>Excel/Google Sheets:</strong> Guarda como CSV (separado por comas)</p>
          <p>• <strong>Columnas:</strong> nombre, apellido, email, empresa, cargo, red, url</p>
          <p>• <strong>Idiomas:</strong> Acepta columnas en español e inglés automáticamente</p>
        </div>
      </div>
    </div>
  );
}
