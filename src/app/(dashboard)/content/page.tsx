"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getNetworkIcon } from "@/lib/utils";

interface ContentIdea {
  id: string;
  type: "post" | "reel" | "story" | "carousel" | "thread" | "article";
  network: string;
  title: string;
  hook: string;
  outline: string[];
  cta: string;
  bestTime: string;
  status: "idea" | "drafting" | "scheduled" | "published";
}

const demoContent: ContentIdea[] = [
  {
    id: "1", type: "carousel", network: "instagram", title: "5 Errores que te cuestan clientes",
    hook: "El 90% de freelancers cometen estos errores y pierden dinero cada mes 👇",
    outline: ["Error 1: No hacer follow-up", "Error 2: Vender en el primer mensaje", "Error 3: No mostrar resultados", "Error 4: Precio sin valor", "Error 5: No pedir referidos"],
    cta: "¿Cuál cometes tú? Comenta el número 👇", bestTime: "12:00", status: "scheduled",
  },
  {
    id: "2", type: "post", network: "linkedin", title: "Cómo conseguí 10 clientes en 30 días",
    hook: "Hace 30 días tenía 0 clientes. Hoy tengo 10. Esto es lo que hice (sin gastar en ads):",
    outline: ["Paso 1: Definí mi cliente ideal", "Paso 2: Creé una oferta irresistible", "Paso 3: Envié 100 mensajes personalizados", "Paso 4: Hice follow-up 3 veces", "Resultados: 10 clientes, €5,000 facturados"],
    cta: "¿Te gustaría saber exactamente cómo personalicé cada mensaje? Comenta 'SÍ' y te cuento.", bestTime: "09:00", status: "drafting",
  },
  {
    id: "3", type: "thread", network: "twitter", title: "El sistema que uso para automatizar mi prospección",
    hook: "Llevo 6 meses usando un sistema que me genera 5-10 leads calientes al día. Thread 🧵",
    outline: ["1/ El problema: prospectar manualmente es agotador", "2/ La solución: automatización inteligente", "3/ Mi setup exacto (herramientas)", "4/ Los resultados (con números)", "5/ El error que casi arruina todo", "6/ Mi consejo si empiezas hoy"],
    cta: "Si te ha servido, RT para que llegue a más gente 🙏", bestTime: "08:00", status: "idea",
  },
  {
    id: "4", type: "reel", network: "instagram", title: "Lo que NO te dicen sobre vender por DM",
    hook: "POV: Alguien te enseña la realidad de vender por DM en 2024",
    outline: ["Intro impactante (3seg)", "Mito vs Realidad x3", "Mi proceso real", "Resultado + CTA"],
    cta: "Guarda este reel si quieres aprender a vender por DM sin ser spam 📌", bestTime: "19:00", status: "idea",
  },
  {
    id: "5", type: "article", network: "linkedin", title: "Guía: De 0 a 10K€/mes como freelancer",
    hook: "Todo lo que necesitas saber para facturar tus primeros 10K€ al mes sin equipo ni oficina.",
    outline: ["Intro: mi historia", "Fase 1: Validar tu servicio", "Fase 2: Conseguir los 3 primeros clientes", "Fase 3: Automatizar y escalar", "Herramientas que uso", "Errores que cometí"],
    cta: "Si te ha ayudado, sígueme para más contenido como este.", bestTime: "10:00", status: "idea",
  },
];

const typeLabels: Record<string, { label: string; icon: string }> = {
  post: { label: "Post", icon: "📝" },
  reel: { label: "Reel", icon: "🎬" },
  story: { label: "Story", icon: "📱" },
  carousel: { label: "Carrusel", icon: "🎠" },
  thread: { label: "Thread", icon: "🧵" },
  article: { label: "Artículo", icon: "📰" },
};

const statusColors: Record<string, string> = {
  idea: "bg-gray-100 text-gray-700",
  drafting: "bg-yellow-100 text-yellow-700",
  scheduled: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
};

export default function ContentPage() {
  const [content] = useState(demoContent);
  const [selected, setSelected] = useState<ContentIdea | null>(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? content : content.filter(c => c.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Calendario de Contenido</h1>
          <p className="text-xs text-gray-500">Publica contenido que atrae clientes</p>
        </div>
        <Button size="sm">+ Idea</Button>
      </div>

      {/* Why content matters */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl p-5 text-white">
        <h3 className="font-bold mb-1">📣 ¿Por qué publicar contenido?</h3>
        <p className="text-xs opacity-90">
          El contenido es tu mejor vendedor 24/7. Un buen post puede generar leads que te escriban a TI
          (inbound) en lugar de perseguirlos tú (outbound). Combina ambos para máximos resultados.
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { id: "all", label: "Todos" },
          { id: "idea", label: "💡 Ideas" },
          { id: "drafting", label: "✍️ Borrador" },
          { id: "scheduled", label: "📅 Programado" },
          { id: "published", label: "✅ Publicado" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium active:scale-95 ${
              filter === f.id ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content cards */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelected(item)}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getNetworkIcon(item.network)}</span>
                <span className="text-sm">{typeLabels[item.type].icon}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[item.status]}`}>
                  {item.status}
                </span>
              </div>
              <span className="text-xs text-gray-400">⏰ {item.bestTime}</span>
            </div>
            <h3 className="font-semibold text-sm text-gray-900 mb-1">{item.title}</h3>
            <p className="text-xs text-gray-500 line-clamp-2">{item.hook}</p>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getNetworkIcon(selected.network)}</span>
                <span>{typeLabels[selected.type].icon} {typeLabels[selected.type].label}</span>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-2xl">×</button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selected.title}</h3>
                <p className="text-xs text-gray-400 mt-1">Mejor hora: {selected.bestTime}</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-medium text-blue-700 mb-1">🎣 Hook (primera línea):</p>
                <p className="text-sm text-gray-900 font-medium">{selected.hook}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">📋 Estructura:</p>
                <div className="space-y-1">
                  {selected.outline.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                      <span className="text-xs font-bold text-gray-400 mt-0.5">{i + 1}.</span>
                      <p className="text-xs text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs font-medium text-green-700 mb-1">🎯 CTA (call to action):</p>
                <p className="text-sm text-gray-900">{selected.cta}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="py-3 text-xs">📋 Copiar texto</Button>
                <Button className="py-3 text-xs">📅 Programar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
