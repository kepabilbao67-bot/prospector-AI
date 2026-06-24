"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, getNetworkIcon } from "@/lib/utils";

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

export default function DashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  async function seedData() {
    await fetch("/api/seed", { method: "POST" });
    loadData();
  }

  async function loadData() {
    try {
      const [c, co, a] = await Promise.all([
        fetch("/api/campaigns").then((r) => r.json()),
        fetch("/api/contacts?limit=5").then((r) => r.json()),
        fetch("/api/analytics?days=7").then((r) => r.json()),
      ]);
      setCampaigns(c.campaigns || []);
      setContacts(co.contacts || []);
      setAnalytics(a);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (campaigns.length === 0 && contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-5 px-4">
        <div className="text-6xl animate-bounce">🚀</div>
        <h2 className="text-2xl font-bold text-gray-900 text-center">¡Bienvenido a ProspectorAI!</h2>
        <p className="text-gray-500 text-center max-w-sm text-sm">
          Tu herramienta de captación de clientes con IA para todas las redes sociales
        </p>
        <button onClick={seedData} className="w-full max-w-xs px-6 py-4 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200">
          🌱 Cargar Datos de Demo
        </button>
      </div>
    );
  }

  const stats = analytics?.stats;

  return (
    <div className="space-y-5">
      {/* Stats cards - horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 scrollbar-hide">
        {[
          { label: "Enviados", value: stats?.messagesSent || 0, icon: "📨", color: "from-blue-500 to-blue-600" },
          { label: "Respuestas", value: stats?.repliesReceived || 0, icon: "💬", color: "from-green-500 to-green-600" },
          { label: "Conexiones", value: stats?.connectionsAccepted || 0, icon: "🤝", color: "from-purple-500 to-purple-600" },
          { label: "Ventas", value: stats?.conversions || 0, icon: "🎯", color: "from-orange-500 to-orange-600" },
        ].map((s) => (
          <div key={s.label} className={`min-w-[140px] md:min-w-0 bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white shadow-lg`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs opacity-70">7d</span>
            </div>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Quick Actions */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">✨</span>
          <h3 className="font-bold">IA ProspectorAI</h3>
        </div>
        <p className="text-sm opacity-90 mb-4">Crea campañas de captación en segundos con IA</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/wizard" className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center active:scale-95 transition-all hover:bg-white/30">
            <p className="text-lg mb-1">🚀</p>
            <p className="text-xs font-medium">Nueva Campaña IA</p>
          </Link>
          <Link href="/wizard?mode=message" className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center active:scale-95 transition-all hover:bg-white/30">
            <p className="text-lg mb-1">💬</p>
            <p className="text-xs font-medium">Generar Mensaje</p>
          </Link>
        </div>
      </div>

      {/* Active Campaigns */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Campañas Activas</h2>
          <Link href="/campaigns" className="text-sm text-blue-600 font-medium">Ver todas →</Link>
        </div>
        <div className="space-y-2">
          {campaigns.slice(0, 3).map((campaign) => {
            const s = JSON.parse(campaign.stats || "{}");
            return (
              <div key={campaign.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm active:scale-[0.98] transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getNetworkIcon(campaign.network)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{campaign.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getStatusColor(campaign.status)}>{campaign.status}</Badge>
                      <span className="text-xs text-gray-400">{s.sent || 0} enviados • {s.replied || 0} respuestas</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{s.converted || 0}</p>
                    <p className="text-[10px] text-gray-400">ventas</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Contacts */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Leads Recientes</h2>
          <Link href="/contacts" className="text-sm text-blue-600 font-medium">Ver todos →</Link>
        </div>
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                {contact.firstName[0]}{contact.lastName?.[0] || ""}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{contact.firstName} {contact.lastName}</p>
                <p className="text-xs text-gray-500 truncate">{contact.company}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg">{getNetworkIcon(contact.network)}</span>
                <Badge variant={getStatusColor(contact.status)}>{contact.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Conversion funnel mini */}
      <section className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">Embudo (7 días)</h3>
        <div className="space-y-2">
          {[
            { label: "Enviados", value: stats?.messagesSent || 0, color: "bg-blue-500" },
            { label: "Respuestas", value: stats?.repliesReceived || 0, color: "bg-green-500" },
            { label: "Ventas", value: stats?.conversions || 0, color: "bg-orange-500" },
          ].map((step) => {
            const max = stats?.messagesSent || 1;
            const width = Math.max((step.value / max) * 100, 8);
            return (
              <div key={step.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">{step.label}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${step.color} rounded-full flex items-center px-2`} style={{ width: `${width}%` }}>
                    <span className="text-white text-[10px] font-bold">{step.value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          Tasa de respuesta: {analytics?.replyRate || 0}% • Conversión: {analytics?.conversionRate || 0}%
        </p>
      </section>
    </div>
  );
}
