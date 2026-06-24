"use client";

import { useState } from "react";
import { getNetworkIcon } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Sale {
  id: string;
  contactName: string;
  network: string;
  amount: number;
  currency: string;
  type: "one_time" | "recurring" | "upsell";
  description: string;
  campaign: string;
  closedAt: string;
}

const demoSales: Sale[] = [
  { id: "1", contactName: "David Chen", network: "linkedin", amount: 5000, currency: "€", type: "one_time", description: "Desarrollo web completo", campaign: "LinkedIn Outreach", closedAt: "2026-06-20" },
  { id: "2", contactName: "Elena Sánchez", network: "instagram", amount: 1800, currency: "€", type: "one_time", description: "Branding + Social Media", campaign: "Instagram DM", closedAt: "2026-06-18" },
  { id: "3", contactName: "buyer_premium", network: "fiverr", amount: 750, currency: "$", type: "one_time", description: "E-commerce redesign", campaign: "Fiverr Proposals", closedAt: "2026-06-15" },
  { id: "4", contactName: "Laura Fernández", network: "email", amount: 299, currency: "€", type: "recurring", description: "Gestión RRSS mensual", campaign: "Cold Email", closedAt: "2026-06-12" },
  { id: "5", contactName: "Carlos García", network: "linkedin", amount: 2500, currency: "€", type: "one_time", description: "Consultoría estratégica", campaign: "LinkedIn Outreach", closedAt: "2026-06-08" },
  { id: "6", contactName: "proyecto_app", network: "fiverr", amount: 1200, currency: "$", type: "one_time", description: "App mobile MVP", campaign: "Fiverr Proposals", closedAt: "2026-06-05" },
  { id: "7", contactName: "Miguel Torres", network: "linkedin", amount: 500, currency: "€", type: "recurring", description: "Maintenance mensual", campaign: "LinkedIn Outreach", closedAt: "2026-06-01" },
];

export default function RevenuePage() {
  const [sales] = useState<Sale[]>(demoSales);
  const [showAdd, setShowAdd] = useState(false);
  const [period, setPeriod] = useState<"week" | "month" | "all">("month");

  const totalRevenue = sales.reduce((s, sale) => s + sale.amount, 0);
  const recurringRevenue = sales.filter(s => s.type === "recurring").reduce((sum, s) => sum + s.amount, 0);
  const avgDeal = sales.length > 0 ? Math.round(totalRevenue / sales.length) : 0;
  const totalDeals = sales.length;

  // Revenue by network
  const byNetwork: Record<string, number> = {};
  sales.forEach(s => { byNetwork[s.network] = (byNetwork[s.network] || 0) + s.amount; });
  const sortedNetworks = Object.entries(byNetwork).sort((a, b) => b[1] - a[1]);

  // Revenue by campaign
  const byCampaign: Record<string, { amount: number; deals: number }> = {};
  sales.forEach(s => {
    if (!byCampaign[s.campaign]) byCampaign[s.campaign] = { amount: 0, deals: 0 };
    byCampaign[s.campaign].amount += s.amount;
    byCampaign[s.campaign].deals += 1;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Ingresos</h1>
          <p className="text-xs text-gray-500">Tracking de ventas y ROI</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>+ Registrar Venta</Button>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-4 text-white">
          <p className="text-xs opacity-80">Ingresos Total</p>
          <p className="text-2xl font-bold mt-1">€{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
          <p className="text-xs opacity-80">Recurrente/mes</p>
          <p className="text-2xl font-bold mt-1">€{recurringRevenue}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
          <p className="text-xs opacity-80">Ticket Medio</p>
          <p className="text-2xl font-bold mt-1">€{avgDeal}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
          <p className="text-xs opacity-80">Ventas Cerradas</p>
          <p className="text-2xl font-bold mt-1">{totalDeals}</p>
        </div>
      </div>

      {/* ROI Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">📊 ROI de ProspectorAI</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${Math.min((totalRevenue / 50) * 100, 100)}%` }} />
            </div>
          </div>
          <span className="text-2xl font-bold text-emerald-600">{Math.round(((totalRevenue - 50) / 50) * 100)}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Invertiste ~€50/mes en la herramienta → Generaste €{totalRevenue.toLocaleString()} → ROI: {Math.round(((totalRevenue - 50) / 50) * 100)}%
        </p>
      </div>

      {/* Revenue by Network */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">💰 Ingresos por Red</h3>
        <div className="space-y-3">
          {sortedNetworks.map(([network, amount]) => (
            <div key={network} className="flex items-center gap-3">
              <span className="text-xl">{getNetworkIcon(network)}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium capitalize">{network}</span>
                  <span className="font-bold text-gray-900">€{amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(amount / totalRevenue) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue by Campaign */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">🚀 Ingresos por Campaña</h3>
        <div className="space-y-2">
          {Object.entries(byCampaign).sort((a, b) => b[1].amount - a[1].amount).map(([campaign, data]) => (
            <div key={campaign} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">{campaign}</p>
                <p className="text-xs text-gray-500">{data.deals} ventas</p>
              </div>
              <p className="font-bold text-green-600">€{data.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">🎉 Ventas Recientes</h3>
        <div className="space-y-2">
          {sales.slice(0, 5).map(sale => (
            <div key={sale.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-xl">{getNetworkIcon(sale.network)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{sale.contactName}</p>
                <p className="text-xs text-gray-500 truncate">{sale.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-green-600">{sale.currency}{sale.amount.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">{sale.closedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Sale Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl md:rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Registrar Venta</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 text-2xl">×</button>
            </div>
            <form className="space-y-3">
              <input placeholder="Nombre del cliente *" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <input placeholder="Descripción del servicio *" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Importe (€) *" type="number" className="px-4 py-3 border border-gray-200 rounded-xl text-sm" />
                <select className="px-4 py-3 border border-gray-200 rounded-xl text-sm">
                  <option value="one_time">Pago único</option>
                  <option value="recurring">Recurrente</option>
                  <option value="upsell">Upsell</option>
                </select>
              </div>
              <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm">
                <option value="linkedin">💼 LinkedIn</option>
                <option value="fiverr">🟢 Fiverr</option>
                <option value="instagram">📸 Instagram</option>
                <option value="email">📧 Email</option>
                <option value="twitter">🐦 Twitter</option>
                <option value="other">🌐 Otro</option>
              </select>
              <Button type="button" onClick={() => setShowAdd(false)} className="w-full py-3">
                💰 Registrar Venta
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
