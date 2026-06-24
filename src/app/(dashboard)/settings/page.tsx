"use client";

import { useState } from "react";

const networkLabels: Record<string, string> = {
  linkedin: "LinkedIn", fiverr: "Fiverr", twitter: "Twitter/X", instagram: "Instagram", email: "Email (SMTP)", whatsapp: "WhatsApp", tiktok: "TikTok", facebook: "Facebook",
};

interface NetworkConfig {
  id: string;
  name: string;
  isConnected: boolean;
  dailyLimit: number;
}

const defaultNetworks: NetworkConfig[] = [
  { id: "linkedin", name: "LinkedIn", isConnected: true, dailyLimit: 30 },
  { id: "fiverr", name: "Fiverr", isConnected: true, dailyLimit: 20 },
  { id: "twitter", name: "Twitter/X", isConnected: true, dailyLimit: 50 },
  { id: "instagram", name: "Instagram", isConnected: false, dailyLimit: 40 },
  { id: "email", name: "Email (SMTP)", isConnected: true, dailyLimit: 100 },
  { id: "whatsapp", name: "WhatsApp", isConnected: false, dailyLimit: 30 },
  { id: "tiktok", name: "TikTok", isConnected: false, dailyLimit: 30 },
  { id: "facebook", name: "Facebook", isConnected: false, dailyLimit: 30 },
];

export default function SettingsPage() {
  const [networks, setNetworks] = useState(defaultNetworks);
  const [tab, setTab] = useState("networks");

  function toggleNetwork(id: string) {
    setNetworks(networks.map(n => n.id === id ? { ...n, isConnected: !n.isConnected } : n));
  }

  function updateLimit(id: string, limit: number) {
    setNetworks(networks.map(n => n.id === id ? { ...n, dailyLimit: limit } : n));
  }

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-semibold text-gray-900">Configuración</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: "networks", label: "Redes" },
          { id: "automation", label: "Automatización" },
          { id: "safety", label: "Seguridad" },
          { id: "account", label: "Cuenta" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Networks */}
      {tab === "networks" && (
        <div className="space-y-3">
          {networks.map((network) => (
            <div key={network.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{network.name}</p>
                <p className="text-[11px] text-gray-500">Límite: {network.dailyLimit} acciones/día</p>
              </div>
              <div className="flex items-center gap-3">
                <input type="number" value={network.dailyLimit} onChange={(e) => updateLimit(network.id, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1.5 border border-gray-200 rounded text-xs text-center outline-none focus:ring-1 focus:ring-gray-900" />
                <button onClick={() => toggleNetwork(network.id)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${network.isConnected ? "bg-gray-900" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${network.isConnected ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Automation */}
      {tab === "automation" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Horas de actividad</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={9} min={0} max={23} className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                <span className="text-xs text-gray-500">a</span>
                <input type="number" defaultValue={18} min={0} max={23} className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Zona horaria</label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none">
                <option>Europe/Madrid (UTC+2)</option>
                <option>America/New_York (UTC-5)</option>
                <option>America/Los_Angeles (UTC-8)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Delay mínimo entre acciones</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={30} className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
                <span className="text-xs text-gray-500">segundos</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1.5">Reintentos máximos</label>
              <input type="number" defaultValue={3} min={0} max={10} className="w-16 px-2 py-2 border border-gray-200 rounded-lg text-sm outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1.5">Días activos</label>
            <div className="flex gap-1.5">
              {["L", "M", "X", "J", "V", "S", "D"].map((day, i) => (
                <button key={day} className={`w-8 h-8 rounded-md text-xs font-medium ${i < 5 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}>{day}</button>
              ))}
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Guardar</button>
        </div>
      )}

      {/* Safety */}
      {tab === "safety" && (
        <div className="space-y-3">
          {[
            { title: "Delays humanizados", desc: "Tiempos aleatorios entre acciones para simular comportamiento humano", active: true },
            { title: "Límites diarios estrictos", desc: "Nunca se excede el límite configurado por red", active: true },
            { title: "Horario laboral", desc: "Acciones solo en horario configurado", active: true },
            { title: "Warm-up gradual", desc: "Cuentas nuevas empiezan con límites bajos", active: true },
            { title: "Detección de bloqueos", desc: "Pausa automática si se detecta un warning", active: true },
          ].map((item) => (
            <div key={item.title} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-[11px] text-gray-500">{item.desc}</p>
              </div>
              <div className={`w-2 h-2 rounded-full ${item.active ? "bg-green-500" : "bg-gray-300"}`} />
            </div>
          ))}
        </div>
      )}

      {/* Account */}
      {tab === "account" && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1.5">Nombre</label>
            <input defaultValue="Demo User" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1.5">Email</label>
            <input defaultValue="demo@prospector.ai" type="email" className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-gray-900" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1.5">Plan</label>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-medium">Pro</span>
              <span className="text-xs text-gray-500">Todas las funciones activas</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium">Guardar</button>
        </div>
      )}
    </div>
  );
}
