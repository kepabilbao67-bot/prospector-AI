"use client";

import { useState } from "react";
import { getNetworkIcon } from "@/lib/utils";

interface Lead {
  id: string;
  name: string;
  company: string;
  network: string;
  value: string;
  daysInStage: number;
  lastAction: string;
}

interface Stage {
  id: string;
  name: string;
  color: string;
  icon: string;
  leads: Lead[];
}

const initialStages: Stage[] = [
  {
    id: "new", name: "Nuevo Lead", color: "border-gray-300 bg-gray-50", icon: "⚪",
    leads: [
      { id: "1", name: "Carlos García", company: "TechCorp", network: "linkedin", value: "€497", daysInStage: 1, lastAction: "Perfil visitado" },
      { id: "2", name: "buyer_2024", company: "Fiverr Project", network: "fiverr", value: "€300", daysInStage: 0, lastAction: "Propuesta enviada" },
      { id: "3", name: "Roberto Díaz", company: "AgenciaDigital", network: "linkedin", value: "€800", daysInStage: 2, lastAction: "Conexión enviada" },
    ],
  },
  {
    id: "contacted", name: "Contactado", color: "border-blue-300 bg-blue-50", icon: "💬",
    leads: [
      { id: "4", name: "María López", company: "DesignStudio", network: "linkedin", value: "€1,200", daysInStage: 3, lastAction: "Mensaje enviado" },
      { id: "5", name: "Sophie Martin", company: "Freelance", network: "fiverr", value: "€250", daysInStage: 5, lastAction: "Follow-up enviado" },
    ],
  },
  {
    id: "replied", name: "Respondió", color: "border-green-300 bg-green-50", icon: "✅",
    leads: [
      { id: "6", name: "Ana Martínez", company: "EcommerceMax", network: "instagram", value: "€600", daysInStage: 1, lastAction: "Interesada en propuesta" },
      { id: "7", name: "Miguel Torres", company: "Innovatech", network: "linkedin", value: "€2,000", daysInStage: 2, lastAction: "Pidió más info" },
    ],
  },
  {
    id: "proposal", name: "Propuesta Enviada", color: "border-purple-300 bg-purple-50", icon: "📋",
    leads: [
      { id: "8", name: "Laura Fernández", company: "SaaS Pro", network: "email", value: "€3,500", daysInStage: 4, lastAction: "Revisando propuesta" },
    ],
  },
  {
    id: "won", name: "Ganado 🎉", color: "border-emerald-300 bg-emerald-50", icon: "💰",
    leads: [
      { id: "9", name: "David Chen", company: "CloudNine", network: "linkedin", value: "€5,000", daysInStage: 0, lastAction: "¡Pagó!" },
      { id: "10", name: "Elena Sánchez", company: "BrandMakers", network: "instagram", value: "€1,800", daysInStage: 2, lastAction: "Contrato firmado" },
    ],
  },
];

export default function PipelinePage() {
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [draggedLead, setDraggedLead] = useState<{ lead: Lead; fromStage: string } | null>(null);

  function handleDragStart(lead: Lead, stageId: string) {
    setDraggedLead({ lead, fromStage: stageId });
  }

  function handleDrop(toStageId: string) {
    if (!draggedLead || draggedLead.fromStage === toStageId) return;

    setStages(prev => prev.map(stage => {
      if (stage.id === draggedLead.fromStage) {
        return { ...stage, leads: stage.leads.filter(l => l.id !== draggedLead.lead.id) };
      }
      if (stage.id === toStageId) {
        return { ...stage, leads: [...stage.leads, { ...draggedLead.lead, daysInStage: 0 }] };
      }
      return stage;
    }));
    setDraggedLead(null);
  }

  const totalValue = stages.reduce((sum, s) => sum + s.leads.reduce((ls, l) => ls + parseFloat(l.value.replace(/[€$,]/g, "")) || 0, 0), 0);
  const wonValue = stages.find(s => s.id === "won")?.leads.reduce((s, l) => s + parseFloat(l.value.replace(/[€$,]/g, "")) || 0, 0) || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Pipeline de Ventas</h1>
          <p className="text-xs text-gray-500">Arrastra leads entre etapas</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Valor total en pipeline</p>
          <p className="text-lg font-bold text-blue-600">€{totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {stages.map(stage => (
          <div key={stage.id} className={`min-w-[120px] p-3 rounded-xl border-2 ${stage.color} text-center`}>
            <p className="text-lg">{stage.icon}</p>
            <p className="text-xs font-medium text-gray-700 mt-1">{stage.name}</p>
            <p className="text-lg font-bold text-gray-900">{stage.leads.length}</p>
          </div>
        ))}
      </div>

      {/* Revenue highlight */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80">Ventas cerradas</p>
            <p className="text-2xl font-bold">€{wonValue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Tasa de conversión</p>
            <p className="text-xl font-bold">{stages[0].leads.length > 0 ? Math.round((stages[4].leads.length / (stages[0].leads.length + stages[1].leads.length + stages[2].leads.length + stages[3].leads.length + stages[4].leads.length)) * 100) : 0}%</p>
          </div>
        </div>
      </div>

      {/* Kanban board - horizontal scroll on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {stages.map(stage => (
          <div
            key={stage.id}
            className={`min-w-[280px] md:min-w-[240px] flex-1 rounded-2xl border-2 ${stage.color} p-3`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(stage.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span>{stage.icon}</span>
                <span className="text-sm font-bold text-gray-900">{stage.name}</span>
              </div>
              <span className="text-xs bg-white px-2 py-0.5 rounded-full font-medium text-gray-600">
                {stage.leads.length}
              </span>
            </div>

            <div className="space-y-2">
              {stage.leads.map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={() => handleDragStart(lead, stage.id)}
                  className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm cursor-grab active:cursor-grabbing active:scale-95 transition-all hover:shadow-md"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{lead.name}</p>
                    <span className="text-sm">{getNetworkIcon(lead.network)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{lead.company}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-green-600">{lead.value}</span>
                    <span className="text-[10px] text-gray-400">{lead.daysInStage}d en esta etapa</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 truncate">📌 {lead.lastAction}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
