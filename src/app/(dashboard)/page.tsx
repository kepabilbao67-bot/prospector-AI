"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Campaign {
  id: string;
  name: string;
  network: string;
  status: string;
  stats: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string | null;
  network: string;
  status: string;
  company: string | null;
}

interface AnalyticsData {
  stats: { messagesSent: number; repliesReceived: number; connectionsAccepted: number; conversions: number };
  replyRate: string;
  conversionRate: string;
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  fiverr: "Fiverr",
  twitter: "Twitter",
  instagram: "Instagram",
  email: "Email",
  whatsapp: "WhatsApp",
  tiktok: "TikTok",
  facebook: "Facebook",
};

const statusLabels: Record<string, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  replied: "Respondido",
  qualified: "Calificado",
  converted: "Convertido",
  lost: "Perdido",
  active: "Activa",
  paused: "Pausada",
  draft: "Borrador",
  completed: "Completada",
};

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [hasData, setHasData] = useState(false);

  async function seedData() {
    setSeeding(true);
    try {
      await fetch("/api/seed", { method: "POST" });
      setHasData(true);
      await loadData();
    } catch (e) {
      console.error(e);
    }
    setSeeding(false);
  }

  async function loadData() {
    try {
      const [c, co, a] = await Promise.all([
        fetch("/api/campaigns").then((r) => r.json()).catch(() => ({ campaigns: [] })),
        fetch("/api/contacts?limit=5").then((r) => r.json()).catch(() => ({ contacts: [] })),
        fetch("/api/analytics?days=7").then((r) => r.json()).catch(() => null),
      ]);
      setCampaigns(c.campaigns || []);
      setContacts(co.contacts || []);
      setAnalytics(a);
      if ((c.campaigns || []).length > 0 || (co.contacts || []).length > 0) {
        setHasData(true);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6 px-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Bienvenido a ProspectorAI
        </h2>
        <p className="text-gray-500 text-center text-sm leading-relaxed">
          Plataforma de captación de clientes con inteligencia artificial.
          Automatiza tu prospección en todas las redes sociales.
        </p>
        <button
          onClick={seedData}
          disabled={seeding}
          className="w-full px-6 py-3.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {seeding ? "Configurando..." : "Inicializar plataforma"}
        </button>
        <p className="text-xs text-gray-400 text-center">
          Esto cargará datos de ejemplo para que explores la herramienta.
        </p>
      </div>
    );
  }

  const stats = analytics?.stats;

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Mensajes enviados", value: stats?.messagesSent || 0, sub: "Últimos 7 días" },
          { label: "Respuestas", value: stats?.repliesReceived || 0, sub: `${analytics?.replyRate || 0}% tasa` },
          { label: "Conexiones", value: stats?.connectionsAccepted || 0, sub: "Aceptadas" },
          { label: "Conversiones", value: stats?.conversions || 0, sub: `${analytics?.conversionRate || 0}% tasa` },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Link href="/wizard" className="flex items-center gap-3 p-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <p className="font-medium text-sm">Nueva campaña con IA</p>
            <p className="text-xs text-gray-400">Configuración guiada en 4 pasos</p>
          </div>
        </Link>
        <Link href="/contacts" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">Gestionar contactos</p>
            <p className="text-xs text-gray-500">CRM multi-red</p>
          </div>
        </Link>
        <Link href="/pipeline" className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <p className="font-medium text-sm text-gray-900">Pipeline de ventas</p>
            <p className="text-xs text-gray-500">Kanban visual</p>
          </div>
        </Link>
      </div>

      {/* Campaigns */}
      {campaigns.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Campañas</h2>
            <Link href="/campaigns" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Ver todas</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {campaigns.slice(0, 4).map((campaign) => {
              const s = JSON.parse(campaign.stats || "{}");
              return (
                <div key={campaign.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                      <p className="text-xs text-gray-500">
                        {networkLabels[campaign.network] || campaign.network} &middot; {statusLabels[campaign.status] || campaign.status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-medium text-gray-900">{s.sent || 0} enviados</p>
                    <p className="text-gray-500">{s.replied || 0} respuestas</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent contacts */}
      {contacts.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Leads recientes</h2>
            <Link href="/contacts" className="text-xs text-blue-600 hover:text-blue-700 font-medium">Ver todos</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {contacts.map((contact) => (
              <div key={contact.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {contact.firstName[0]}{contact.lastName?.[0] || ""}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contact.firstName} {contact.lastName}</p>
                    <p className="text-xs text-gray-500">{contact.company || "Sin empresa"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{networkLabels[contact.network]}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                    contact.status === "converted" ? "bg-green-50 text-green-700" :
                    contact.status === "replied" ? "bg-blue-50 text-blue-700" :
                    contact.status === "qualified" ? "bg-purple-50 text-purple-700" :
                    "bg-gray-50 text-gray-600"
                  }`}>
                    {statusLabels[contact.status] || contact.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
