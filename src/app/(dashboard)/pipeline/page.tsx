"use client";

import { useState } from "react";

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
  leads: Lead[];
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", twitter: "Twitter", instagram: "Instagram", email: "Email",
};

const initialStages: Stage[] = [
  { id: "new", name: "Nuevo", leads: [
    { id: "1", name: "Carlos García", company: "TechCorp", network: "linkedin", value: "€497", daysInStage: 1, lastAction: "Perfil visitado" },
    { id: "2", name: "buyer_2024", company: "Fiverr Project", network: "fiverr", value: "€300", daysInStage: 0, lastAction: "Propuesta enviada" },
    { id: "3", name: "Roberto Díaz", company: "AgenciaDigital", network: "linkedin", value: "€800", daysInStage: 2, lastAction: "Conexión enviada" },
  ]},
  { id: "contacted", name: "Contactado", leads: [
    { id: "4", name: "María López", company: "DesignStudio", network: "linkedin", value: "€1,200", daysInStage: 3, lastAction: "Mensaje enviado" },
    { id: "5", name: "Sophie Martin", company: "Freelance", network: "fiverr", value: "€250", daysInStage: 5, lastAction: "Follow-up enviado" },
  ]},
  { id: "replied", name: "Respondido", leads: [
    { id: "6", name: "Ana Martínez", company: "EcommerceMax", network: "instagram", value: "€600", daysInStage: 1, lastAction: "Interesada" },
    { id: "7", name: "Miguel Torres", company: "Innovatech", network: "linkedin", value: "€2,000", daysInStage: 2, lastAction: "Pidió más info" },
  ]},
  { id: "proposal", name: "Propuesta", leads: [
    { id: "8", name: "Laura Fernández", company: "SaaS Pro", network: "email", value: "€3,500", daysInStage: 4, lastAction: "Revisando" },
  ]},
  { id: "won", name: "Cerrado", leads: [
    { id: "9", name: "David Chen", company: "CloudNine", network: "linkedin", value: "€5,000", daysInStage: 0, lastAction: "Pagó" },
    { id: "10", name: "Elena Sánchez", company: "BrandMakers", network: "instagram", value: "€1,800", daysInStage: 2, lastAction: "Contrato firmado" },
  ]},
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
      if (stage.id === draggedLead.fromStage) return { ...stage, leads: stage.leads.filter(l => l.id !== draggedLead.lead.id) };
      if (stage.id === toStageId) return { ...stage, leads: [...stage.leads, { ...draggedLead.lead, daysInStage: 0 }] };
      return stage;
    }));
    setDraggedLead(null);
  }

  const totalValue = stages.reduce((sum, s) => sum + s.leads.reduce((ls, l) => ls + (parseFloat(l.value.replace(/[€$,]/g, "")) || 0), 0), 0);
  const wonValue = stages.find(s => s.id === "won")?.leads.reduce((s, l) => s + (parseFloat(l.value.replace(/[€$,]/g, "")) || 0), 0) || 0;
  const totalLeads = stages.reduce((s, st) => s + st.leads.length, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Pipeline</h1>
          <p className="text-xs text-gray-500">{totalLeads} leads · €{totalValue.toLocaleString()} en pipeline</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">€{wonValue.toLocaleString()}</p>
          <p className="text-[10px] text-gray-500">cerrado</p>
        </div>
      </div>

      {/* Stage summary */}
      <div className="grid grid-cols-5 gap-2">
        {stages.map(stage => (
          <div key={stage.id} className="text-center p-2 bg-white border border-gray-200 rounded-lg">
            <p className="text-lg font-semibold text-gray-900">{stage.leads.length}</p>
            <p className="text-[10px] text-gray-500">{stage.name}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        {stages.map(stage => (
          <div key={stage.id} className="min-w-[260px] md:min-w-[220px] flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3"
            onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(stage.id)}>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-medium text-gray-700">{stage.name}</p>
              <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">{stage.leads.length}</span>
            </div>

            <div className="space-y-2">
              {stage.leads.map(lead => (
                <div key={lead.id} draggable onDragStart={() => handleDragStart(lead, stage.id)}
                  className="bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                    <p className="text-xs font-semibold text-gray-700 shrink-0 ml-2">{lead.value}</p>
                  </div>
                  <p className="text-[11px] text-gray-500">{lead.company}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <span className="text-[10px] text-gray-400">{networkLabels[lead.network]}</span>
                    <span className="text-[10px] text-gray-400">{lead.daysInStage}d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
