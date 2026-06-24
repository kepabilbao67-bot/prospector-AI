"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getNetworkIcon } from "@/lib/utils";

interface CompetitorProfile {
  id: string;
  name: string;
  network: string;
  url: string;
  followers: string;
  engagement: string;
  postFrequency: string;
  topContent: string[];
  weaknesses: string[];
  opportunities: string[];
}

const demoCompetitors: CompetitorProfile[] = [
  {
    id: "1",
    name: "CompetidorA_Design",
    network: "instagram",
    url: "https://instagram.com/competidora",
    followers: "15.2K",
    engagement: "3.2%",
    postFrequency: "4 posts/semana",
    topContent: ["Reels de antes/después", "Carruseles educativos", "Stories con polls"],
    weaknesses: ["No responde DMs rápido", "No tiene lead magnet", "Precios no claros"],
    opportunities: ["Ofrecer respuesta en < 1h", "Crear lead magnet gratuito", "Pricing transparente"],
  },
  {
    id: "2",
    name: "AgenciaRival",
    network: "linkedin",
    url: "https://linkedin.com/company/agenciarival",
    followers: "8.5K",
    engagement: "4.1%",
    postFrequency: "3 posts/semana",
    topContent: ["Casos de éxito", "Posts de equipo", "Artículos largos"],
    weaknesses: ["Contenido genérico", "No personalizan outreach", "Tiempo de entrega largo"],
    opportunities: ["Mensajes hiper-personalizados", "Ofrecer entrega express", "Contenido con datos reales"],
  },
  {
    id: "3",
    name: "freelancer_pro_2024",
    network: "fiverr",
    url: "https://fiverr.com/freelancer_pro",
    followers: "Level 2 Seller",
    engagement: "4.8★ (234 reviews)",
    postFrequency: "5 gigs activos",
    topContent: ["Video portfolio", "FAQ detallado", "Paquetes claros"],
    weaknesses: ["Entrega estándar 7 días", "No ofrece soporte post-entrega", "Solo inglés"],
    opportunities: ["Ofrecer entrega en 3 días", "Soporte 30 días incluido", "Servicio bilingüe"],
  },
];

export default function SpyPage() {
  const [competitors] = useState(demoCompetitors);
  const [selected, setSelected] = useState<CompetitorProfile | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Espía Competidores</h1>
          <p className="text-xs text-gray-500">Analiza a tu competencia y encuentra oportunidades</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>+ Añadir</Button>
      </div>

      {/* Info card */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🕵️</span>
          <h3 className="font-bold">Inteligencia Competitiva</h3>
        </div>
        <p className="text-xs opacity-80">
          Analiza qué hacen tus competidores, encuentra sus debilidades y conviértelas en tus ventajas.
          La IA te sugiere oportunidades específicas para diferenciarte y ganar sus clientes.
        </p>
      </div>

      {/* Competitor cards */}
      <div className="space-y-3">
        {competitors.map((comp) => (
          <div
            key={comp.id}
            onClick={() => setSelected(comp)}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                  {getNetworkIcon(comp.network)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{comp.name}</p>
                  <p className="text-xs text-gray-500">{comp.followers} • {comp.engagement}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-medium">
                {comp.weaknesses.length} debilidades
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {comp.opportunities.slice(0, 2).map((opp, i) => (
                <span key={i} className="shrink-0 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[10px]">
                  💡 {opp}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
        <h3 className="font-bold text-purple-900 mb-3">✨ Sugerencias IA basadas en tu competencia</h3>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <span className="text-sm mt-0.5">1.</span>
            <p className="text-xs text-purple-800"><strong>Responde más rápido:</strong> Tus competidores tardan 24-48h en responder DMs. Si respondes en {'<'} 1h, ganarás el 60% de los clientes indecisos.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sm mt-0.5">2.</span>
            <p className="text-xs text-purple-800"><strong>Ofrece garantía:</strong> Ninguno de tus competidores ofrece garantía de devolución. Esto elimina el riesgo percibido y aumenta conversiones 30-40%.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sm mt-0.5">3.</span>
            <p className="text-xs text-purple-800"><strong>Crea contenido educativo:</strong> El contenido que más engagement genera es el educativo (how-to). Publica 2 posts/semana con tips de tu industria.</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-sm mt-0.5">4.</span>
            <p className="text-xs text-purple-800"><strong>Precio transparente:</strong> La mayoría no muestra precios. Ser transparente genera confianza inmediata y filtra leads no calificados.</p>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getNetworkIcon(selected.network)}</span>
                <div>
                  <h2 className="text-lg font-bold">{selected.name}</h2>
                  <p className="text-xs text-gray-500">{selected.followers} • {selected.engagement}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-2xl">×</button>
            </div>

            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-bold">{selected.followers}</p>
                  <p className="text-[10px] text-gray-500">Seguidores</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-bold">{selected.engagement}</p>
                  <p className="text-[10px] text-gray-500">Engagement</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm font-bold">{selected.postFrequency}</p>
                  <p className="text-[10px] text-gray-500">Frecuencia</p>
                </div>
              </div>

              {/* Top content */}
              <div>
                <h4 className="font-medium text-sm text-gray-900 mb-2">📌 Contenido que les funciona:</h4>
                <div className="space-y-1">
                  {selected.topContent.map((c, i) => (
                    <p key={i} className="text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg">✓ {c}</p>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="font-medium text-sm text-red-700 mb-2">⚠️ Debilidades detectadas:</h4>
                <div className="space-y-1">
                  {selected.weaknesses.map((w, i) => (
                    <p key={i} className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">✗ {w}</p>
                  ))}
                </div>
              </div>

              {/* Opportunities */}
              <div>
                <h4 className="font-medium text-sm text-green-700 mb-2">💡 Tu oportunidad:</h4>
                <div className="space-y-1">
                  {selected.opportunities.map((o, i) => (
                    <p key={i} className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">→ {o}</p>
                  ))}
                </div>
              </div>

              <Button className="w-full py-3" onClick={() => setSelected(null)}>
                ✨ Generar campaña para robar sus clientes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add competitor modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Añadir Competidor</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <form className="space-y-3">
              <input placeholder="Nombre o @usuario *" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <input placeholder="URL del perfil *" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
                <option value="linkedin">💼 LinkedIn</option>
                <option value="instagram">📸 Instagram</option>
                <option value="fiverr">🟢 Fiverr</option>
                <option value="twitter">🐦 Twitter/X</option>
                <option value="tiktok">🎵 TikTok</option>
              </select>
              <textarea placeholder="Notas (qué servicios ofrecen, precios...)" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <Button type="button" onClick={() => setShowAdd(false)} className="w-full py-3">
                🕵️ Añadir y Analizar
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
