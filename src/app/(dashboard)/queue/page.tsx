"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  type: string;
  network: string;
  payload: string;
  status: string;
  priority: number;
  scheduledAt: string;
  retries: number;
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", twitter: "Twitter", instagram: "Instagram", email: "Email",
};

const typeLabels: Record<string, string> = {
  send_message: "Enviar mensaje", connect: "Solicitar conexión", follow: "Seguir",
  like: "Like", visit: "Visitar perfil", scrape: "Extraer datos",
};

export default function QueuePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  async function loadQueue() {
    setLoading(true);
    try {
      const res = await fetch(`/api/queue?status=${statusFilter}`);
      const data = await res.json();
      setTasks(data.tasks || []);
      setCounts(data.counts || {});
    } catch { setTasks([]); }
    setLoading(false);
  }

  useEffect(() => { loadQueue(); }, [statusFilter]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Cola de tareas</h1>
        <p className="text-xs text-gray-500">Acciones programadas con delays humanizados</p>
      </div>

      {/* Status tabs */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { key: "pending", label: "Pendientes" },
          { key: "processing", label: "En proceso" },
          { key: "completed", label: "Completadas" },
          { key: "failed", label: "Fallidas" },
          { key: "cancelled", label: "Canceladas" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setStatusFilter(key)}
            className={`p-3 rounded-lg border text-center transition-colors ${
              statusFilter === key ? "border-gray-900 bg-gray-50" : "border-gray-200 bg-white"
            }`}>
            <p className="text-lg font-semibold text-gray-900">{counts[key] || 0}</p>
            <p className="text-[10px] text-gray-500">{label}</p>
          </button>
        ))}
      </div>

      {/* Tasks */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">No hay tareas con este estado</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          {tasks.map((task) => (
            <div key={task.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{typeLabels[task.type] || task.type}</p>
                <p className="text-[11px] text-gray-500">{networkLabels[task.network]} · Prioridad {task.priority}/10 · Reintentos: {task.retries}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-700">{new Date(task.scheduledAt).toLocaleString("es-ES", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                <span className={`text-[10px] font-medium ${task.status === "completed" ? "text-green-600" : task.status === "failed" ? "text-red-600" : "text-gray-500"}`}>
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-700 mb-1">Delays humanizados</p>
        <p className="text-[11px] text-gray-500">Las acciones se ejecutan con variación aleatoria (0.5x - 1.5x del tiempo programado) para simular comportamiento natural y evitar detección.</p>
      </div>
    </div>
  );
}
