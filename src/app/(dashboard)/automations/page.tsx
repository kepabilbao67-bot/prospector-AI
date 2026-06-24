"use client";

import { useState } from "react";
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
          <h1 className="text-lg font-semibold text-gray-900">Automatizaciones</h1>
          <p className="text-xs text-gray-500">{activeCount} activas · {totalExecutions} ejecuciones</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Nueva regla</button>
      </div>

      {/* Rules */}
      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className={`bg-white border rounded-lg p-4 ${rule.isActive ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${rule.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                <p className="text-sm font-medium text-gray-900">{rule.name}</p>
              </div>
              <button onClick={() => toggleRule(rule.id)}
                className={`relative w-9 h-5 rounded-full transition-colors ${rule.isActive ? "bg-gray-900" : "bg-gray-300"}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium">
                Trigger: {rule.trigger.type.replace(/_/g, " ")}
              </span>
              {rule.conditions.map((c, i) => (
                <span key={i} className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-[10px] font-medium">
                  Si: {c.field} {c.operator} {Array.isArray(c.value) ? c.value.join(", ") : String(c.value)}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-1">
              {rule.actions.map((a, i) => (
                <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px]">
                  → {a.type.replace(/_/g, " ")}
                </span>
              ))}
            </div>

            <p className="text-[10px] text-gray-400 mt-2">Ejecutada {rule.executionCount} veces</p>
          </div>
        ))}
      </div>

      {/* Create */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Nueva automatización</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <form className="space-y-3">
              <input placeholder="Nombre de la regla" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Cuando...</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none">
                  <option value="new_reply">Recibo una respuesta</option>
                  <option value="no_reply_after">No hay respuesta después de X horas</option>
                  <option value="contact_created">Se crea un nuevo contacto</option>
                  <option value="lead_score_above">Lead score sube de X</option>
                  <option value="deal_won">Se cierra una venta</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">Entonces...</label>
                <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none">
                  <option value="send_message">Enviar mensaje</option>
                  <option value="send_notification">Enviar notificación</option>
                  <option value="change_status">Cambiar estado</option>
                  <option value="add_to_campaign">Añadir a campaña</option>
                  <option value="add_tag">Añadir etiqueta</option>
                  <option value="update_score">Recalcular score</option>
                </select>
              </div>
              <button type="button" onClick={() => setShowCreate(false)} className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">Crear</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
