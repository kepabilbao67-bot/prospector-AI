"use client";

import { useState } from "react";

interface ContentIdea {
  id: string;
  type: string;
  network: string;
  title: string;
  hook: string;
  outline: string[];
  cta: string;
  bestTime: string;
  status: "idea" | "drafting" | "scheduled" | "published";
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", instagram: "Instagram", twitter: "Twitter",
};

const statusLabels: Record<string, string> = {
  idea: "Idea", drafting: "Borrador", scheduled: "Programado", published: "Publicado",
};

const demoContent: ContentIdea[] = [
  { id: "1", type: "carousel", network: "instagram", title: "5 Errores que te cuestan clientes", hook: "El 90% de freelancers cometen estos errores y pierden dinero cada mes", outline: ["Error 1: No hacer follow-up", "Error 2: Vender en el primer mensaje", "Error 3: No mostrar resultados", "Error 4: Precio sin valor", "Error 5: No pedir referidos"], cta: "Comenta cuál cometes tú", bestTime: "12:00", status: "scheduled" },
  { id: "2", type: "post", network: "linkedin", title: "Cómo conseguí 10 clientes en 30 días", hook: "Hace 30 días tenía 0 clientes. Hoy tengo 10. Esto es lo que hice:", outline: ["Definí mi cliente ideal", "Creé una oferta irresistible", "Envié 100 mensajes personalizados", "Hice follow-up 3 veces", "Resultado: 10 clientes, €5,000"], cta: "Comenta SÍ y te cuento el proceso exacto", bestTime: "09:00", status: "drafting" },
  { id: "3", type: "thread", network: "twitter", title: "Mi sistema de automatización de prospección", hook: "Llevo 6 meses usando un sistema que me genera 5-10 leads calientes al día. Thread:", outline: ["El problema: prospectar es agotador", "La solución: automatización inteligente", "Mi setup exacto", "Los resultados con números", "Mi consejo si empiezas hoy"], cta: "RT para que llegue a más gente", bestTime: "08:00", status: "idea" },
  { id: "4", type: "reel", network: "instagram", title: "La realidad de vender por DM", hook: "Lo que NO te dicen sobre vender por DM en 2024", outline: ["Intro impactante (3seg)", "Mito vs Realidad x3", "Mi proceso real", "Resultado + CTA"], cta: "Guarda este reel si quieres aprender", bestTime: "19:00", status: "idea" },
];

export default function ContentPage() {
  const [content] = useState(demoContent);
  const [selected, setSelected] = useState<ContentIdea | null>(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? content : content.filter(c => c.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Contenido</h1>
          <p className="text-xs text-gray-500">Ideas y calendario de publicación</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Nueva idea</button>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {[
          { id: "all", label: "Todos" },
          { id: "idea", label: "Ideas" },
          { id: "drafting", label: "Borrador" },
          { id: "scheduled", label: "Programado" },
          { id: "published", label: "Publicado" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium ${filter === f.id ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Content cards */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <button key={item.id} onClick={() => setSelected(item)}
            className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{networkLabels[item.network]}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-500 capitalize">{item.type}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                item.status === "scheduled" ? "bg-blue-50 text-blue-700" :
                item.status === "drafting" ? "bg-yellow-50 text-yellow-700" :
                item.status === "published" ? "bg-green-50 text-green-700" :
                "bg-gray-50 text-gray-600"
              }`}>{statusLabels[item.status]}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{item.title}</p>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.hook}</p>
          </button>
        ))}
      </div>

      {/* Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">{selected.title}</h2>
                <p className="text-[11px] text-gray-500">{networkLabels[selected.network]} · {selected.type} · Mejor hora: {selected.bestTime}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-[11px] font-medium text-blue-700 mb-0.5">Hook (primera línea)</p>
                <p className="text-sm text-gray-900">{selected.hook}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-700 mb-1.5">Estructura</p>
                <div className="space-y-1">
                  {selected.outline.map((point, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-1.5 bg-gray-50 rounded">
                      <span className="text-[10px] text-gray-400 mt-0.5">{i + 1}.</span>
                      <p className="text-xs text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <p className="text-[11px] font-medium text-green-700 mb-0.5">CTA</p>
                <p className="text-sm text-gray-900">{selected.cta}</p>
              </div>
              <button className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">Copiar texto completo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
