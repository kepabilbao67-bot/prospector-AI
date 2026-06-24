"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getNetworkIcon } from "@/lib/utils";

interface NetworkConfig {
  id: string;
  name: string;
  network: string;
  isConnected: boolean;
  dailyLimit: number;
  description: string;
  features: string[];
}

const networkConfigs: NetworkConfig[] = [
  {
    id: "linkedin",
    name: "LinkedIn",
    network: "linkedin",
    isConnected: true,
    dailyLimit: 30,
    description: "Conexiones, mensajes y visitas de perfil automatizadas",
    features: ["Envío de conexiones", "Mensajes InMail", "Visitas de perfil", "Seguimiento", "Extracción de datos"],
  },
  {
    id: "fiverr",
    name: "Fiverr",
    network: "fiverr",
    isConnected: true,
    dailyLimit: 20,
    description: "Propuestas y mensajes automatizados a compradores",
    features: ["Propuestas automáticas", "Mensajes a compradores", "Seguimiento de proyectos", "Templates de oferta"],
  },
  {
    id: "twitter",
    name: "Twitter / X",
    network: "twitter",
    isConnected: true,
    dailyLimit: 50,
    description: "DMs, follows y engagement automatizado",
    features: ["Mensajes directos", "Follow/Unfollow", "Likes automáticos", "Respuestas", "Monitoreo de menciones"],
  },
  {
    id: "instagram",
    name: "Instagram",
    network: "instagram",
    isConnected: false,
    dailyLimit: 40,
    description: "DMs, follows y engagement en Instagram",
    features: ["Mensajes directos", "Follows", "Likes", "Comentarios", "Story views"],
  },
  {
    id: "email",
    name: "Email (SMTP)",
    network: "email",
    isConnected: true,
    dailyLimit: 100,
    description: "Cold emails con seguimiento automático",
    features: ["Envío masivo", "Tracking de apertura", "Seguimiento automático", "A/B Testing", "Personalización"],
  },
];

export default function SettingsPage() {
  const [configs, setConfigs] = useState(networkConfigs);
  const [activeTab, setActiveTab] = useState("networks");

  function toggleConnection(id: string) {
    setConfigs(configs.map((c) => (c.id === id ? { ...c, isConnected: !c.isConnected } : c)));
  }

  function updateLimit(id: string, limit: number) {
    setConfigs(configs.map((c) => (c.id === id ? { ...c, dailyLimit: limit } : c)));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Gestiona tus redes sociales y preferencias</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: "networks", label: "Redes Sociales" },
          { id: "automation", label: "Automatización" },
          { id: "safety", label: "Seguridad" },
          { id: "account", label: "Cuenta" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Networks Tab */}
      {activeTab === "networks" && (
        <div className="space-y-4">
          {configs.map((config) => (
            <div key={config.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getNetworkIcon(config.network)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{config.name}</h3>
                    <p className="text-sm text-gray-500">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <label className="text-xs text-gray-500 block mb-1">Límite diario</label>
                    <input
                      type="number"
                      value={config.dailyLimit}
                      onChange={(e) => updateLimit(config.id, parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border rounded text-sm text-center"
                    />
                  </div>
                  <button
                    onClick={() => toggleConnection(config.id)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      config.isConnected ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                        config.isConnected ? "translate-x-7" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {config.features.map((feature) => (
                  <span key={feature} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Automation Tab */}
      {activeTab === "automation" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h3 className="font-semibold text-gray-900 text-lg">Configuración de Automatización</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Horas de actividad</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={9} min={0} max={23} className="w-20 px-3 py-2 border rounded-lg text-sm" />
                <span className="text-gray-500">a</span>
                <input type="number" defaultValue={18} min={0} max={23} className="w-20 px-3 py-2 border rounded-lg text-sm" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Las acciones solo se ejecutarán en este horario</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Zona horaria</label>
              <select className="w-full px-3 py-2 border rounded-lg text-sm">
                <option>Europe/Madrid (UTC+2)</option>
                <option>America/New_York (UTC-5)</option>
                <option>America/Los_Angeles (UTC-8)</option>
                <option>Asia/Tokyo (UTC+9)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delay mínimo entre acciones</label>
              <div className="flex items-center gap-2">
                <input type="number" defaultValue={30} className="w-20 px-3 py-2 border rounded-lg text-sm" />
                <span className="text-sm text-gray-500">segundos</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Factor de aleatoriedad</label>
              <input type="range" min={0} max={100} defaultValue={50} className="w-full" />
              <p className="text-xs text-gray-400 mt-1">Mayor aleatoriedad = más humano, más lento</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Días de actividad</label>
              <div className="flex gap-2">
                {["L", "M", "X", "J", "V", "S", "D"].map((day, i) => (
                  <button
                    key={day}
                    className={`w-9 h-9 rounded-full text-sm font-medium ${
                      i < 5 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reintentos máximos</label>
              <input type="number" defaultValue={3} min={0} max={10} className="w-20 px-3 py-2 border rounded-lg text-sm" />
              <p className="text-xs text-gray-400 mt-1">Intentos antes de marcar como fallida</p>
            </div>
          </div>

          <Button>Guardar Configuración</Button>
        </div>
      )}

      {/* Safety Tab */}
      {activeTab === "safety" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h3 className="font-semibold text-gray-900 text-lg">Protección Anti-Ban</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900">✅ Delays Humanizados</h4>
              <p className="text-sm text-green-700 mt-1">Los tiempos entre acciones varían aleatoriamente para simular comportamiento humano.</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900">✅ Límites Diarios</h4>
              <p className="text-sm text-green-700 mt-1">Cada red tiene un límite de acciones diarias que no se puede exceder.</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900">✅ Horario Laboral</h4>
              <p className="text-sm text-green-700 mt-1">Las acciones solo se ejecutan en horario configurable.</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900">✅ Warm-up Gradual</h4>
              <p className="text-sm text-green-700 mt-1">Las cuentas nuevas empiezan con límites bajos que se incrementan gradualmente.</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-900">⚠️ Rotación de IP</h4>
              <p className="text-sm text-yellow-700 mt-1">Recomendado: usar proxies residenciales para cada cuenta. Configurar en la extensión.</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">📊 Estado de Seguridad</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">Bajo</p>
                <p className="text-xs text-gray-500">Riesgo Actual</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">0</p>
                <p className="text-xs text-gray-500">Warnings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">100%</p>
                <p className="text-xs text-gray-500">Uptime</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Tab */}
      {activeTab === "account" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <h3 className="font-semibold text-gray-900 text-lg">Mi Cuenta</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input defaultValue="Demo User" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input defaultValue="demo@prospector.ai" type="email" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium">Plan Pro</span>
                <span className="text-sm text-gray-500">Todas las funciones desbloqueadas</span>
              </div>
            </div>
            <Button>Guardar Cambios</Button>
          </div>
        </div>
      )}
    </div>
  );
}
