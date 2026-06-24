"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Referral {
  id: string;
  referrerName: string;
  referredName: string;
  status: "pending" | "converted" | "paid";
  amount: number;
  commission: number;
  date: string;
}

const demoReferrals: Referral[] = [
  { id: "1", referrerName: "David Chen", referredName: "Sophie Martin", status: "converted", amount: 1200, commission: 120, date: "2026-06-20" },
  { id: "2", referrerName: "Carlos García", referredName: "Pedro Ruiz", status: "converted", amount: 800, commission: 80, date: "2026-06-15" },
  { id: "3", referrerName: "Laura Fernández", referredName: "Miguel Torres", status: "pending", amount: 0, commission: 0, date: "2026-06-22" },
  { id: "4", referrerName: "Ana Martínez", referredName: "Elena Sánchez", status: "paid", amount: 2500, commission: 250, date: "2026-06-10" },
];

export default function ReferralsPage() {
  const [referrals] = useState(demoReferrals);
  const [showCreate, setShowCreate] = useState(false);

  const totalCommissions = referrals.filter(r => r.status !== "pending").reduce((s, r) => s + r.commission, 0);
  const totalReferred = referrals.length;
  const converted = referrals.filter(r => r.status === "converted" || r.status === "paid").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Programa de Referidos</h1>
          <p className="text-xs text-gray-500">Tus clientes te traen más clientes</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>+ Pedir Referido</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white text-center">
          <p className="text-2xl font-bold">€{totalCommissions}</p>
          <p className="text-[10px] opacity-80">Comisiones ganadas</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white text-center">
          <p className="text-2xl font-bold">{totalReferred}</p>
          <p className="text-[10px] opacity-80">Referidos totales</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white text-center">
          <p className="text-2xl font-bold">{Math.round((converted / totalReferred) * 100)}%</p>
          <p className="text-[10px] opacity-80">Tasa conversión</p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
        <h4 className="font-bold text-yellow-900 text-sm mb-2">💡 Cómo funciona</h4>
        <div className="space-y-1 text-xs text-yellow-800">
          <p>1. Pide referidos a tus clientes satisfechos (la IA genera el mensaje)</p>
          <p>2. Ofrece 10% de comisión por cada referido que convierta</p>
          <p>3. ProspectorAI trackea automáticamente las conversiones</p>
          <p>4. Paga las comisiones y mantén el ciclo</p>
        </div>
      </div>

      {/* Referral list */}
      <div className="space-y-2">
        {referrals.map((ref) => (
          <div key={ref.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {ref.referrerName} → {ref.referredName}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{ref.date}</p>
              </div>
              <div className="text-right">
                {ref.status === "converted" && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
                    ✅ Convertido
                  </span>
                )}
                {ref.status === "pending" && (
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-medium">
                    ⏳ Pendiente
                  </span>
                )}
                {ref.status === "paid" && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
                    💰 Pagado
                  </span>
                )}
                {ref.commission > 0 && (
                  <p className="text-sm font-bold text-green-600 mt-1">+€{ref.commission}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Message to ask for referrals */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h4 className="font-bold text-sm text-gray-900 mb-3">✨ Mensaje IA para pedir referidos</h4>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-3">
          <p className="text-xs text-gray-700 whitespace-pre-wrap">
{`¡Hola {{nombre}}! 👋

Espero que estés disfrutando de [servicio que le vendiste]. Me encantaría saber: ¿conoces a alguien más que pueda beneficiarse de algo similar?

Si me recomiendas a alguien y acaba contratando, te regalo un 10% de descuento en tu próxima factura (o un bonus de €[comisión]).

Sin presión - solo si te viene alguien a la mente. ¡Gracias por confiar en mí!`}
          </p>
        </div>
        <Button variant="outline" size="sm" className="w-full">📋 Copiar mensaje</Button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Pedir Referido</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <form className="space-y-3">
              <input placeholder="Cliente que refiere *" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <input placeholder="Persona referida (si ya la conoces)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <input placeholder="Comisión ofrecida (€)" type="number" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <Button type="button" onClick={() => setShowCreate(false)} className="w-full py-3">
                Enviar Solicitud de Referido
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
