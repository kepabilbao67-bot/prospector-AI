"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AUTOMATION_TEMPLATES, type AutomationRule } from "@/lib/automations";

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>(AUTOMATION_TEMPLATES);
  const [showCreate, setShowCreate] = useState(false);

  function toggleRule(id: string) {
    setRules(rules.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
  }

  const activeCount = rules.filter(r => r.isActive).length;
  const totalExecutions = rules.reduce((s, r) => s + r.executionCount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Automatizaciones</h1>
          <p className="text-xs text-gray-500">{activeCount} activas • {totalExecutions} ejecuciones totales</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ Nueva Regla</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-green-700">{activeCount}</p>
          <p className="text-[10px] text-green-600">Activas</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-blue-700">{totalExecutions}</p>
          <p className="text-[10px] text-blue-600">Ejecuciones</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-purple-700">{rules.length}</p>
          <p className="text-[10px] text-purple-600">Total reglas</p>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white">
        <h3 className="font-bold mb-1">🤖 Automatización Total</h3>
        <p className="text-xs opacity-90">
          Las reglas se ejecutan automáticamente cuando se cumple el trigger.
          Por ejemplo: si un lead responde y tiene score {'>'} 70, se le envía notificación
          urgente y se mueve al pipeline de calificados.
        </p>
      </div>

      {/* Rules list */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-white rounded-2xl border p-4 transition-all ${
              rule.isActive ? "border-green-200 shadow-sm" : "border-gray-100 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${rule.isActive ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                <h3 className="font-semibold text-sm text-gray-900">{rule.name}</h3>
              </div>
              <button
                onClick={() => toggleRule(rule.id)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  rule.isActive ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  rule.isActive ? "translate-x-6" : "translate-x-0.5"
                }`} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {/* Trigger */}
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-medium">
                ⚡ {rule.trigger.type.replace(/_/g, " ")}
              </span>
              {/* Conditions */}
              {rule.conditions.map((c, i) => (
                <span key={i} className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-full text-[10px] font-medium">
                  🔀 {c.field} {c.operator} {Array.isArray(c.value) ? c.value.join(",") : c.value}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-1">
              {rule.actions.map((a, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full text-[10px]">
                  → {a.type.replace(/_/g, " ")}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
              <span className="text-[10px] text-gray-400">
                Ejecutada {rule.executionCount}x
              </span>
              <div className="flex gap-2">
                <button className="text-[10px] text-blue-600 font-medium">Editar</button>
                <button className="text-[10px] text-red-500 font-medium">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Nueva Automatización</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Nombre</label>
                <input placeholder="Ej: Auto follow-up si no responde" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Cuando...</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
                  <option value="new_reply">Recibo una respuesta</option>
                  <option value="no_reply_after">No hay respuesta después de X horas</option>
                  <option value="contact_created">Se crea un nuevo contacto</option>
                  <option value="lead_score_above">Lead score sube de X</option>
                  <option value="contact_status_changed">Cambia el estado del contacto</option>
                  <option value="deal_won">Se cierra una venta</option>
                  <option value="deal_lost">Se pierde un deal</option>
                  <option value="tag_added">Se añade un tag</option>
                  <option value="time_based">A cierta hora del día</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Entonces...</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
                  <option value="send_message">Enviar mensaje automático</option>
                  <option value="add_tag">Añadir etiqueta</option>
                  <option value="change_status">Cambiar estado</option>
                  <option value="add_to_campaign">Añadir a campaña</option>
                  <option value="send_notification">Enviar notificación</option>
                  <option value="update_score">Recalcular score</option>
                  <option value="move_pipeline_stage">Mover en pipeline</option>
                  <option value="schedule_follow_up">Programar follow-up</option>
                  <option value="create_task">Crear tarea</option>
                </select>
              </div>
              <Button type="button" onClick={() => setShowCreate(false)} className="w-full py-3">
                Crear Automatización
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
