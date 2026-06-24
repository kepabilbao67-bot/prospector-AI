"use client";

import { useState } from "react";

interface ScheduledAction {
  id: string;
  time: string;
  type: string;
  network: string;
  contact: string;
  description: string;
  status: "pending" | "done";
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", twitter: "Twitter", instagram: "Instagram", email: "Email", whatsapp: "WhatsApp",
};

const typeLabels: Record<string, string> = {
  connection: "Conexión", message: "Mensaje", proposal: "Propuesta", visit: "Visita", follow: "Follow",
};

const demoSchedule: ScheduledAction[] = [
  { id: "1", time: "09:00", type: "connection", network: "linkedin", contact: "Carlos García", description: "Enviar solicitud de conexión", status: "done" },
  { id: "2", time: "09:15", type: "message", network: "linkedin", contact: "María López", description: "Follow-up #2", status: "done" },
  { id: "3", time: "09:45", type: "proposal", network: "fiverr", contact: "buyer_2024", description: "Propuesta proyecto web", status: "done" },
  { id: "4", time: "10:30", type: "message", network: "email", contact: "Laura Fernández", description: "Cold email inicial", status: "pending" },
  { id: "5", time: "11:00", type: "visit", network: "linkedin", contact: "Pedro Ruiz", description: "Visitar perfil", status: "pending" },
  { id: "6", time: "12:00", type: "follow", network: "instagram", contact: "Elena Sánchez", description: "Follow + like posts", status: "pending" },
  { id: "7", time: "14:00", type: "message", network: "instagram", contact: "Ana Martínez", description: "DM referencia a su post", status: "pending" },
  { id: "8", time: "15:00", type: "message", network: "twitter", contact: "David Chen", description: "DM sobre su tweet", status: "pending" },
  { id: "9", time: "16:30", type: "message", network: "whatsapp", contact: "Miguel Torres", description: "Audio de seguimiento", status: "pending" },
  { id: "10", time: "17:00", type: "message", network: "linkedin", contact: "Roberto Díaz", description: "Propuesta final", status: "pending" },
];

export default function CalendarPage() {
  const [schedule] = useState(demoSchedule);
  const [selectedDay, setSelectedDay] = useState("Hoy");

  const doneCount = schedule.filter(s => s.status === "done").length;
  const progress = Math.round((doneCount / schedule.length) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Agenda</h1>
          <p className="text-xs text-gray-500">{schedule.length} acciones programadas</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{progress}%</p>
          <p className="text-[10px] text-gray-500">completado</p>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {["Ayer", "Hoy", "Mañana", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium ${selectedDay === day ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
            {day}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-700">Progreso del día</span>
          <span className="text-xs text-gray-500">{doneCount}/{schedule.length}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gray-700 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Timeline */}
      <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-50">
        {schedule.map((action) => (
          <div key={action.id} className={`px-4 py-3 flex items-center gap-3 ${action.status === "done" ? "bg-gray-50" : ""}`}>
            {/* Time */}
            <div className="w-12 shrink-0">
              <p className={`text-xs font-medium ${action.status === "done" ? "text-gray-400" : "text-gray-900"}`}>{action.time}</p>
            </div>

            {/* Status dot */}
            <div className={`w-2 h-2 rounded-full shrink-0 ${action.status === "done" ? "bg-green-500" : "bg-gray-300"}`} />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${action.status === "done" ? "text-gray-400 line-through" : "text-gray-900"}`}>
                {action.contact}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {typeLabels[action.type] || action.type} · {networkLabels[action.network]} · {action.description}
              </p>
            </div>

            {/* Action */}
            {action.status === "pending" && (
              <button className="px-2.5 py-1 border border-gray-200 rounded text-[10px] font-medium text-gray-600 hover:bg-gray-50 shrink-0">
                Ejecutar
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Network summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-700 mb-2">Distribución por red</p>
        <div className="grid grid-cols-4 gap-3 text-center">
          {Object.entries(
            schedule.reduce<Record<string, number>>((acc, s) => { acc[s.network] = (acc[s.network] || 0) + 1; return acc; }, {})
          ).map(([net, count]) => (
            <div key={net}>
              <p className="text-lg font-semibold text-gray-900">{count}</p>
              <p className="text-[10px] text-gray-500">{networkLabels[net]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
