"use client";

import { useState } from "react";
import { generateWarmupPlan, getWarmupStatus } from "@/lib/warmup";

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", instagram: "Instagram", email: "Email", twitter: "Twitter",
};

interface Account {
  network: string;
  name: string;
  daysActive: number;
}

const accounts: Account[] = [
  { network: "linkedin", name: "Mi LinkedIn", daysActive: 45 },
  { network: "fiverr", name: "Mi Fiverr", daysActive: 30 },
  { network: "instagram", name: "@mi_negocio", daysActive: 5 },
  { network: "email", name: "ventas@midominio.com", daysActive: 3 },
  { network: "twitter", name: "@mi_marca", daysActive: 60 },
];

export default function WarmupPage() {
  const [selected, setSelected] = useState<Account | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Warm-up</h1>
        <p className="text-xs text-gray-500">Calentamiento gradual de cuentas para evitar restricciones</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-700 mb-1">Cómo funciona</p>
        <p className="text-[11px] text-gray-500">Las redes detectan actividad anormal en cuentas nuevas. El warm-up incrementa gradualmente tu actividad durante 21 días para parecer un usuario normal.</p>
      </div>

      {/* Accounts */}
      <div className="space-y-2">
        {accounts.map((account) => {
          const status = getWarmupStatus(account.network, account.daysActive);
          return (
            <button key={account.network} onClick={() => setSelected(account)}
              className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{account.name}</p>
                  <p className="text-[11px] text-gray-500">{networkLabels[account.network]} · {account.daysActive} días activa</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                  status.phase === "ready" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                }`}>
                  {status.phase === "ready" ? "Lista" : `${status.progress}%`}
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${status.phase === "ready" ? "bg-green-500" : "bg-yellow-500"}`} style={{ width: `${status.progress}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">Límite actual: {status.currentLimit}/día · {status.nextMilestone}</p>
            </button>
          );
        })}
      </div>

      {/* Detail */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Plan de warm-up: {networkLabels[selected.network]}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 text-xl">×</button>
            </div>
            <div className="space-y-2">
              {generateWarmupPlan(selected.network, 21)
                .filter((_, i) => i < 7 || i === 13 || i === 20)
                .map((plan) => (
                  <div key={plan.day} className={`p-3 rounded-lg border ${plan.day <= selected.daysActive ? "border-green-200 bg-green-50" : "border-gray-200"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700">Día {plan.day}</span>
                      <span className="text-xs text-gray-500">{plan.dailyLimit} acciones/día</span>
                    </div>
                    <ul className="space-y-0.5">
                      {plan.actions.map((a, i) => <li key={i} className="text-[11px] text-gray-600">· {a}</li>)}
                    </ul>
                    <p className="text-[10px] text-gray-400 mt-1">{plan.tips}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
