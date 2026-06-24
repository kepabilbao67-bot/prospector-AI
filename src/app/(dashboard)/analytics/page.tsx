"use client";

import { useEffect, useState } from "react";

interface AnalyticsData {
  stats: { messagesSent: number; repliesReceived: number; connectionsAccepted: number; profilesViewed: number; conversions: number };
  replyRate: string;
  conversionRate: string;
  networkStats: Record<string, Record<string, number>>;
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", twitter: "Twitter", instagram: "Instagram", email: "Email",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?days=${days}`);
      setData(await res.json());
    } catch { /* demo data from API */ }
    setLoading(false);
  }

  useEffect(() => { loadAnalytics(); }, [days]);

  if (loading || !data) {
    return <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>;
  }

  const { stats } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
        <div className="flex gap-1">
          {[7, 14, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium ${days === d ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Enviados", value: stats.messagesSent },
          { label: "Respuestas", value: stats.repliesReceived },
          { label: "Conexiones", value: stats.connectionsAccepted },
          { label: "Perfiles vistos", value: stats.profilesViewed },
          { label: "Conversiones", value: stats.conversions },
        ].map((m) => (
          <div key={m.label} className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-2xl font-semibold text-gray-900">{m.value}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Rates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-3xl font-semibold text-gray-900">{data.replyRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Tasa de respuesta</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-700 rounded-full" style={{ width: `${Math.min(parseFloat(data.replyRate), 100)}%` }} />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-3xl font-semibold text-gray-900">{data.conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">Tasa de conversión</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-700 rounded-full" style={{ width: `${Math.min(parseFloat(data.conversionRate), 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Network breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">Rendimiento por red</p>
        </div>
        <div className="divide-y divide-gray-50">
          {Object.entries(data.networkStats).map(([network, networkData]) => {
            const sent = networkData.message_sent || 0;
            const replies = networkData.reply_received || 0;
            const rate = sent > 0 ? ((replies / sent) * 100).toFixed(1) : "0";
            return (
              <div key={network} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{networkLabels[network] || network}</p>
                  <p className="text-[11px] text-gray-500">{sent} enviados · {replies} respuestas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{rate}%</p>
                  <p className="text-[10px] text-gray-400">respuesta</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <p className="text-sm font-medium text-gray-900 mb-4">Embudo de conversión</p>
        <div className="space-y-3">
          {[
            { label: "Mensajes enviados", value: stats.messagesSent, color: "bg-gray-700" },
            { label: "Respuestas", value: stats.repliesReceived, color: "bg-gray-600" },
            { label: "Conexiones", value: stats.connectionsAccepted, color: "bg-gray-500" },
            { label: "Conversiones", value: stats.conversions, color: "bg-gray-900" },
          ].map((step) => {
            const width = stats.messagesSent > 0 ? Math.max((step.value / stats.messagesSent) * 100, 5) : 5;
            return (
              <div key={step.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-28 shrink-0">{step.label}</span>
                <div className="flex-1 h-7 bg-gray-100 rounded overflow-hidden">
                  <div className={`h-full ${step.color} rounded flex items-center px-2.5`} style={{ width: `${width}%` }}>
                    <span className="text-white text-[11px] font-medium">{step.value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
