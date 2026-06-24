"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getNetworkIcon } from "@/lib/utils";

interface CampaignStep {
  id: string;
  order: number;
  type: string;
  network: string;
  delayHours: number;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  network: string;
  status: string;
  stats: string;
  settings: string;
  steps: CampaignStep[];
  campaignContacts: { id: string }[];
  createdAt: string;
}

const stepTypeLabels: Record<string, string> = {
  visit_profile: "👁️ Visitar Perfil",
  connection_request: "🤝 Solicitud de Conexión",
  message: "💬 Enviar Mensaje",
  follow: "➕ Seguir",
  like: "❤️ Like",
  wait: "⏳ Esperar",
  condition: "🔀 Condición",
  email: "📧 Email",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  async function loadCampaigns() {
    setLoading(true);
    const res = await fetch("/api/campaigns");
    const data = await res.json();
    setCampaigns(data.campaigns || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function createCampaign(formData: FormData) {
    const campaign = {
      name: formData.get("name"),
      description: formData.get("description"),
      network: formData.get("network"),
      settings: {
        dailyLimit: parseInt(formData.get("dailyLimit") as string) || 30,
        startHour: parseInt(formData.get("startHour") as string) || 9,
        endHour: parseInt(formData.get("endHour") as string) || 18,
      },
    };

    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(campaign),
    });

    setShowCreate(false);
    loadCampaigns();
  }

  async function toggleCampaignStatus(campaign: Campaign) {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadCampaigns();
  }

  async function deleteCampaign(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta campaña?")) return;
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    loadCampaigns();
    setSelectedCampaign(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campañas</h1>
          <p className="text-gray-500 mt-1">Secuencias automatizadas de prospección</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>+ Nueva Campaña</Button>
      </div>

      {/* Campaign List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-4">🚀</p>
          <p className="text-gray-500">No tienes campañas aún. Crea tu primera campaña.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => {
            const stats = JSON.parse(campaign.stats || "{}");
            const settings = JSON.parse(campaign.settings || "{}");
            return (
              <div
                key={campaign.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedCampaign(campaign)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{getNetworkIcon(campaign.network)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{campaign.name}</h3>
                      <p className="text-sm text-gray-500">{campaign.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                        <span className="text-xs text-gray-400">
                          {campaign.steps?.length || 0} pasos • {campaign.campaignContacts?.length || 0} contactos • Límite: {settings.dailyLimit}/día
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stats.sent || 0}</p>
                        <p className="text-xs text-gray-500">Enviados</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{stats.replied || 0}</p>
                        <p className="text-xs text-gray-500">Respuestas</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{stats.converted || 0}</p>
                        <p className="text-xs text-gray-500">Convertidos</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 justify-end">
                      <Button
                        size="sm"
                        variant={campaign.status === "active" ? "outline" : "primary"}
                        onClick={(e) => { e.stopPropagation(); toggleCampaignStatus(campaign); }}
                      >
                        {campaign.status === "active" ? "⏸ Pausar" : "▶ Activar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => { e.stopPropagation(); deleteCampaign(campaign.id); }}
                      >
                        🗑️
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Steps preview */}
                {campaign.steps && campaign.steps.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {campaign.steps.map((step, i) => (
                        <div key={step.id} className="flex items-center gap-1 shrink-0">
                          <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium">
                            {stepTypeLabels[step.type] || step.type}
                          </div>
                          {i < campaign.steps.length - 1 && (
                            <span className="text-gray-300 text-xs">→ {step.delayHours}h →</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Nueva Campaña</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createCampaign(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input name="name" required className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: LinkedIn Cold Outreach Q1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea name="description" rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Describe el objetivo de esta campaña..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Red Principal *</label>
                  <select name="network" required className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="linkedin">LinkedIn</option>
                    <option value="fiverr">Fiverr</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="email">Email</option>
                    <option value="multi">Multi-canal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Límite Diario</label>
                  <input name="dailyLimit" type="number" defaultValue={30} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                  <input name="startHour" type="number" min={0} max={23} defaultValue={9} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                  <input name="endHour" type="number" min={0} max={23} defaultValue={18} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit">Crear Campaña</Button>
                <Button variant="secondary" type="button" onClick={() => setShowCreate(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{selectedCampaign.name}</h2>
              <button onClick={() => setSelectedCampaign(null)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getNetworkIcon(selectedCampaign.network)}</span>
                <Badge variant={getStatusColor(selectedCampaign.status)}>{selectedCampaign.status}</Badge>
                <span className="text-sm text-gray-500">{selectedCampaign.description}</span>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Secuencia de Pasos</h3>
                <div className="space-y-3">
                  {selectedCampaign.steps?.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-medium text-sm">{stepTypeLabels[step.type] || step.type}</p>
                        {step.delayHours > 0 && (
                          <p className="text-xs text-gray-500 mt-1">Esperar {step.delayHours}h antes del siguiente paso</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
