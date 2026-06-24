"use client";

import { useEffect, useState } from "react";

interface Template {
  id: string;
  name: string;
  network: string;
  type: string;
  subject: string | null;
  content: string;
  variables: string;
  usageCount: number;
  replyRate: number;
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", twitter: "Twitter", instagram: "Instagram", email: "Email",
};

const typeLabels: Record<string, string> = {
  message: "Mensaje", connection_request: "Conexión", email: "Email", comment: "Comentario",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);
  const [filterNetwork, setFilterNetwork] = useState("all");

  async function loadTemplates() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterNetwork !== "all") params.set("network", filterNetwork);
      const res = await fetch(`/api/templates?${params.toString()}`);
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch { setTemplates([]); }
    setLoading(false);
  }

  useEffect(() => { loadTemplates(); }, [filterNetwork]);

  async function createTemplate(formData: FormData) {
    await fetch("/api/templates", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formData.get("name"), network: formData.get("network"), type: formData.get("type"), subject: formData.get("subject") || null, content: formData.get("content") }),
    });
    setShowCreate(false);
    loadTemplates();
  }

  // Preview with sample data
  function previewContent(content: string): string {
    return content
      .replace(/\{\{firstName\}\}/g, "Carlos")
      .replace(/\{\{lastName\}\}/g, "García")
      .replace(/\{\{company\}\}/g, "TechCorp")
      .replace(/\{\{jobTitle\}\}/g, "CEO");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Templates</h1>
          <p className="text-xs text-gray-500">{templates.length} plantillas</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">
          Nuevo template
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["all", "linkedin", "fiverr", "twitter", "instagram", "email"].map((n) => (
          <button key={n} onClick={() => setFilterNetwork(n)}
            className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium ${filterNetwork === n ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
            {n === "all" ? "Todos" : networkLabels[n]}
          </button>
        ))}
      </div>

      {/* Templates */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">No hay templates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((t) => (
            <button key={t.id} onClick={() => setSelected(t)}
              className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{networkLabels[t.network]} · {typeLabels[t.type] || t.type}</span>
                <span className="text-[10px] text-gray-400">{t.replyRate}% resp.</span>
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-1.5">{t.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{t.content}</p>
              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-50">
                <span className="text-[10px] text-gray-400">Usado {t.usageCount}x</span>
                {JSON.parse(t.variables || "[]").length > 0 && (
                  <span className="text-[10px] text-gray-400">{JSON.parse(t.variables).length} variables</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2 text-xs text-gray-500">
                <span>{networkLabels[selected.network]}</span>
                <span>·</span>
                <span>{typeLabels[selected.type] || selected.type}</span>
                <span>·</span>
                <span>{selected.replyRate}% respuesta</span>
              </div>
              {selected.subject && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[11px] text-gray-500 mb-0.5">Asunto:</p>
                  <p className="text-sm text-gray-900">{previewContent(selected.subject)}</p>
                </div>
              )}
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Vista previa:</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{previewContent(selected.content)}</p>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-gray-500 mb-1">Plantilla original:</p>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 font-mono whitespace-pre-wrap">{selected.content}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Nuevo template</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createTemplate(new FormData(e.currentTarget)); }} className="space-y-3">
              <input name="name" required placeholder="Nombre del template" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <div className="grid grid-cols-2 gap-2">
                <select name="network" required className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="linkedin">LinkedIn</option>
                  <option value="fiverr">Fiverr</option>
                  <option value="twitter">Twitter</option>
                  <option value="instagram">Instagram</option>
                  <option value="email">Email</option>
                </select>
                <select name="type" required className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="message">Mensaje</option>
                  <option value="connection_request">Conexión</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <input name="subject" placeholder="Asunto (para emails)" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <textarea name="content" required rows={5} placeholder="Contenido... Usa {{firstName}}, {{company}}, {{jobTitle}}"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-gray-900" />
              <p className="text-[10px] text-gray-400">Variables: {"{{firstName}}, {{lastName}}, {{company}}, {{jobTitle}}"}</p>
              <button type="submit" className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">Crear</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
