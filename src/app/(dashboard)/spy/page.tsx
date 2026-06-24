"use client";

import { useState } from "react";

interface Competitor {
  id: string;
  name: string;
  network: string;
  followers: string;
  engagement: string;
  weaknesses: string[];
  opportunities: string[];
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", instagram: "Instagram", fiverr: "Fiverr", twitter: "Twitter",
};

const demoCompetitors: Competitor[] = [
  { id: "1", name: "CompetidorA_Design", network: "instagram", followers: "15.2K", engagement: "3.2%", weaknesses: ["No responde DMs rápido", "No tiene lead magnet", "Precios no claros"], opportunities: ["Respuesta en < 1h", "Lead magnet gratuito", "Pricing transparente"] },
  { id: "2", name: "AgenciaRival", network: "linkedin", followers: "8.5K", engagement: "4.1%", weaknesses: ["Contenido genérico", "No personalizan", "Entrega lenta"], opportunities: ["Mensajes personalizados", "Entrega express", "Contenido con datos reales"] },
  { id: "3", name: "freelancer_pro", network: "fiverr", followers: "Level 2", engagement: "4.8 stars", weaknesses: ["Entrega 7 días", "Sin soporte post-entrega", "Solo inglés"], opportunities: ["Entrega en 3 días", "Soporte 30 días", "Servicio bilingüe"] },
];

export default function SpyPage() {
  const [competitors] = useState(demoCompetitors);
  const [selected, setSelected] = useState<Competitor | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Competencia</h1>
          <p className="text-xs text-gray-500">Análisis competitivo y oportunidades</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Añadir</button>
      </div>

      <div className="space-y-2">
        {competitors.map((comp) => (
          <button key={comp.id} onClick={() => setSelected(comp)}
            className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-900">{comp.name}</p>
                <p className="text-[11px] text-gray-500">{networkLabels[comp.network]} · {comp.followers} · {comp.engagement}</p>
              </div>
              <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-medium">{comp.weaknesses.length} debilidades</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {comp.opportunities.slice(0, 2).map((o, i) => (
                <span key={i} className="shrink-0 px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px]">{o}</span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* AI suggestions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-700 mb-2">Sugerencias basadas en la competencia</p>
        <div className="space-y-1.5">
          <p className="text-[11px] text-gray-600">1. <strong>Responde más rápido:</strong> Tus competidores tardan 24-48h. Si respondes en menos de 1h, ganarás clientes indecisos.</p>
          <p className="text-[11px] text-gray-600">2. <strong>Ofrece garantía:</strong> Ningún competidor la ofrece. Elimina el riesgo percibido.</p>
          <p className="text-[11px] text-gray-600">3. <strong>Contenido educativo:</strong> Publica how-to content 2x/semana para posicionarte como experto.</p>
          <p className="text-[11px] text-gray-600">4. <strong>Precio transparente:</strong> La mayoría oculta precios. Ser transparente genera confianza.</p>
        </div>
      </div>

      {/* Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{selected.name}</h2>
                <p className="text-[11px] text-gray-500">{networkLabels[selected.network]} · {selected.followers} · {selected.engagement}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-red-700 mb-1.5">Debilidades</p>
                {selected.weaknesses.map((w, i) => <p key={i} className="text-xs text-gray-600 px-3 py-1.5 bg-red-50 rounded mb-1">{w}</p>)}
              </div>
              <div>
                <p className="text-xs font-medium text-green-700 mb-1.5">Tu oportunidad</p>
                {selected.opportunities.map((o, i) => <p key={i} className="text-xs text-gray-600 px-3 py-1.5 bg-green-50 rounded mb-1">{o}</p>)}
              </div>
              <button onClick={() => setSelected(null)} className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">Crear campaña basada en esto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
