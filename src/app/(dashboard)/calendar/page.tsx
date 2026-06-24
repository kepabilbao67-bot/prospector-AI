"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getNetworkIcon } from "@/lib/utils";

interface ScheduledAction {
  id: string;
  time: string;
  type: string;
  network: string;
  contact: string;
  description: string;
  status: "pending" | "done" | "skipped";
}

const demoSchedule: ScheduledAction[] = [
  { id: "1", time: "09:00", type: "connection", network: "linkedin", contact: "Carlos García", description: "Enviar solicitud de conexión", status: "done" },
  { id: "2", time: "09:15", type: "message", network: "linkedin", contact: "María López", description: "Follow-up #2 - caso de éxito", status: "done" },
  { id: "3", time: "09:45", type: "proposal", network: "fiverr", contact: "buyer_2024", description: "Propuesta personalizada proyecto web", status: "done" },
  { id: "4", time: "10:30", type: "message", network: "email", contact: "Laura Fernández", description: "Cold email - primer contacto", status: "pending" },
  { id: "5", time: "11:00", type: "visit", network: "linkedin", contact: "Pedro Ruiz", description: "Visitar perfil antes de conectar", status: "pending" },
  { id: "6", time: "12:00", type: "follow", network: "instagram", contact: "Elena Sánchez", description: "Follow + like 3 posts", status: "pending" },
  { id: "7", time: "14:00", type: "message", network: "instagram", contact: "Ana Martínez", description: "DM - referencia a su último post", status: "pending" },
  { id: "8", time: "15:00", type: "message", network: "twitter", contact: "David Chen", description: "DM casual sobre su tweet de IA", status: "pending" },
  { id: "9", time: "16:30", type: "message", network: "whatsapp", contact: "Miguel Torres", description: "Audio de seguimiento (30seg)", status: "pending" },
  { id: "10", time: "17:00", type: "message", network: "linkedin", contact: "Roberto Díaz", description: "Propuesta final - cierre", status: "pending" },
];

const typeIcons: Record<string, string> = {
  connection: "🤝",
  message: "💬",
  proposal: "📋",
  visit: "👁️",
  follow: "➕",
  like: "❤️",
  email: "📧",
};

export default function CalendarPage() {
  const [schedule] = useState(demoSchedule);
  const [selectedDay, setSelectedDay] = useState("Hoy");

  const doneCount = schedule.filter(s => s.status === "done").length;
  const pendingCount = schedule.filter(s => s.status === "pending").length;
  const progress = Math.round((doneCount / schedule.length) * 100);

  // Current hour for timeline
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Agenda del Día</h1>
          <p className="text-xs text-gray-500">{schedule.length} acciones programadas</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-blue-600">{progress}%</p>
          <p className="text-[10px] text-gray-500">completado</p>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {["Ayer", "Hoy", "Mañana", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
              selectedDay === day
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600"
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso de hoy</span>
          <span className="text-sm font-bold text-gray-900">{doneCount}/{schedule.length}</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-gray-400">
          <span>✅ {doneCount} completadas</span>
          <span>⏳ {pendingCount} pendientes</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {schedule.map((action) => {
          const isPast = action.time < currentTime;
          const isCurrent = action.status === "pending" && isPast;

          return (
            <div
              key={action.id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                action.status === "done"
                  ? "bg-green-50 border border-green-100"
                  : isCurrent
                  ? "bg-blue-50 border-2 border-blue-300 shadow-md"
                  : "bg-white border border-gray-100"
              }`}
            >
              {/* Time */}
              <div className="text-center w-12 shrink-0">
                <p className={`text-sm font-bold ${action.status === "done" ? "text-green-600" : "text-gray-900"}`}>
                  {action.time}
                </p>
              </div>

              {/* Divider */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  action.status === "done" ? "bg-green-500" : isCurrent ? "bg-blue-500 animate-pulse" : "bg-gray-300"
                }`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span>{typeIcons[action.type] || "📌"}</span>
                  <span className="text-sm">{getNetworkIcon(action.network)}</span>
                  <p className="text-sm font-medium text-gray-900 truncate">{action.contact}</p>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{action.description}</p>
              </div>

              {/* Status */}
              <div className="shrink-0">
                {action.status === "done" ? (
                  <span className="text-green-500 text-lg">✓</span>
                ) : (
                  <button className="px-2 py-1 text-[10px] bg-blue-100 text-blue-700 rounded-lg font-medium active:scale-95">
                    Ejecutar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick summary */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 text-white">
        <h3 className="font-bold mb-2">📅 Resumen de hoy</h3>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold">4</p>
            <p className="text-[10px] opacity-80">LinkedIn</p>
          </div>
          <div>
            <p className="text-lg font-bold">2</p>
            <p className="text-[10px] opacity-80">Fiverr</p>
          </div>
          <div>
            <p className="text-lg font-bold">2</p>
            <p className="text-[10px] opacity-80">Instagram</p>
          </div>
          <div>
            <p className="text-lg font-bold">2</p>
            <p className="text-[10px] opacity-80">Otros</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h4 className="font-medium text-yellow-900 text-sm mb-1">💡 Consejo del día</h4>
        <p className="text-xs text-yellow-800">
          Las acciones están distribuidas en horarios óptimos por red. LinkedIn funciona mejor
          entre 9-10h, mientras que Instagram rinde más entre 12-14h y 19-21h.
          ProspectorAI ya aplica esto automáticamente.
        </p>
      </div>
    </div>
  );
}
