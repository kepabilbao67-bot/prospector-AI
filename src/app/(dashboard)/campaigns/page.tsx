"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  network: string;
  status: string;
  stats: string;
  settings: string;
  steps: { id: string; order: number; type: string; network: string; delayHours: number }[];
  campaignContacts: { id: string }[];
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", twitter: "Twitter", instagram: "Instagram",
  email: "Email", whatsapp: "WhatsApp", multi: "Multi-canal",
};

const statusLabels: Record<string, string> = {
  draft: "Borrador", active: "Activa", paused: "Pausada", completed: "Completada",
};

const stepLabels: Record<string, string> = {
  visit_profile: "Visitar perfil", connection_request: "Solicitud conexión",
  message: "Mensaje", follow: "Seguir", like: "Like", wait: "Esperar", condition: "Condición",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadCampaigns() {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch { setCampaigns([]); }
    setLoading(false);
  }

  useEffect(() => { loadCampaigns(); }, []);

  async function toggleStatus(campaign: Campaign) {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    try {
      await fetch(`/api/campaigns/${campaign.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
    } catch { /* fallback */ }
    setCampaigns(campaigns.map(c => c.id === campaign.id ? { ...c, status: newStatus } : c));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Campañas</h1>
          <p className="text-xs text-gray-500">{campaigns.length} campañas</p>
        </div>
        <Link href="/wizard" className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800">
          Nueva campaña
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500 mb-3">No tienes campañas todavía</p>
          <Link href="/wizard" className="text-sm text-blue-600 font-medium">Crear una con el asistente IA</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => {
            const stats = JSON.parse(campaign.stats || "{}");
            return (
              <div key={campaign.id} className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                    {campaign.description && <p className="text-xs text-gray-500 mt-0.5">{campaign.description}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        campaign.status === "active" ? "bg-green-50 text-green-700" :
                        campaign.status === "paused" ? "bg-yellow-50 text-yellow-700" :
                        "bg-gray-50 text-gray-600"
                      }`}>
                        {statusLabels[campaign.status] || campaign.status}
                      </span>
                      <span className="text-xs text-gray-400">{networkLabels[campaign.network] || campaign.network}</span>
                      <span className="text-xs text-gray-400">{campaign.steps?.length || 0} pasos</span>
                    </div>
                  </div>
                  <button onClick={() => toggleStatus(campaign)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                      campaign.status === "active"
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}>
                    {campaign.status === "active" ? "Pausar" : "Activar"}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{stats.sent || 0}</p>
                    <p className="text-[11px] text-gray-500">Enviados</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{stats.replied || 0}</p>
                    <p className="text-[11px] text-gray-500">Respuestas</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{stats.converted || 0}</p>
                    <p className="text-[11px] text-gray-500">Conversiones</p>
                  </div>
                </div>

                {/* Steps preview */}
                {campaign.steps && campaign.steps.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                      {campaign.steps.map((step, i) => (
                        <div key={step.id} className="flex items-center gap-1 shrink-0">
                          <span className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-[10px] text-gray-600">
                            {stepLabels[step.type] || step.type}
                          </span>
                          {i < campaign.steps.length - 1 && <span className="text-gray-300 text-[10px]">→</span>}
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
    </div>
  );
}
