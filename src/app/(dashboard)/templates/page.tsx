"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNetworkIcon, parseTemplate } from "@/lib/utils";

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
  createdAt: string;
}

const sampleVariables: Record<string, string> = {
  firstName: "Carlos",
  lastName: "García",
  company: "TechCorp",
  jobTitle: "CEO",
  city: "Madrid",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [filterNetwork, setFilterNetwork] = useState("all");

  async function loadTemplates() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterNetwork !== "all") params.set("network", filterNetwork);

    const res = await fetch(`/api/templates?${params.toString()}`);
    const data = await res.json();
    setTemplates(data.templates || []);
    setLoading(false);
  }

  useEffect(() => {
    loadTemplates();
  }, [filterNetwork]);

  async function createTemplate(formData: FormData) {
    const template = {
      name: formData.get("name"),
      network: formData.get("network"),
      type: formData.get("type"),
      subject: formData.get("subject") || null,
      content: formData.get("content"),
    };

    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    });

    setShowCreate(false);
    loadTemplates();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="text-gray-500 mt-1">Mensajes personalizables con variables dinámicas</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Nuevo Template</Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "linkedin", "fiverr", "twitter", "instagram", "email"].map((network) => (
          <button
            key={network}
            onClick={() => setFilterNetwork(network)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterNetwork === network
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {network === "all" ? "Todos" : `${getNetworkIcon(network)} ${network}`}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-4">📝</p>
          <p className="text-gray-500">No tienes templates aún. Crea tu primer template.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const variables = JSON.parse(template.variables || "[]");
            return (
              <div
                key={template.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setPreviewTemplate(template)}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{getNetworkIcon(template.network)}</span>
                  <Badge className="bg-gray-100 text-gray-700">{template.type}</Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-3">{template.content}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {variables.map((v: string) => (
                    <span key={v} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                  <span>Usado {template.usageCount}x</span>
                  <span>{template.replyRate}% respuesta</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Nuevo Template</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTemplate(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input name="name" required className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: LinkedIn Primer Contacto" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Red *</label>
                  <select name="network" required className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="linkedin">LinkedIn</option>
                    <option value="fiverr">Fiverr</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select name="type" required className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="message">Mensaje</option>
                    <option value="connection_request">Solicitud de Conexión</option>
                    <option value="email">Email</option>
                    <option value="comment">Comentario</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto (para emails)</label>
                <input name="subject" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="{{firstName}}, una idea para {{company}}" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenido *</label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  placeholder="Hola {{firstName}}, vi tu perfil en {{company}}..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Variables disponibles: {`{{firstName}}, {{lastName}}, {{company}}, {{jobTitle}}, {{city}}`}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit">Crear Template</Button>
                <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Vista Previa</h2>
              <button onClick={() => setPreviewTemplate(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getNetworkIcon(previewTemplate.network)}</span>
                <span className="font-medium">{previewTemplate.name}</span>
              </div>
              {previewTemplate.subject && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Asunto:</p>
                  <p className="text-sm font-medium">{parseTemplate(previewTemplate.subject, sampleVariables)}</p>
                </div>
              )}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <p className="text-xs text-blue-600 mb-2">Mensaje (con variables reemplazadas):</p>
                <p className="text-sm whitespace-pre-wrap">{parseTemplate(previewTemplate.content, sampleVariables)}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Plantilla original:</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap font-mono">{previewTemplate.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
