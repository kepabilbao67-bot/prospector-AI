"use client";

import { useState } from "react";
import { getNetworkIcon } from "@/lib/utils";
import { generateWarmupPlan, getWarmupStatus } from "@/lib/warmup";

interface AccountStatus {
  network: string;
  name: string;
  daysActive: number;
  isNew: boolean;
}

const accounts: AccountStatus[] = [
  { network: "linkedin", name: "Mi LinkedIn", daysActive: 45, isNew: false },
  { network: "fiverr", name: "Mi Fiverr", daysActive: 30, isNew: false },
  { network: "instagram", name: "@mi_negocio", daysActive: 5, isNew: true },
  { network: "email", name: "ventas@midominio.com", daysActive: 3, isNew: true },
  { network: "twitter", name: "@mi_marca", daysActive: 60, isNew: false },
];

export default function WarmupPage() {
  const [selectedAccount, setSelectedAccount] = useState<AccountStatus | null>(null);
  const [showPlan, setShowPlan] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Warm-up de Cuentas</h1>
        <p className="text-xs text-gray-500">Protege tus cuentas con calentamiento gradual</p>
      </div>

      {/* Explanation */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white">
        <h3 className="font-bold mb-1">🛡️ ¿Por qué hacer warm-up?</h3>
        <p className="text-xs opacity-90">
          Las redes sociales detectan actividad anormal en cuentas nuevas.
          El warm-up incrementa gradualmente tu actividad durante 21 días para
          parecer un usuario normal y evitar bans o restricciones.
        </p>
      </div>

      {/* Accounts */}
      <div className="space-y-3">
        {accounts.map((account) => {
          const status = getWarmupStatus(account.network, account.daysActive);
          return (
            <div
              key={account.network}
              onClick={() => { setSelectedAccount(account); setShowPlan(true); }}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getNetworkIcon(account.network)}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{account.name}</p>
                    <p className="text-xs text-gray-500">{account.daysActive} días activa</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  status.phase === "ready"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}>
                  {status.phase === "ready" ? "✅ Lista" : `🔥 ${status.progress}%`}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    status.phase === "ready" ? "bg-green-500" : "bg-orange-500"
                  }`}
                  style={{ width: `${status.progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[10px] text-gray-500">{status.nextMilestone}</p>
                <p className="text-xs font-medium text-blue-600">Límite: {status.currentLimit}/día</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan detail modal */}
      {showPlan && selectedAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getNetworkIcon(selectedAccount.network)}</span>
                <h2 className="text-lg font-bold">Plan de Warm-up</h2>
              </div>
              <button onClick={() => setShowPlan(false)} className="text-gray-400 text-2xl">×</button>
            </div>

            <div className="space-y-3">
              {generateWarmupPlan(selectedAccount.network, 21)
                .filter((_, i) => i < 7 || i === 13 || i === 20) // Show key days
                .map((plan) => (
                  <div
                    key={plan.day}
                    className={`p-3 rounded-xl border ${
                      plan.day <= selectedAccount.daysActive
                        ? "border-green-200 bg-green-50"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          plan.day <= selectedAccount.daysActive
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}>
                          {plan.day <= selectedAccount.daysActive ? "✓" : plan.day}
                        </span>
                        <span className="text-sm font-medium">Día {plan.day}</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600">{plan.dailyLimit} acciones/día</span>
                    </div>
                    <ul className="ml-8 space-y-0.5">
                      {plan.actions.map((a, i) => (
                        <li key={i} className="text-xs text-gray-600">• {a}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] text-gray-400 ml-8 mt-1">💡 {plan.tips}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
