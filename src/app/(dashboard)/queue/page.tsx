"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNetworkIcon, getStatusColor, formatDateTime } from "@/lib/utils";

interface Task {
  id: string;
  type: string;
  network: string;
  payload: string;
  status: string;
  priority: number;
  scheduledAt: string;
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
  retries: number;
  createdAt: string;
}

const taskTypeLabels: Record<string, string> = {
  send_message: "📨 Enviar Mensaje",
  connect: "🤝 Solicitar Conexión",
  follow: "➕ Seguir",
  like: "❤️ Like",
  visit: "👁️ Visitar Perfil",
  scrape: "🔍 Extraer Datos",
};

export default function QueuePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [showAdd, setShowAdd] = useState(false);

  async function loadQueue() {
    setLoading(true);
    const res = await fetch(`/api/queue?status=${statusFilter}`);
    const data = await res.json();
    setTasks(data.tasks || []);
    setCounts(data.counts || {});
    setLoading(false);
  }

  useEffect(() => {
    loadQueue();
  }, [statusFilter]);

  async function addTask(formData: FormData) {
    const task = {
      type: formData.get("type"),
      network: formData.get("network"),
      priority: parseInt(formData.get("priority") as string) || 5,
      delayMinutes: parseInt(formData.get("delayMinutes") as string) || 5,
      payload: {
        message: formData.get("message") || "",
        targetUrl: formData.get("targetUrl") || "",
      },
    };

    await fetch("/api/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    setShowAdd(false);
    loadQueue();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cola de Tareas</h1>
          <p className="text-gray-500 mt-1">Acciones programadas con delays humanizados</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>+ Añadir Tarea</Button>
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { key: "pending", label: "Pendientes", icon: "⏳" },
          { key: "processing", label: "En Proceso", icon: "⚡" },
          { key: "completed", label: "Completadas", icon: "✅" },
          { key: "failed", label: "Fallidas", icon: "❌" },
          { key: "cancelled", label: "Canceladas", icon: "🚫" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`p-4 rounded-xl border text-center transition-all ${
              statusFilter === key
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <p className="text-2xl">{icon}</p>
            <p className="text-2xl font-bold mt-1">{counts[key] || 0}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">⏳</p>
            <p className="text-gray-500">No hay tareas con estado &ldquo;{statusFilter}&rdquo;</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.map((task) => {
              const payload = JSON.parse(task.payload || "{}");
              return (
                <div key={task.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{getNetworkIcon(task.network)}</span>
                      <div>
                        <p className="font-medium text-gray-900">
                          {taskTypeLabels[task.type] || task.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {payload.targetUrl || payload.message?.slice(0, 50) || "Sin detalles"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="text-gray-900">Programado: {formatDateTime(task.scheduledAt)}</p>
                        <p className="text-xs text-gray-400">
                          Prioridad: {task.priority}/10 • Reintentos: {task.retries}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(task.status)}>{task.status}</Badge>
                    </div>
                  </div>
                  {task.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
                      Error: {task.error}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Delays Humanizados</h4>
        <p className="text-sm text-blue-700">
          ProspectorAI añade variación aleatoria a los tiempos entre acciones para simular comportamiento humano.
          Por ejemplo, si programas un delay de 5 minutos, la acción se ejecutará entre 2.5 y 7.5 minutos
          (factor aleatorio 0.5x - 1.5x). Esto reduce significativamente el riesgo de detección.
        </p>
      </div>

      {/* Add Task Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Añadir Tarea</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTask(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                  <select name="type" required className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="send_message">Enviar Mensaje</option>
                    <option value="connect">Solicitar Conexión</option>
                    <option value="follow">Seguir</option>
                    <option value="like">Like</option>
                    <option value="visit">Visitar Perfil</option>
                    <option value="scrape">Extraer Datos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Red *</label>
                  <select name="network" required className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="linkedin">LinkedIn</option>
                    <option value="fiverr">Fiverr</option>
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL del Objetivo</label>
                <input name="targetUrl" className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="https://linkedin.com/in/username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea name="message" rows={3} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Mensaje a enviar..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad (1-10)</label>
                  <input name="priority" type="number" min={1} max={10} defaultValue={5} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delay (minutos)</label>
                  <input name="delayMinutes" type="number" min={1} defaultValue={5} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit">Programar Tarea</Button>
                <Button variant="secondary" type="button" onClick={() => setShowAdd(false)}>Cancelar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
