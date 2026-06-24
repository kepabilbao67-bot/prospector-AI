"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getNetworkIcon } from "@/lib/utils";

type Step = "objective" | "network" | "product" | "tone" | "generating" | "result";

interface WizardData {
  objective: string;
  network: string;
  product: { name: string; description: string; price: string; benefits: string[] };
  tone: string;
  effort: string;
}

interface GeneratedCampaign {
  name: string;
  steps: { type: string; network: string; delayHours: number; description: string }[];
  settings: { dailyLimit: number; startHour: number; endHour: number };
  tips: string[];
  messages: string[];
}

export default function WizardPage() {
  const [step, setStep] = useState<Step>("objective");
  const [data, setData] = useState<WizardData>({
    objective: "",
    network: "",
    product: { name: "", description: "", price: "", benefits: [] },
    tone: "professional",
    effort: "medium",
  });
  const [result, setResult] = useState<GeneratedCampaign | null>(null);
  const [benefitInput, setBenefitInput] = useState("");

  async function generateCampaign() {
    setStep("generating");

    // Generate strategy
    const strategyRes = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_strategy",
        params: {
          network: data.network,
          objective: data.objective,
          product: { name: data.product.name, price: data.product.price },
          dailyBudgetTime: data.effort,
        },
      }),
    });
    const strategy = await strategyRes.json();

    // Generate messages for each message step
    const messages: string[] = [];
    const messageTypes = ["first_message", "follow_up", "proposal"];

    for (let i = 0; i < 3; i++) {
      const msgRes = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_message",
          context: {
            contact: { firstName: "{{nombre}}", company: "{{empresa}}", jobTitle: "{{cargo}}", network: data.network },
            product: data.product.name ? data.product : undefined,
            tone: data.tone,
            language: "es",
            messageType: messageTypes[i],
          },
        }),
      });
      const msg = await msgRes.json();
      messages.push(msg.message);
    }

    setResult({ ...strategy, messages });
    setStep("result");
  }

  async function saveCampaign() {
    if (!result) return;

    await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: result.name,
        description: `Generada por IA - ${data.objective}`,
        network: data.network,
        settings: result.settings,
        steps: result.steps.map((s) => ({
          type: s.type,
          network: s.network,
          delayHours: s.delayHours,
          config: { description: s.description },
        })),
      }),
    });

    alert("¡Campaña creada exitosamente! 🎉");
  }

  function addBenefit() {
    if (benefitInput.trim()) {
      setData({
        ...data,
        product: { ...data.product, benefits: [...data.product.benefits, benefitInput.trim()] },
      });
      setBenefitInput("");
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {["objective", "network", "product", "tone", "result"].map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              ["objective", "network", "product", "tone", "generating", "result"].indexOf(step) >= i
                ? "bg-blue-600"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Step: Objective */}
      {step === "objective" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="text-center mb-6">
            <span className="text-4xl mb-3 block">🎯</span>
            <h2 className="text-xl font-bold text-gray-900">¿Qué quieres lograr?</h2>
            <p className="text-sm text-gray-500 mt-1">La IA creará la campaña perfecta para ti</p>
          </div>
          <div className="space-y-3">
            {[
              { id: "get_clients", icon: "🤝", title: "Conseguir clientes", desc: "Prospección activa para cerrar ventas" },
              { id: "sell_product", icon: "🛍️", title: "Vender un producto/servicio", desc: "Promocionar algo específico" },
              { id: "grow_network", icon: "📈", title: "Crecer mi red", desc: "Más seguidores y conexiones" },
              { id: "brand_awareness", icon: "⭐", title: "Dar a conocer mi marca", desc: "Visibilidad y reconocimiento" },
            ].map((obj) => (
              <button
                key={obj.id}
                onClick={() => { setData({ ...data, objective: obj.id }); setStep("network"); }}
                className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 active:scale-[0.98] transition-all ${
                  data.objective === obj.id ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <span className="text-3xl">{obj.icon}</span>
                <div>
                  <p className="font-semibold text-gray-900">{obj.title}</p>
                  <p className="text-xs text-gray-500">{obj.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step: Network */}
      {step === "network" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="text-center mb-6">
            <span className="text-4xl mb-3 block">🌐</span>
            <h2 className="text-xl font-bold text-gray-900">¿En qué red social?</h2>
            <p className="text-sm text-gray-500 mt-1">Elige dónde están tus clientes</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: "linkedin", name: "LinkedIn", desc: "B2B, profesionales" },
              { id: "fiverr", name: "Fiverr", desc: "Freelance, servicios" },
              { id: "instagram", name: "Instagram", desc: "Visual, lifestyle" },
              { id: "twitter", name: "Twitter/X", desc: "Tech, opinión" },
              { id: "facebook", name: "Facebook", desc: "Local, grupos" },
              { id: "email", name: "Email", desc: "Directo, formal" },
              { id: "whatsapp", name: "WhatsApp", desc: "Personal, rápido" },
              { id: "tiktok", name: "TikTok", desc: "Joven, viral" },
            ].map((net) => (
              <button
                key={net.id}
                onClick={() => { setData({ ...data, network: net.id }); setStep("product"); }}
                className={`p-4 rounded-2xl border-2 text-center active:scale-95 transition-all ${
                  data.network === net.id ? "border-blue-500 bg-blue-50" : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <span className="text-2xl block mb-1">{getNetworkIcon(net.id)}</span>
                <p className="font-semibold text-sm text-gray-900">{net.name}</p>
                <p className="text-[10px] text-gray-500">{net.desc}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setStep("objective")} className="text-sm text-gray-500 w-full text-center mt-2">← Atrás</button>
        </div>
      )}

      {/* Step: Product */}
      {step === "product" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="text-center mb-4">
            <span className="text-4xl mb-3 block">🛍️</span>
            <h2 className="text-xl font-bold text-gray-900">¿Qué vendes?</h2>
            <p className="text-sm text-gray-500 mt-1">Cuéntale a la IA sobre tu producto/servicio</p>
          </div>
          <div className="space-y-3">
            <input
              placeholder="Nombre del producto/servicio *"
              value={data.product.name}
              onChange={(e) => setData({ ...data, product: { ...data.product, name: e.target.value } })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Descripción breve..."
              value={data.product.description}
              onChange={(e) => setData({ ...data, product: { ...data.product, description: e.target.value } })}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              placeholder="Precio (ej: 497€, desde 99€/mes)"
              value={data.product.price}
              onChange={(e) => setData({ ...data, product: { ...data.product, price: e.target.value } })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div>
              <div className="flex gap-2">
                <input
                  placeholder="Añadir beneficio..."
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addBenefit()}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button onClick={addBenefit} className="px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium active:scale-95">+</button>
              </div>
              {data.product.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.product.benefits.map((b, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">✓ {b}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep("network")} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">← Atrás</button>
            <button onClick={() => setStep("tone")} className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium active:scale-95">
              {data.product.name ? "Siguiente →" : "Omitir →"}
            </button>
          </div>
        </div>
      )}

      {/* Step: Tone & Effort */}
      {step === "tone" && (
        <div className="space-y-5 animate-in fade-in">
          <div className="text-center mb-4">
            <span className="text-4xl mb-3 block">🎨</span>
            <h2 className="text-xl font-bold text-gray-900">Últimos ajustes</h2>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Tono de los mensajes</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "professional", label: "Profesional", icon: "👔" },
                { id: "casual", label: "Casual", icon: "😎" },
                { id: "friendly", label: "Amigable", icon: "🤗" },
                { id: "direct", label: "Directo", icon: "🎯" },
                { id: "creative", label: "Creativo", icon: "🎨" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setData({ ...data, tone: t.id })}
                  className={`p-3 rounded-xl border-2 text-center active:scale-95 transition-all ${
                    data.tone === t.id ? "border-blue-500 bg-blue-50" : "border-gray-100"
                  }`}
                >
                  <span className="text-xl block">{t.icon}</span>
                  <span className="text-[11px] font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">¿Cuánto esfuerzo diario?</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "low", label: "Poco", desc: "10 acciones/día", icon: "🐢" },
                { id: "medium", label: "Medio", desc: "25 acciones/día", icon: "🚶" },
                { id: "high", label: "Mucho", desc: "50 acciones/día", icon: "🚀" },
              ].map((e) => (
                <button
                  key={e.id}
                  onClick={() => setData({ ...data, effort: e.id })}
                  className={`p-3 rounded-xl border-2 text-center active:scale-95 transition-all ${
                    data.effort === e.id ? "border-blue-500 bg-blue-50" : "border-gray-100"
                  }`}
                >
                  <span className="text-xl block">{e.icon}</span>
                  <span className="text-[11px] font-medium block">{e.label}</span>
                  <span className="text-[10px] text-gray-500">{e.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep("product")} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">← Atrás</button>
            <button onClick={generateCampaign} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold active:scale-95 shadow-lg">
              ✨ Generar con IA
            </button>
          </div>
        </div>
      )}

      {/* Step: Generating */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 animate-in fade-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse flex items-center justify-center">
              <span className="text-3xl">✨</span>
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-blue-300 animate-spin border-t-transparent" />
          </div>
          <p className="text-lg font-bold text-gray-900">La IA está creando tu campaña...</p>
          <p className="text-sm text-gray-500">Generando estrategia, mensajes y secuencia</p>
        </div>
      )}

      {/* Step: Result */}
      {step === "result" && result && (
        <div className="space-y-5 animate-in fade-in">
          <div className="text-center">
            <span className="text-4xl mb-2 block">🎉</span>
            <h2 className="text-xl font-bold text-gray-900">¡Campaña Lista!</h2>
            <p className="text-sm text-gray-500">{result.name}</p>
          </div>

          {/* Strategy */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-3">📋 Secuencia ({result.steps.length} pasos)</h3>
            <div className="space-y-2">
              {result.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{s.description}</p>
                    {s.delayHours > 0 && <p className="text-[10px] text-gray-400">Esperar {s.delayHours}h</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Messages */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-3">💬 Mensajes Generados</h3>
            <div className="space-y-3">
              {result.messages.map((msg, i) => (
                <div key={i} className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-[10px] font-medium text-blue-600 mb-1">
                    {i === 0 ? "Primer contacto" : i === 1 ? "Follow-up" : "Propuesta"}
                  </p>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap">{msg}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          {result.tips.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <h3 className="font-bold text-sm text-yellow-900 mb-2">💡 Tips de la IA</h3>
              <ul className="space-y-1">
                {result.tips.map((tip, i) => (
                  <li key={i} className="text-xs text-yellow-800">• {tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Settings */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-sm text-gray-900 mb-2">⚙️ Configuración</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900">{result.settings.dailyLimit}</p>
                <p className="text-[10px] text-gray-500">acciones/día</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{result.settings.startHour}:00</p>
                <p className="text-[10px] text-gray-500">hora inicio</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{result.settings.endHour}:00</p>
                <p className="text-[10px] text-gray-500">hora fin</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={saveCampaign} className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold active:scale-95 shadow-lg shadow-blue-200 transition-all">
              🚀 Activar Campaña
            </button>
            <button onClick={() => setStep("objective")} className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">
              Crear otra campaña
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
