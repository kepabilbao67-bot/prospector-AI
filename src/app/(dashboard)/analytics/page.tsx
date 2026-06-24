"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/ui/stat-card";
import { getNetworkIcon } from "@/lib/utils";

interface AnalyticsData {
  stats: {
    messagesSent: number;
    repliesReceived: number;
    connectionsAccepted: number;
    profilesViewed: number;
    conversions: number;
  };
  replyRate: string;
  conversionRate: string;
  chartData: { date: string; [key: string]: string | number }[];
  networkStats: Record<string, Record<string, number>>;
  totalEvents: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  async function loadAnalytics() {
    setLoading(true);
    const res = await fetch(`/api/analytics?days=${days}`);
    const analyticsData = await res.json();
    setData(analyticsData);
    setLoading(false);
  }

  useEffect(() => {
    loadAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const maxEvents = Math.max(
    ...data.chartData.map((d) =>
      Object.values(d).reduce<number>((sum, v) => (typeof v === "number" ? sum + v : sum), 0)
    ),
    1
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Rendimiento de tus campañas de prospección</p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Mensajes Enviados" value={data.stats.messagesSent} icon="📨" />
        <StatCard title="Respuestas" value={data.stats.repliesReceived} icon="💬" subtitle={`${data.replyRate}% tasa`} />
        <StatCard title="Conexiones" value={data.stats.connectionsAccepted} icon="🤝" />
        <StatCard title="Perfiles Vistos" value={data.stats.profilesViewed} icon="👁️" />
        <StatCard title="Conversiones" value={data.stats.conversions} icon="🎯" subtitle={`${data.conversionRate}% tasa`} />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Actividad Diaria</h3>
        <div className="h-64 flex items-end gap-1">
          {data.chartData.slice(-30).map((day, i) => {
            const sent = (day.message_sent as number) || 0;
            const replies = (day.reply_received as number) || 0;
            const connections = (day.connection_accepted as number) || 0;
            const total = sent + replies + connections;
            const height = (total / maxEvents) * 100;

            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div className="w-full flex flex-col justify-end" style={{ height: "200px" }}>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all group-hover:bg-blue-600"
                    style={{ height: `${(sent / maxEvents) * 200}px` }}
                  />
                  <div
                    className="w-full bg-green-500"
                    style={{ height: `${(replies / maxEvents) * 200}px` }}
                  />
                  <div
                    className="w-full bg-purple-500 rounded-b"
                    style={{ height: `${(connections / maxEvents) * 200}px` }}
                  />
                </div>
                {i % 5 === 0 && (
                  <span className="text-[10px] text-gray-400 rotate-45">
                    {day.date?.toString().slice(5)}
                  </span>
                )}
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded-lg whitespace-nowrap z-10">
                  <p>{day.date?.toString()}</p>
                  <p>📨 {sent} enviados</p>
                  <p>💬 {replies} respuestas</p>
                  <p>🤝 {connections} conexiones</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-xs text-gray-500">Mensajes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-xs text-gray-500">Respuestas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-purple-500"></div>
            <span className="text-xs text-gray-500">Conexiones</span>
          </div>
        </div>
      </div>

      {/* Network Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Rendimiento por Red</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(data.networkStats).map(([network, stats]) => {
            const sent = stats.message_sent || 0;
            const replies = stats.reply_received || 0;
            const rate = sent > 0 ? ((replies / sent) * 100).toFixed(1) : "0";
            return (
              <div key={network} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{getNetworkIcon(network)}</span>
                  <span className="font-medium text-sm capitalize">{network}</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Enviados</span>
                    <span className="font-medium">{sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Respuestas</span>
                    <span className="font-medium text-green-600">{replies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tasa</span>
                    <span className="font-bold text-blue-600">{rate}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Embudo de Conversión</h3>
        <div className="space-y-3">
          {[
            { label: "Mensajes Enviados", value: data.stats.messagesSent, color: "bg-blue-500" },
            { label: "Respuestas Recibidas", value: data.stats.repliesReceived, color: "bg-green-500" },
            { label: "Conexiones Aceptadas", value: data.stats.connectionsAccepted, color: "bg-purple-500" },
            { label: "Conversiones", value: data.stats.conversions, color: "bg-emerald-500" },
          ].map((step) => {
            const width = data.stats.messagesSent > 0
              ? (step.value / data.stats.messagesSent) * 100
              : 0;
            return (
              <div key={step.label} className="flex items-center gap-4">
                <div className="w-40 text-sm text-gray-600">{step.label}</div>
                <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${step.color} rounded-full flex items-center justify-end px-3`}
                    style={{ width: `${Math.max(width, 5)}%` }}
                  >
                    <span className="text-white text-xs font-bold">{step.value}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500 w-16 text-right">{width.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
