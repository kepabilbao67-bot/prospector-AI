"use client";

import { useState } from "react";

interface Referral {
  id: string;
  referrer: string;
  referred: string;
  status: "pending" | "converted" | "paid";
  amount: number;
  commission: number;
  date: string;
}

const demoReferrals: Referral[] = [
  { id: "1", referrer: "David Chen", referred: "Sophie Martin", status: "converted", amount: 1200, commission: 120, date: "2026-06-20" },
  { id: "2", referrer: "Carlos García", referred: "Pedro Ruiz", status: "converted", amount: 800, commission: 80, date: "2026-06-15" },
  { id: "3", referrer: "Laura Fernández", referred: "Miguel Torres", status: "pending", amount: 0, commission: 0, date: "2026-06-22" },
  { id: "4", referrer: "Ana Martínez", referred: "Elena Sánchez", status: "paid", amount: 2500, commission: 250, date: "2026-06-10" },
];

export default function ReferralsPage() {
  const [referrals] = useState(demoReferrals);

  const totalCommissions = referrals.filter(r => r.status !== "pending").reduce((s, r) => s + r.commission, 0);
  const converted = referrals.filter(r => r.status !== "pending").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Referidos</h1>
          <p className="text-xs text-gray-500">Tus clientes traen más clientes</p>
        </div>
        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Solicitar referido</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-xl font-semibold text-gray-900">€{totalCommissions}</p>
          <p className="text-[10px] text-gray-500">Comisiones</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-xl font-semibold text-gray-900">{referrals.length}</p>
          <p className="text-[10px] text-gray-500">Total referidos</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-xl font-semibold text-gray-900">{referrals.length > 0 ? Math.round((converted / referrals.length) * 100) : 0}%</p>
          <p className="text-[10px] text-gray-500">Conversión</p>
        </div>
      </div>

      {/* List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-50">
        {referrals.map((ref) => (
          <div key={ref.id} className="px-5 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{ref.referrer} → {ref.referred}</p>
              <p className="text-[11px] text-gray-500">{ref.date}</p>
            </div>
            <div className="text-right">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                ref.status === "converted" ? "bg-green-50 text-green-700" :
                ref.status === "paid" ? "bg-blue-50 text-blue-700" :
                "bg-yellow-50 text-yellow-700"
              }`}>{ref.status === "converted" ? "Convertido" : ref.status === "paid" ? "Pagado" : "Pendiente"}</span>
              {ref.commission > 0 && <p className="text-xs font-medium text-gray-900 mt-0.5">+€{ref.commission}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Message template */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-700 mb-2">Mensaje para pedir referidos</p>
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-600 whitespace-pre-wrap">Hola [nombre],{"\n\n"}Espero que estés satisfecho con el trabajo. Me encantaría saber: ¿conoces a alguien que pueda beneficiarse de algo similar?{"\n\n"}Si me recomiendas y acaba contratando, te ofrezco un 10% de descuento en tu próximo proyecto.{"\n\n"}Sin presión — solo si te viene alguien a la mente.</p>
        </div>
        <button className="w-full py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50">Copiar mensaje</button>
      </div>
    </div>
  );
}
