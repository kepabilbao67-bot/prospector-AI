"use client";

import { useState } from "react";

interface Sale {
  id: string;
  contactName: string;
  network: string;
  amount: number;
  type: "one_time" | "recurring";
  description: string;
  campaign: string;
  closedAt: string;
}

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", instagram: "Instagram", email: "Email", twitter: "Twitter",
};

const demoSales: Sale[] = [
  { id: "1", contactName: "David Chen", network: "linkedin", amount: 5000, type: "one_time", description: "Desarrollo web completo", campaign: "LinkedIn Outreach", closedAt: "2026-06-20" },
  { id: "2", contactName: "Elena Sánchez", network: "instagram", amount: 1800, type: "one_time", description: "Branding + Social Media", campaign: "Instagram DM", closedAt: "2026-06-18" },
  { id: "3", contactName: "buyer_premium", network: "fiverr", amount: 750, type: "one_time", description: "E-commerce redesign", campaign: "Fiverr Proposals", closedAt: "2026-06-15" },
  { id: "4", contactName: "Laura Fernández", network: "email", amount: 299, type: "recurring", description: "Gestión RRSS mensual", campaign: "Cold Email", closedAt: "2026-06-12" },
  { id: "5", contactName: "Carlos García", network: "linkedin", amount: 2500, type: "one_time", description: "Consultoría estratégica", campaign: "LinkedIn Outreach", closedAt: "2026-06-08" },
  { id: "6", contactName: "Miguel Torres", network: "linkedin", amount: 500, type: "recurring", description: "Mantenimiento mensual", campaign: "LinkedIn Outreach", closedAt: "2026-06-01" },
];

export default function RevenuePage() {
  const [sales] = useState(demoSales);
  const [showAdd, setShowAdd] = useState(false);

  const totalRevenue = sales.reduce((s, sale) => s + sale.amount, 0);
  const recurringRevenue = sales.filter(s => s.type === "recurring").reduce((sum, s) => sum + s.amount, 0);
  const avgDeal = sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0;

  const byNetwork: Record<string, number> = {};
  sales.forEach(s => { byNetwork[s.network] = (byNetwork[s.network] || 0) + s.amount; });

  const byCampaign: Record<string, { amount: number; count: number }> = {};
  sales.forEach(s => {
    if (!byCampaign[s.campaign]) byCampaign[s.campaign] = { amount: 0, count: 0 };
    byCampaign[s.campaign].amount += s.amount;
    byCampaign[s.campaign].count += 1;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Ingresos</h1>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Registrar venta</button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-2xl font-semibold text-gray-900">€{totalRevenue.toLocaleString()}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Total facturado</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-2xl font-semibold text-gray-900">€{recurringRevenue}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Recurrente/mes</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-2xl font-semibold text-gray-900">€{avgDeal}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Ticket medio</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-2xl font-semibold text-gray-900">{sales.length}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">Ventas cerradas</p>
        </div>
      </div>

      {/* By network */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">Por red social</p>
        </div>
        <div className="divide-y divide-gray-50">
          {Object.entries(byNetwork).sort((a, b) => b[1] - a[1]).map(([network, amount]) => (
            <div key={network} className="px-5 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-700">{networkLabels[network] || network}</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gray-700 rounded-full" style={{ width: `${(amount / totalRevenue) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900 w-20 text-right">€{amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* By campaign */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">Por campaña</p>
        </div>
        <div className="divide-y divide-gray-50">
          {Object.entries(byCampaign).sort((a, b) => b[1].amount - a[1].amount).map(([campaign, data]) => (
            <div key={campaign} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">{campaign}</p>
                <p className="text-[11px] text-gray-400">{data.count} ventas</p>
              </div>
              <span className="text-sm font-medium text-gray-900">€{data.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">Ventas recientes</p>
        </div>
        <div className="divide-y divide-gray-50">
          {sales.map(sale => (
            <div key={sale.id} className="px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{sale.contactName}</p>
                <p className="text-[11px] text-gray-500">{sale.description} · {networkLabels[sale.network]}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">€{sale.amount.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">{sale.closedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add sale */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-2xl md:rounded-xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Registrar venta</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <form className="space-y-3">
              <input placeholder="Nombre del cliente" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <input placeholder="Descripción del servicio" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Importe (€)" type="number" className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
                <select className="px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900">
                  <option value="one_time">Pago único</option>
                  <option value="recurring">Recurrente</option>
                </select>
              </div>
              <select className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900">
                <option value="linkedin">LinkedIn</option>
                <option value="fiverr">Fiverr</option>
                <option value="instagram">Instagram</option>
                <option value="email">Email</option>
                <option value="twitter">Twitter</option>
              </select>
              <button type="button" onClick={() => setShowAdd(false)} className="w-full py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium">Registrar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
